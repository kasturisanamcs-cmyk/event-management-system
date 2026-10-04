import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7).trim();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const targetPaymentId = body.target_payment_id;

    if (!targetPaymentId) {
      return NextResponse.json(
        { error: "Payment ID is required." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.rpc(
      "verify_eventnest_offline_payment",
      {
        target_payment_id: targetPaymentId,
      }
    );

    if (error) {
      console.error(
        "Verify offline payment RPC error:",
        error
      );

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result: data,
    });
  } catch (error) {
    console.error(
      "Verify offline payment API error:",
      error
    );

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}