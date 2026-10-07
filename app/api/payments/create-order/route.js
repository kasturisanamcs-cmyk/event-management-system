import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  try {
    // --------------------------------------------------
    // 1. Check logged-in participant
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
    // 2. Read registration ID
    // --------------------------------------------------
    const body = await request.json();
    const { registrationId } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Admin client for secure database operations
    // --------------------------------------------------
    const admin = createAdminClient();

    // --------------------------------------------------
    // 4. Load registration + competition
    // --------------------------------------------------
    const { data: registration, error: registrationError } =
      await admin
        .from("registrations")
        .select(`
          id,
          user_id,
          status,
          participation_mode,
          competition_id
        `)
        .eq("id", registrationId)
        .single();

    if (registrationError || !registration) {
      return NextResponse.json(
        { error: "Registration not found." },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5. Make sure this registration belongs to user
    // --------------------------------------------------
    if (registration.user_id !== user.id) {
      return NextResponse.json(
        { error: "You are not allowed to pay for this registration." },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 6. Registration status
    // ONLINE payment does NOT require approval.
    // PENDING is allowed.
    // APPROVED is also allowed for compatibility.
    // --------------------------------------------------
    if (
      registration.status !== "PENDING" &&
      registration.status !== "APPROVED"
    ) {
      if (registration.status === "CONFIRMED") {
        return NextResponse.json({
          success: true,
          alreadyConfirmed: true,
          registrationId: registration.id,
        });
      }

      return NextResponse.json(
        {
          error: `Online payment is not available for registration status: ${registration.status}.`,
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 7. Online participation required
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
    // 8. Get competition fee
    // --------------------------------------------------
    const { data: competition, error: competitionError } =
      await admin
        .from("competitions")
        .select(`
          id,
          name,
          registration_fee
        `)
        .eq("id", registration.competition_id)
        .single();

    if (competitionError || !competition) {
      return NextResponse.json(
        { error: "Competition not found." },
        { status: 404 }
      );
    }

    const amountRupees = Number(competition.registration_fee || 0);

    if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
      return NextResponse.json(
        {
          error:
            "This competition does not have a valid online payment amount.",
        },
        { status: 400 }
      );
    }

    const amountPaise = Math.round(amountRupees * 100);

    // --------------------------------------------------
    // 9. Check if payment already exists
    // --------------------------------------------------
    const { data: existingPayment, error: paymentLookupError } =
      await admin
        .from("payments")
        .select(`
          id,
          amount,
          payment_method,
          payment_status,
          gateway_payment_id
        `)
        .eq("registration_id", registrationId)
        .eq("payment_method", "ONLINE")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (paymentLookupError) {
      console.error(
        "Payment lookup error:",
        paymentLookupError
      );

      return NextResponse.json(
        { error: "Unable to load payment information." },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 10. Already paid
    // --------------------------------------------------
    if (existingPayment?.payment_status === "PAID") {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        alreadyPaid: true,
        registrationId,
      });
    }

    // --------------------------------------------------
    // 11. Razorpay credentials
    // --------------------------------------------------
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay environment variables are missing.");

      return NextResponse.json(
        {
          error:
            "Payment gateway is not configured. Please add Razorpay test keys.",
        },
        { status: 503 }
      );
    }

    // --------------------------------------------------
    // 12. Reuse existing pending Razorpay order
    // gateway_payment_id temporarily stores order ID
    // --------------------------------------------------
    if (
      existingPayment?.payment_status === "PENDING" &&
      existingPayment.gateway_payment_id
    ) {
      return NextResponse.json({
        success: true,
        orderId: existingPayment.gateway_payment_id,
        amount: amountPaise,
        currency: "INR",
        keyId: razorpayKeyId,
        registrationId,
        competitionName: competition.name,
      });
    }

    // --------------------------------------------------
    // 13. Create Razorpay order
    // --------------------------------------------------
    const razorpayAuth = Buffer.from(
      `${razorpayKeyId}:${razorpayKeySecret}`
    ).toString("base64");

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${razorpayAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: `EVN-${registrationId.slice(0, 8)}`,
          notes: {
            registration_id: registrationId,
            competition_id: registration.competition_id,
          },
        }),
      }
    );

    const razorpayData = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error(
        "Razorpay order creation failed:",
        razorpayData
      );

      return NextResponse.json(
        {
          error:
            razorpayData?.error?.description ||
            "Unable to create Razorpay order.",
        },
        { status: 502 }
      );
    }

    const razorpayOrderId = razorpayData.id;

    // --------------------------------------------------
    // 14. Save payment record
    // --------------------------------------------------
    let savedPayment;

    if (existingPayment) {
      const { data, error } = await admin
        .from("payments")
        .update({
          amount: amountRupees,
          payment_method: "ONLINE",
          payment_status: "PENDING",
          gateway_payment_id: razorpayOrderId,
        })
        .eq("id", existingPayment.id)
        .select()
        .single();

      if (error) {
        console.error(
          "Payment update error:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Razorpay order was created but payment record could not be saved.",
          },
          { status: 500 }
        );
      }

      savedPayment = data;
    } else {
      const { data, error } = await admin
        .from("payments")
        .insert({
          registration_id: registrationId,
          amount: amountRupees,
          payment_method: "ONLINE",
          payment_status: "PENDING",
          gateway_payment_id: razorpayOrderId,
        })
        .select()
        .single();

      if (error) {
        console.error(
          "Payment insert error:",
          error
        );

        return NextResponse.json(
          {
            error:
              "Razorpay order was created but payment record could not be saved.",
          },
          { status: 500 }
        );
      }

      savedPayment = data;
    }

    // --------------------------------------------------
    // 15. Return checkout information
    // --------------------------------------------------
    return NextResponse.json({
      success: true,
      orderId: razorpayOrderId,
      amount: amountPaise,
      currency: "INR",
      keyId: razorpayKeyId,
      registrationId,
      competitionName: competition.name,
      paymentId: savedPayment.id,
    });
  } catch (error) {
    console.error(
      "Create Razorpay order error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to prepare online payment.",
      },
      { status: 500 }
    );
  }
}