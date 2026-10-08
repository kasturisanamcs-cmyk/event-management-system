import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

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
      authorization.replace("Bearer ", "").trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    /*
     * Verify the logged-in user using the user's access token.
     */
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
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
    } = await supabaseAuth.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Invalid or expired session.",
        },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    /*
     * Verify role.
     */
    const {
      data: profile,
      error: profileError,
    } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Organizer participants profile error:",
        profileError
      );

      return NextResponse.json(
        {
          error: "Unable to verify your account role.",
        },
        { status: 500 }
      );
    }

    const role = String(profile?.role || "")
      .trim()
      .toUpperCase();

    if (role !== "ORGANIZER" && role !== "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Organizer or Admin access is required.",
        },
        { status: 403 }
      );
    }

    /*
     * Find events belonging to this organizer.
     *
     * Organizer can access:
     * 1. Events created by the organizer
     * 2. Events assigned through event_organizers
     *
     * Admin can access all events.
     */
    let eventIds = [];

    if (role === "ADMIN") {
      const {
        data: allEvents,
        error: allEventsError,
      } = await admin
        .from("events")
        .select("id");

      if (allEventsError) {
        console.error(
          "Load all events error:",
          allEventsError
        );

        return NextResponse.json(
          {
            error: "Failed to load events.",
          },
          { status: 500 }
        );
      }

      eventIds = (allEvents || []).map(
        (event) => event.id
      );
    } else {
      const {
        data: createdEvents,
        error: createdEventsError,
      } = await admin
        .from("events")
        .select("id")
        .eq("created_by", user.id);

      if (createdEventsError) {
        console.error(
          "Load organizer events error:",
          createdEventsError
        );

        return NextResponse.json(
          {
            error: "Failed to load organizer events.",
          },
          { status: 500 }
        );
      }

      const {
        data: assignedEvents,
        error: assignedEventsError,
      } = await admin
        .from("event_organizers")
        .select("event_id")
        .eq("organizer_id", user.id);

      if (assignedEventsError) {
        console.error(
          "Load assigned events error:",
          assignedEventsError
        );

        return NextResponse.json(
          {
            error:
              "Failed to load assigned organizer events.",
          },
          { status: 500 }
        );
      }

      eventIds = [
        ...new Set([
          ...(createdEvents || []).map(
            (event) => event.id
          ),
          ...(assignedEvents || []).map(
            (event) => event.event_id
          ),
        ]),
      ];
    }

    /*
     * No events means no participants.
     */
    if (eventIds.length === 0) {
      return NextResponse.json({
        participants: [],
      });
    }

    /*
     * Load competitions belonging to those events.
     */
    const {
      data: competitions,
      error: competitionsError,
    } = await admin
      .from("competitions")
      .select("id, event_id, name")
      .in("event_id", eventIds);

    if (competitionsError) {
      console.error(
        "Load competitions error:",
        competitionsError
      );

      return NextResponse.json(
        {
          error: "Failed to load competitions.",
        },
        { status: 500 }
      );
    }

    if (!competitions || competitions.length === 0) {
      return NextResponse.json({
        participants: [],
      });
    }

    const competitionIds = competitions.map(
      (competition) => competition.id
    );

    /*
     * Load event names.
     */
    const {
      data: events,
      error: eventsError,
    } = await admin
      .from("events")
      .select("id, name")
      .in("id", eventIds);

    if (eventsError) {
      console.error(
        "Load event names error:",
        eventsError
      );

      return NextResponse.json(
        {
          error: "Failed to load event information.",
        },
        { status: 500 }
      );
    }

    const eventMap = new Map(
      (events || []).map((event) => [
        event.id,
        event.name,
      ])
    );

    const competitionMap = new Map(
      competitions.map((competition) => [
        competition.id,
        {
          name: competition.name,
          eventId: competition.event_id,
        },
      ])
    );

    /*
     * Load registrations.
     */
    const {
      data: registrations,
      error: registrationsError,
    } = await admin
      .from("registrations")
      .select(
        `
          id,
          user_id,
          competition_id,
          registration_number,
          status,
          registered_at,
          participation_mode,
          participant_name,
          participant_email,
          phone,
          college,
          student_id,
          participation_type,
          team_name
        `
      )
      .in("competition_id", competitionIds)
      .order("registered_at", {
        ascending: false,
      });

    if (registrationsError) {
      console.error(
        "Load registrations error:",
        registrationsError
      );

      return NextResponse.json(
        {
          error: "Failed to load participants.",
        },
        { status: 500 }
      );
    }

    const participants = (registrations || [])
      .map((registration) => {
        const competition =
          competitionMap.get(
            registration.competition_id
          );

        if (!competition) {
          return null;
        }

        return {
          id: registration.id,

          user_id: registration.user_id,

          name:
            registration.participant_name ||
            "Unknown Participant",

          email:
            registration.participant_email || "",

          phone:
            registration.phone || "",

          college:
            registration.college || "",

          student_id:
            registration.student_id || "",

          competition:
            competition.name || "Unknown Competition",

          event:
            eventMap.get(competition.eventId) ||
            "Unknown Event",

          registration_number:
            registration.registration_number || "",

          status:
            registration.status || "PENDING",

          participation_type:
            registration.participation_type ||
            "Individual",

          participation_mode:
            registration.participation_mode || "",

          team_name:
            registration.team_name || "",

          registered_at:
            registration.registered_at || null,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      participants,
    });
  } catch (error) {
    console.error(
      "Organizer Participants API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Internal server error.",
      },
      { status: 500 }
    );
  }
}