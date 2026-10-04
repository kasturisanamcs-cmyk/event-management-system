import { NextResponse } from "next/server";
import {
  createClient as createSupabaseClient,
} from "@supabase/supabase-js";

export async function GET(request) {
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

    // Authenticate participant
    const authClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          error: userError?.message || "User not found.",
        },
        { status: 401 }
      );
    }

    // Service-role client
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            "SUPABASE_SERVICE_ROLE_KEY is missing.",
        },
        { status: 500 }
      );
    }

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get confirmed registrations
    const {
      data: registrations,
      error: registrationError,
    } = await adminClient
      .from("registrations")
      .select(
        `
          id,
          registration_number,
          status,
          participant_name,
          participant_email,
          college,
          competition_id,
          registered_at
        `
      )
      .eq("user_id", user.id)
      .eq("status", "CONFIRMED")
      .order("registered_at", {
        ascending: false,
      });

    if (registrationError) {
      console.error(
        "Registration query error:",
        registrationError
      );

      return NextResponse.json(
        {
          error: registrationError.message,
        },
        { status: 500 }
      );
    }

    if (!registrations || registrations.length === 0) {
      return NextResponse.json({
        success: true,
        registrations: [],
      });
    }

    // Get competition IDs
    const competitionIds = [
      ...new Set(
        registrations
          .map(
            (registration) =>
              registration.competition_id
          )
          .filter(Boolean)
      ),
    ];

    let competitions = [];

    if (competitionIds.length > 0) {
      const {
        data: competitionData,
        error: competitionError,
      } = await adminClient
        .from("competitions")
        .select(
          `
            id,
            name,
            competition_date,
            start_time,
            end_time,
            venue
          `
        )
        .in("id", competitionIds);

      if (competitionError) {
        console.error(
          "Competition query error:",
          competitionError
        );

        return NextResponse.json(
          {
            error: competitionError.message,
          },
          { status: 500 }
        );
      }

      competitions = competitionData || [];
    }

    // Combine registration + competition
    const formattedRegistrations =
      registrations.map((registration) => {
        const competition = competitions.find(
          (item) =>
            item.id === registration.competition_id
        );

        return {
          result_id: registration.id,

          result_registration_number:
            registration.registration_number,

          result_status:
            registration.status,

          result_participant_name:
            registration.participant_name,

          result_participant_email:
            registration.participant_email,

          result_college:
            registration.college,

          result_competition_id:
            registration.competition_id,

          result_competition_name:
            competition?.name ||
            "Unknown Competition",

          result_competition_date:
            competition?.competition_date ||
            null,

          result_start_time:
            competition?.start_time ||
            null,

          result_end_time:
            competition?.end_time ||
            null,

          result_venue:
            competition?.venue ||
            null,

          result_registered_at:
            registration.registered_at,
        };
      });

    return NextResponse.json({
      success: true,
      registrations: formattedRegistrations,
    });
  } catch (error) {
    console.error(
      "Participant registration API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong.",
      },
      { status: 500 }
    );
  }
}