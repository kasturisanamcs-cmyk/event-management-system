import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";

export async function GET(request) {
  try {
    const admin = createAdminClient();

    // ---------------------------------------------------------
    // GET ACCESS TOKEN
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // VERIFY USER
    // ---------------------------------------------------------

    const { data: authData, error: authError } =
      await admin.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      console.error(
        "Organizer Competition Members auth error:",
        authError
      );

      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const user = authData.user;

    // ---------------------------------------------------------
    // CHECK ROLE
    // ---------------------------------------------------------

    const { data: profile, error: profileError } =
      await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          error: "Profile not found.",
        },
        { status: 403 }
      );
    }

    const role =
      profile.role?.trim().toUpperCase();

    if (
      role !== "ORGANIZER" &&
      role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to view Competition Members.",
        },
        { status: 403 }
      );
    }

    // ---------------------------------------------------------
    // GET ORGANIZER EVENTS
    // ---------------------------------------------------------

    let eventIds = [];

    if (role === "ADMIN") {
      const {
        data: events,
        error: eventsError,
      } = await admin
        .from("events")
        .select("id");

      if (eventsError) {
        throw eventsError;
      }

      eventIds =
        events?.map((event) => event.id) || [];
    } else {
      // Events created by Organizer
      const {
        data: createdEvents,
        error: createdError,
      } = await admin
        .from("events")
        .select("id")
        .eq("created_by", user.id);

      if (createdError) {
        throw createdError;
      }

      eventIds =
        createdEvents?.map(
          (event) => event.id
        ) || [];

      // Events where Organizer is assigned
      const {
        data: organizerEvents,
        error: organizerError,
      } = await admin
        .from("event_organizers")
        .select("event_id")
        .eq("organizer_id", user.id);

      if (
        !organizerError &&
        organizerEvents?.length
      ) {
        organizerEvents.forEach((item) => {
          if (
            item.event_id &&
            !eventIds.includes(item.event_id)
          ) {
            eventIds.push(item.event_id);
          }
        });
      }
    }

    if (eventIds.length === 0) {
      return NextResponse.json({
        members: [],
      });
    }

    // ---------------------------------------------------------
    // GET COMPETITIONS
    // ---------------------------------------------------------

    const {
      data: competitions,
      error: competitionsError,
    } = await admin
      .from("competitions")
      .select(`
        id,
        name,
        event_id
      `)
      .in("event_id", eventIds);

    if (competitionsError) {
      throw competitionsError;
    }

    const competitionIds =
      competitions?.map(
        (competition) => competition.id
      ) || [];

    if (competitionIds.length === 0) {
      return NextResponse.json({
        members: [],
      });
    }

    // ---------------------------------------------------------
    // GET COMPETITION MEMBERS
    // ---------------------------------------------------------

    const {
      data: competitionMembers,
      error: membersError,
    } = await admin
      .from("competition_members")
      .select(`
        id,
        competition_id,
        member_id
      `)
      .in(
        "competition_id",
        competitionIds
      );

    if (membersError) {
      throw membersError;
    }

    if (!competitionMembers?.length) {
      return NextResponse.json({
        members: [],
      });
    }

    // ---------------------------------------------------------
    // GET MEMBER PROFILES
    // ---------------------------------------------------------

    const memberIds = [
      ...new Set(
        competitionMembers
          .map(
            (member) => member.member_id
          )
          .filter(Boolean)
      ),
    ];

    const {
      data: profiles,
      error: profilesError,
    } = await admin
      .from("profiles")
      .select(`
        id,
        full_name,
        role
      `)
      .in("id", memberIds);

    if (profilesError) {
      throw profilesError;
    }

    // ---------------------------------------------------------
    // MAP DATA
    // ---------------------------------------------------------

    const competitionMap = new Map();

    (competitions || []).forEach(
      (competition) => {
        competitionMap.set(
          competition.id,
          competition
        );
      }
    );

    const profileMap = new Map();

    (profiles || []).forEach((profile) => {
      profileMap.set(
        profile.id,
        profile
      );
    });

    // ---------------------------------------------------------
    // COMBINE
    // ---------------------------------------------------------

    const members =
      competitionMembers.map((member) => {
        const competition =
          competitionMap.get(
            member.competition_id
          );

        const profile =
          profileMap.get(
            member.member_id
          );

        return {
          id: member.id,
          member_id: member.member_id,

          name:
            profile?.full_name ||
            "Unknown Member",

          competition:
            competition?.name ||
            "Unknown Competition",

          competition_id:
            member.competition_id,

          role:
            profile?.role ||
            "COMPETITION_MEMBER",

          status: "ACTIVE",
        };
      });

    return NextResponse.json({
      members,
    });
  } catch (error) {
    console.error(
      "Organizer Competition Members API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to load Competition Members.",
      },
      { status: 500 }
    );
  }
}