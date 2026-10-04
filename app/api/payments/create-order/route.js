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

    const { registrationId } = await request.json();
    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: registration, error } = await admin
      .from("registrations")
      .select(`
        id,
        user_id,
        status,
        competition_id,
        competitions (id, name, registration_fee, capacity)
      `)
      .eq("id", registrationId)
      .eq("user_id", user.id)
      .single();

    if (error || !registration) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    if (registration.status === "CONFIRMED") {
      return NextResponse.json({ alreadyConfirmed: true, registrationId });
    }

    const amount = Number(registration.competitions?.registration_fee || 0);
    if (amount <= 0) {
      return NextResponse.json({ alreadyConfirmed: true, registrationId });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Online payment is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the environment." },
        { status: 503 }
      );
    }

    const existingPayment = await admin
      .from("payments")
      .select("provider_order_id, status")
      .eq("registration_id", registrationId)
      .maybeSingle();

    if (existingPayment.data?.provider_order_id && existingPayment.data.status === "PENDING") {
      return NextResponse.json({
        orderId: existingPayment.data.provider_order_id,
        amount: amount * 100,
        currency: "INR",
        keyId,
        registrationId,
        competitionName: registration.competitions?.name,
      });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: registrationId.slice(0, 40),
        notes: { registration_id: registrationId },
      }),
    });

    const order = await response.json();
    if (!response.ok) {
      console.error("Razorpay order error:", order);
      return NextResponse.json({ error: "Payment order could not be created." }, { status: 502 });
    }

    await admin.from("payments").upsert({
      registration_id: registrationId,
      amount,
      currency: "INR",
      provider: "RAZORPAY",
      provider_order_id: order.id,
      status: "PENDING",
      updated_at: new Date().toISOString(),
    }, { onConflict: "registration_id" });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      registrationId,
      competitionName: registration.competitions?.name,
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    return NextResponse.json({ error: "Unable to start payment." }, { status: 500 });
  }
}
