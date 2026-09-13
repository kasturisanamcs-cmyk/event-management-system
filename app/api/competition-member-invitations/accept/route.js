import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// ============================================================
// GET
// Used by the invitation page to verify the invitation
// ============================================================

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          error: "Invitation token is required.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();

    // --------------------------------------------------
    // 1. Find invitation
    // --------------------------------------------------

    const { data: invitation, error: invitationError } =
      await supabaseAdmin
        .from("competition_member_invitations")
        .select("*")
        .eq("token", token)
        .maybeSingle();

    if (invitationError) {
      console.error(
        "Competition member invitation lookup error:",
        invitationError
      );

      return NextResponse.json(
        {
          error: "Could not verify the invitation.",
        },
        { status: 500 }
      );
    }

    if (!invitation) {
      return NextResponse.json(
        {
          error: "Invalid invitation.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 2. Check status
    // --------------------------------------------------

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        {
          error: "This invitation is no longer pending.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Check expiry
    // --------------------------------------------------

    if (new Date(invitation.expires_at) < new Date()) {
      await supabaseAdmin
        .from("competition_member_invitations")
        .update({
          status: "EXPIRED",
        })
        .eq("id", invitation.id);

      return NextResponse.json(
        {
          error: "This invitation has expired.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. Get competition
    // --------------------------------------------------

    const { data: competition, error: competitionError } =
      await supabaseAdmin
        .from("competitions")
        .select("*")
        .eq("id", invitation.competition_id)
        .maybeSingle();

    if (competitionError) {
      console.error(
        "Competition lookup error:",
        competitionError
      );

      return NextResponse.json(
        {
          error: "Could not load the competition.",
        },
        { status: 500 }
      );
    }

    if (!competition) {
      return NextResponse.json(
        {
          error: "The competition associated with this invitation was not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5. Get event
    // --------------------------------------------------

    const { data: event, error: eventError } =
      await supabaseAdmin
        .from("events")
        .select("*")
        .eq("id", competition.event_id)
        .maybeSingle();

    if (eventError) {
      console.error(
        "Event lookup error:",
        eventError
      );

      return NextResponse.json(
        {
          error: "Could not load the event.",
        },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        {
          error: "The event associated with this competition was not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 6. Success
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        expires_at: invitation.expires_at,
      },
      competition: {
        id: competition.id,
        name: competition.name,
        description: competition.description,
        registration_fee: competition.registration_fee,
        capacity: competition.capacity,
        competition_date: competition.competition_date,
        start_time: competition.start_time,
        end_time: competition.end_time,
        venue: competition.venue,
        status: competition.status,
        poster_url: competition.poster_url,
      },
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        start_date: event.start_date,
        end_date: event.end_date,
        venue: event.venue,
      },
    });
  } catch (error) {
    console.error(
      "Competition member invitation GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong while loading the invitation.",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST
// Accept invitation after account creation/login
// ============================================================

export async function POST(request) {
  try {
    // --------------------------------------------------
    // 1. Check logged-in user
    // --------------------------------------------------

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "You must be logged in to accept this invitation.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Get invitation token
    // --------------------------------------------------

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        {
          error: "Invitation token is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Create Supabase admin client
    // --------------------------------------------------

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error(
        "SUPABASE_SERVICE_ROLE_KEY is missing."
      );

      return NextResponse.json(
        {
          error: "Server configuration error.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // --------------------------------------------------
    // 4. Find invitation using service role
    // --------------------------------------------------

    const {
      data: invitation,
      error: invitationError,
    } = await supabaseAdmin
      .from("competition_member_invitations")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (invitationError) {
      console.error(
        "Invitation lookup error:",
        invitationError
      );

      return NextResponse.json(
        {
          error: "Could not verify the invitation.",
        },
        { status: 500 }
      );
    }

    if (!invitation) {
      return NextResponse.json(
        {
          error: "Invalid invitation.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5. Check invitation status
    // --------------------------------------------------

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        {
          error: "This invitation is no longer pending.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 6. Check invitation expiry
    // --------------------------------------------------

    if (
      new Date(invitation.expires_at) <
      new Date()
    ) {
      await supabaseAdmin
        .from("competition_member_invitations")
        .update({
          status: "EXPIRED",
        })
        .eq("id", invitation.id);

      return NextResponse.json(
        {
          error: "This invitation has expired.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 7. Check email
    // --------------------------------------------------

    if (
      user.email &&
      invitation.email.toLowerCase() !==
        user.email.toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "This invitation was sent to a different email address.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 8. Change profile role to COMPETITION_MEMBER
    // --------------------------------------------------

    const {
      data: profile,
      error: profileFetchError,
    } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileFetchError) {
      console.error(
        "Profile lookup error:",
        profileFetchError
      );

      return NextResponse.json(
        {
          error: "Could not verify your profile.",
        },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          error: "Your profile could not be found.",
        },
        { status: 404 }
      );
    }

    // Same idea as the organizer invitation flow:
    // normal participant account becomes the invited role.

    if (
      profile.role === "PARTICIPANT" ||
      profile.role === "COMPETITION_MEMBER"
    ) {
      const {
        error: roleError,
      } = await supabaseAdmin
        .from("profiles")
        .update({
          role: "COMPETITION_MEMBER",
        })
        .eq("id", user.id);

      if (roleError) {
        console.error(
          "Profile role update error:",
          roleError
        );

        return NextResponse.json(
          {
            error: "Could not update your profile.",
          },
          { status: 500 }
        );
      }
    }

    // --------------------------------------------------
    // 9. Connect member to competition
    // --------------------------------------------------

    const {
      data: membership,
      error: membershipError,
    } = await supabaseAdmin
      .from("competition_members")
      .insert({
        competition_id: invitation.competition_id,
        member_id: user.id,
      })
      .select()
      .single();

    // If already connected, continue.
    if (
      membershipError &&
      membershipError.code !== "23505"
    ) {
      console.error(
        "Competition member assignment error:",
        membershipError
      );

      return NextResponse.json(
        {
          error:
            "Could not connect you to the competition.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 10. Mark invitation as accepted
    // --------------------------------------------------

    const {
      error: updateError,
    } = await supabaseAdmin
      .from("competition_member_invitations")
      .update({
        status: "ACCEPTED",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (updateError) {
      console.error(
        "Invitation update error:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Could not complete the invitation.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 11. Success
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Competition member invitation accepted successfully.",
      competitionId: invitation.competition_id,
      membershipId: membership?.id || null,
    });
  } catch (error) {
    console.error(
      "Accept competition member invitation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while accepting the invitation.",
      },
      { status: 500 }
    );
  }
}