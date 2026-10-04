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

    const registrationId = body.registrationId;

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required." },
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
      "generate_eventnest_ticket",
      {
        target_registration_id: registrationId,
      }
    );

    if (error) {
      console.error("Generate ticket RPC error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const ticket = Array.isArray(data) ? data[0] : data;

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket could not be generated." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Generate ticket API error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}