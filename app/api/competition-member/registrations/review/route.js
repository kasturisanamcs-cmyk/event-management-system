import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();

    // Get logged-in user
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

    // Read request body
    const body = await request.json();

    const registrationId = body.registrationId;
    const action = body.action;
    const rejectionReason = body.rejectionReason ?? null;

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required." },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: "Review action is required." },
        { status: 400 }
      );
    }

    // Call database approval/rejection function
    const { data, error } = await supabase.rpc(
      "review_eventnest_registration",
      {
        target_registration_id: registrationId,
        review_action: action,
        rejection_reason_value: rejectionReason,
      }
    );

    if (error) {
      console.error("Registration review error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Unexpected registration review error:", error);

    return NextResponse.json(
      { error: "Something went wrong while reviewing the registration." },
      { status: 500 }
    );
  }
}