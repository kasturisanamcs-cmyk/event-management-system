import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.rpc(
      "get_eventnest_pending_registrations"
    );

    if (error) {
      console.error("Failed to fetch registrations:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      registrations: data || [],
    });
  } catch (error) {
    console.error("Unexpected registrations API error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while loading registrations.",
      },
      { status: 500 }
    );
  }
}