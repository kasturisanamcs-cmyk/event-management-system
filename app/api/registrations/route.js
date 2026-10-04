import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();

    // Check logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Required fields
    const required = [
      "competitionId",
      "sessionId",
      "participantName",
      "participantEmail",
      "phone",
      "college",
      "studentId",
    ];

    const missing = required.find(
      (key) => !String(body[key] ?? "").trim()
    );

    if (missing) {
      return NextResponse.json(
        { error: `${missing} is required.` },
        { status: 400 }
      );
    }

    // Participation type
    const participationType =
      body.participationType === "Team" ? "Team" : "Individual";

    // Participation mode
    const participationMode =
      body.participationMode === "ONLINE" ? "ONLINE" : "OFFLINE";

    // Team name required only for Team participation
    if (
      participationType === "Team" &&
      !String(body.teamName ?? "").trim()
    ) {
      return NextResponse.json(
        {
          error: "Team name is required for team participation.",
        },
        { status: 400 }
      );
    }

    // Create registration
    const { data, error } = await supabase.rpc(
      "create_eventnest_registration",
      {
        target_competition_id: body.competitionId,
        target_session_id: body.sessionId,
        participant_name_value: body.participantName,
        participant_email_value: body.participantEmail,
        phone_value: body.phone,
        college_value: body.college,
        student_id_value: body.studentId,
        participation_type_value: participationType,
        team_name_value:
          participationType === "Team"
            ? body.teamName.trim()
            : null,

        // ONLINE / OFFLINE
        participation_mode_value: participationMode,
      }
    );

    if (error) {
      console.error("Registration RPC error:", error);

      return NextResponse.json(
        {
          error:
            error.message ||
            "Registration could not be created.",
        },
        {
          status: error.code === "P0001" ? 409 : 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      registration: data,
    });
  } catch (error) {
    console.error("Registration API error:", error);

    return NextResponse.json(
      {
        error: "Unable to create registration.",
      },
      { status: 500 }
    );
  }
}