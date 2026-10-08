import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request) {
  try {
    // --------------------------------------------------
    // 1. Get access token
    // --------------------------------------------------

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const accessToken = authorization.replace("Bearer ", "").trim();

    // --------------------------------------------------
    // 2. Verify logged-in user
    // --------------------------------------------------

    const supabaseAdmin = getAdminClient();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      console.error("AUTH ERROR:", userError);

      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    console.log("COMPETITION MEMBER USER:", user.id);

    // --------------------------------------------------
    // 3. Verify role
    // --------------------------------------------------

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);

      return NextResponse.json(
        { error: "Could not load user profile." },
        { status: 500 }
      );
    }

    console.log("PROFILE:", profile);

    if (
      !profile ||
      String(profile.role).trim().toUpperCase() !== "COMPETITION_MEMBER"
    ) {
      return NextResponse.json(
        { error: "Competition Member access required." },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 4. Get competitions assigned to this member
    // --------------------------------------------------

    const { data: assignments, error: assignmentError } =
      await supabaseAdmin
        .from("competition_members")
        .select("id, competition_id, member_id")
        .eq("member_id", user.id);

    if (assignmentError) {
      console.error("ASSIGNMENT ERROR:", assignmentError);

      return NextResponse.json(
        { error: "Could not load assigned competitions." },
        { status: 500 }
      );
    }

    console.log("ASSIGNMENTS:", assignments);

    const competitionIds = [
      ...new Set(
        (assignments || [])
          .map((item) => item.competition_id)
          .filter(Boolean)
      ),
    ];

    console.log("COMPETITION IDS:", competitionIds);

    if (competitionIds.length === 0) {
      return NextResponse.json({
        participants: [],
        totalParticipants: 0,
        competitions: 0,
      });
    }

    // --------------------------------------------------
    // 5. Get competitions
    // --------------------------------------------------

    const { data: competitions, error: competitionsError } =
      await supabaseAdmin
        .from("competitions")
        .select("id, name, event_id")
        .in("id", competitionIds);

    if (competitionsError) {
      console.error("COMPETITIONS ERROR:", competitionsError);

      return NextResponse.json(
        { error: "Could not load competitions." },
        { status: 500 }
      );
    }

    console.log("COMPETITIONS:", competitions);

    // --------------------------------------------------
    // 6. Get events
    // --------------------------------------------------

    const eventIds = [
      ...new Set(
        (competitions || [])
          .map((competition) => competition.event_id)
          .filter(Boolean)
      ),
    ];

    let events = [];

    if (eventIds.length > 0) {
      const { data: eventData, error: eventsError } =
        await supabaseAdmin
          .from("events")
          .select("id, name")
          .in("id", eventIds);

      if (eventsError) {
        console.error("EVENTS ERROR:", eventsError);

        return NextResponse.json(
          { error: "Could not load events." },
          { status: 500 }
        );
      }

      events = eventData || [];
    }

    // --------------------------------------------------
    // 7. IMPORTANT:
    // Get registrations directly using the verified
    // competition IDs.
    // --------------------------------------------------

    const { data: registrations, error: registrationsError } =
      await supabaseAdmin
        .from("registrations")
        .select(
          `
          id,
          registration_number,
          user_id,
          competition_id,
          status,
          registered_at,
          participation_mode,
          participation_type,
          participant_name,
          participant_email,
          phone,
          college,
          student_id,
          team_name
        `
        )
        .in("competition_id", competitionIds)
        .order("registered_at", { ascending: false });

    if (registrationsError) {
      console.error("REGISTRATIONS ERROR:", registrationsError);

      return NextResponse.json(
        { error: "Could not load registrations." },
        { status: 500 }
      );
    }

    console.log("REGISTRATIONS FOUND:", registrations);

    // --------------------------------------------------
    // 8. Create lookup maps
    // --------------------------------------------------

    const competitionMap = new Map(
      (competitions || []).map((competition) => [
        competition.id,
        competition,
      ])
    );

    const eventMap = new Map(
      (events || []).map((event) => [event.id, event])
    );

    // --------------------------------------------------
    // 9. Build participant response
    // --------------------------------------------------

    const participants = (registrations || []).map((registration) => {
      const competition = competitionMap.get(
        registration.competition_id
      );

      const event = competition
        ? eventMap.get(competition.event_id)
        : null;

      return {
        id: registration.id,
        registration_id: registration.id,
        registration_number: registration.registration_number,

        participant_name:
          registration.participant_name || "Unknown Participant",

        participant_email:
          registration.participant_email || "",

        phone: registration.phone || "",
        college: registration.college || "",
        student_id: registration.student_id || "",

        participation_type:
          registration.participation_type || "",

        participation_mode:
          registration.participation_mode || "",

        team_name: registration.team_name || "",

        registration_status:
          registration.status || "PENDING",

        status: registration.status || "PENDING",

        registered_at: registration.registered_at,

        competition_id: registration.competition_id,

        competition_name:
          competition?.name || "Unknown Competition",

        event_id: competition?.event_id || null,

        event_name:
          event?.name || "Unknown Event",
      };
    });

    console.log("PARTICIPANTS RETURNED:", participants);

    // --------------------------------------------------
    // 10. Return data
    // --------------------------------------------------

    return NextResponse.json({
      participants,
      totalParticipants: participants.length,
      competitions: competitionIds.length,
    });
  } catch (error) {
    console.error("COMPETITION MEMBER PARTICIPANTS API ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      { status: 500 }
    );
  }
}