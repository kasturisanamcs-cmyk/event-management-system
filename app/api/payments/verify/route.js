import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  try {
    // --------------------------------------------------
    // 1. Get logged-in participant
    // --------------------------------------------------

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Read request
    // --------------------------------------------------

    const body = await request.json();

    const {
      registrationId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (
      !registrationId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        {
          error: "Incomplete payment verification data.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Razorpay secret
    // --------------------------------------------------

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        {
          error: "Payment gateway is not configured.",
        },
        { status: 503 }
      );
    }

    const admin = createAdminClient();

    // --------------------------------------------------
    // 4. Load registration
    // --------------------------------------------------

    const { data: registration, error: registrationError } =
      await admin
        .from("registrations")
        .select(`
          id,
          user_id,
          status,
          participation_mode
        `)
        .eq("id", registrationId)
        .single();

    if (registrationError || !registration) {
      console.error(
        "Registration lookup error:",
        registrationError
      );

      return NextResponse.json(
        {
          error: "Registration not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5. Verify participant ownership
    // --------------------------------------------------

    if (registration.user_id !== user.id) {
      return NextResponse.json(
        {
          error:
            "You are not allowed to pay for this registration.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 6. Already confirmed
    // --------------------------------------------------

    if (registration.status === "CONFIRMED") {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        registrationId,
      });
    }

    // --------------------------------------------------
    // 7. Registration must be APPROVED or PENDING
    // --------------------------------------------------

    if (
      registration.status !== "PENDING" &&
      registration.status !== "APPROVED"
    ) {
      return NextResponse.json(
        {
          error: `Online payment is not available for registration status: ${registration.status}.`,
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 8. Must be ONLINE
    // --------------------------------------------------

    if (
      String(registration.participation_mode || "").toUpperCase() !==
      "ONLINE"
    ) {
      return NextResponse.json(
        {
          error:
            "This registration is not configured for online payment.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 9. Find latest ONLINE payment
    // --------------------------------------------------

    const { data: payment, error: paymentError } =
      await admin
        .from("payments")
        .select(`
          id,
          registration_id,
          amount,
          payment_method,
          payment_status,
          gateway_payment_id,
          created_at
        `)
        .eq("registration_id", registrationId)
        .eq("payment_method", "ONLINE")
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (paymentError) {
      console.error(
        "Payment lookup error:",
        paymentError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load online payment information.",
          details: paymentError.message,
        },
        { status: 500 }
      );
    }

    if (!payment) {
      return NextResponse.json(
        {
          error: "Online payment record not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 10. Verify Razorpay order
    // --------------------------------------------------

    if (payment.gateway_payment_id !== razorpayOrderId) {
      return NextResponse.json(
        {
          error:
            "Payment order mismatch. Please restart the payment.",
          expectedOrderId: payment.gateway_payment_id,
          receivedOrderId: razorpayOrderId,
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 11. Already paid
    // --------------------------------------------------

    if (payment.payment_status === "PAID") {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        registrationId,
      });
    }

    if (payment.payment_status !== "PENDING") {
      return NextResponse.json(
        {
          error: "Payment is not pending.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 12. Verify Razorpay signature
    // --------------------------------------------------

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(
        `${razorpayOrderId}|${razorpayPaymentId}`
      )
      .digest("hex");

    const expectedBuffer =
      Buffer.from(expectedSignature);

    const receivedBuffer =
      Buffer.from(razorpaySignature);

    if (
      expectedBuffer.length !==
        receivedBuffer.length ||
      !crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Payment signature verification failed.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 13. Finalize payment
    //
    // IMPORTANT:
    // Use the authenticated Supabase client here,
    // NOT the service-role admin client.
    // The database function uses auth.uid().
    // --------------------------------------------------

    const {
      data: result,
      error: finalizeError,
    } = await supabase.rpc(
      "finalize_eventnest_online_payment",
      {
        target_registration_id: registrationId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
      }
    );

    if (finalizeError) {
      console.error(
        "Online payment finalization error:",
        finalizeError
      );

      return NextResponse.json(
        {
          error:
            "Payment was verified but registration could not be finalized.",
          details: finalizeError.message,
          code: finalizeError.code || null,
          hint: finalizeError.hint || null,
          detailsFromSupabase:
            finalizeError.details || null,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 14. Success
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      registrationId,
      result,
      message:
        "Online payment verified and registration confirmed.",
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Payment verification failed.",
      },
      { status: 500 }
    );
  }
}