import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { registrationId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!registrationId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Incomplete payment verification data." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: registration, error: registrationError } = await admin
      .from("registrations")
      .select("id, user_id, status")
      .eq("id", registrationId)
      .single();

    if (registrationError || !registration || registration.user_id !== user.id) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    const { data: payment } = await admin
      .from("payments")
      .select("provider_order_id")
      .eq("registration_id", registrationId)
      .maybeSingle();

    if (!payment?.provider_order_id || payment.provider_order_id !== razorpayOrderId) {
      return NextResponse.json({ error: "Payment order mismatch." }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Payment gateway is not configured." }, { status: 503 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    const { data: result, error: finalizeError } = await admin.rpc("finalize_eventnest_paid_registration", {
      target_registration_id: registrationId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    });

    if (finalizeError) {
      console.error("Finalize registration error:", finalizeError);
      return NextResponse.json({ error: "Payment was verified but registration could not be finalized." }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Payment verification failed." }, { status: 500 });
  }
}
