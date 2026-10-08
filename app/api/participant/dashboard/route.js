import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const authorization =
      request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const accessToken =
      authorization.substring(7);

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          error:
            "Supabase configuration is missing.",
        },
        { status: 500 }
      );
    }

    // ----------------------------------------------------------
    // VERIFY LOGGED-IN USER
    // ----------------------------------------------------------

    const supabaseAuth =
      createSupabaseClient(
        supabaseUrl,
        supabaseKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

    const {
      data: { user },
      error: userError,
    } =
      await supabaseAuth.auth.getUser(
        accessToken
      );

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    // ----------------------------------------------------------
    // ADMIN CLIENT
    //
    // Read-only dashboard query.
    // Does NOT modify registrations/payments.
    // ----------------------------------------------------------

    const supabaseAdmin =
      createAdminClient();

    // ----------------------------------------------------------
    // GET ALL REGISTRATIONS OF THIS USER
    //
    // IMPORTANT:
    // NO STATUS FILTER.
    // ----------------------------------------------------------

    const {
      data: registrations,
      error: registrationError,
    } = await supabaseAdmin
      .from("registrations")
      .select(`
        id,
        registration_number,
        status,
        participant_name,
        participant_email,
        college,
        competition_id,
        registered_at,
        participation_mode,
        participation_type,
        team_name,
        competitions (
          id,
          name,
          event_id,
          competition_date,
          start_time,
          end_time,
          venue,
          status
        )
      `)
      .eq("user_id", user.id)
      .order("registered_at", {
        ascending: false,
      });

    if (registrationError) {
      console.error(
        "Participant dashboard query error:",
        registrationError
      );

      return NextResponse.json(
        {
          error:
            "Failed to load your registrations.",
        },
        { status: 500 }
      );
    }

    // ----------------------------------------------------------
    // FORMAT
    // ----------------------------------------------------------

    const formatted =
      (registrations || []).map(
        (registration) => {
          const competition =
            registration.competitions;

          return {
            id: registration.id,

            registrationNumber:
              registration.registration_number,

            status:
              registration.status,

            participantName:
              registration.participant_name,

            participantEmail:
              registration.participant_email,

            college:
              registration.college,

            competitionId:
              registration.competition_id,

            competitionName:
              competition?.name ||
              "Competition",

            eventId:
              competition?.event_id ||
              null,

            competitionDate:
              competition?.competition_date ||
              null,

            startTime:
              competition?.start_time ||
              null,

            endTime:
              competition?.end_time ||
              null,

            venue:
              competition?.venue ||
              null,

            registeredAt:
              registration.registered_at,

            participationMode:
              registration.participation_mode ||
              null,

            participationType:
              registration.participation_type ||
              null,

            teamName:
              registration.team_name ||
              null,

            competitionStatus:
              competition?.status ||
              null,
          };
        }
      );

    return NextResponse.json(
      {
        success: true,
        registrations: formatted,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "Participant dashboard API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to load participant dashboard.",
      },
      { status: 500 }
    );
  }
}