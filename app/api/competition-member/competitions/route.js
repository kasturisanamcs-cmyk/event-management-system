import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const accessToken = authorization
      .replace("Bearer ", "")
      .trim();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    const { data: profile, error: profileError } =
      await admin
        .from("profiles")
        .select("id, role, full_name")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(profileError);

      return NextResponse.json(
        { error: "Unable to verify user role." },
        { status: 500 }
      );
    }

    const role = String(profile?.role || "")
      .trim()
      .toUpperCase();

    if (role !== "COMPETITION_MEMBER") {
      return NextResponse.json(
        { error: "Competition Member access required." },
        { status: 403 }
      );
    }

    const { data: assignments, error: assignmentsError } =
      await admin
        .from("competition_members")
        .select("competition_id")
        .eq("member_id", user.id);

    if (assignmentsError) {
      console.error(assignmentsError);

      return NextResponse.json(
        { error: "Failed to load assigned competitions." },
        { status: 500 }
      );
    }

    const competitionIds = [
      ...new Set(
        (assignments || [])
          .map((item) => item.competition_id)
          .filter(Boolean)
      ),
    ];

    if (competitionIds.length === 0) {
      return NextResponse.json({
        competitions: [],
      });
    }

    const { data: competitions, error: competitionsError } =
      await admin
        .from("competitions")
        .select(
          `
          id,
          event_id,
          name,
          description,
          registration_fee,
          capacity,
          competition_date,
          start_time,
          end_time,
          venue,
          status
        `
        )
        .in("id", competitionIds)
        .order("competition_date", {
          ascending: true,
        });

    if (competitionsError) {
      console.error(competitionsError);

      return NextResponse.json(
        { error: "Failed to load competitions." },
        { status: 500 }
      );
    }

    const eventIds = [
      ...new Set(
        (competitions || [])
          .map((competition) => competition.event_id)
          .filter(Boolean)
      ),
    ];

    const eventMap = new Map();

    if (eventIds.length > 0) {
      const { data: events, error: eventsError } =
        await admin
          .from("events")
          .select("id, name")
          .in("id", eventIds);

      if (eventsError) {
        console.error(eventsError);

        return NextResponse.json(
          { error: "Failed to load event information." },
          { status: 500 }
        );
      }

      for (const event of events || []) {
        eventMap.set(event.id, event.name);
      }
    }

    const { data: registrations, error: registrationsError } =
      await admin
        .from("registrations")
        .select("id, competition_id, status")
        .in("competition_id", competitionIds);

    if (registrationsError) {
      console.error(registrationsError);

      return NextResponse.json(
        { error: "Failed to load registration information." },
        { status: 500 }
      );
    }

    const registrationCounts = new Map();
    const pendingCounts = new Map();

    for (const registration of registrations || []) {
      const competitionId = registration.competition_id;

      registrationCounts.set(
        competitionId,
        (registrationCounts.get(competitionId) || 0) + 1
      );

      if (
        String(registration.status || "")
          .trim()
          .toUpperCase() === "PENDING"
      ) {
        pendingCounts.set(
          competitionId,
          (pendingCounts.get(competitionId) || 0) + 1
        );
      }
    }

    const result = (competitions || []).map(
      (competition) => ({
        id: competition.id,
        eventId: competition.event_id,
        eventName:
          eventMap.get(competition.event_id) ||
          "EventNest Event",

        name: competition.name,
        description: competition.description,

        registrationFee:
          competition.registration_fee,

        capacity:
          competition.capacity,

        competitionDate:
          competition.competition_date,

        startTime:
          competition.start_time,

        endTime:
          competition.end_time,

        venue:
          competition.venue,

        status:
          competition.status,

        registrationCount:
          registrationCounts.get(competition.id) || 0,

        pendingCount:
          pendingCounts.get(competition.id) || 0,
      })
    );

    return NextResponse.json({
      competitions: result,
    });
  } catch (error) {
    console.error(
      "Competition Member competitions API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to load competitions.",
      },
      { status: 500 }
    );
  }
}