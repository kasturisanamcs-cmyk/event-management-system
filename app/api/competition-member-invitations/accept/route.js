import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  return createAdminClient(supabaseUrl, serviceRoleKey);
}

// ---------------------------------------------------------
// GET
// Used by the invitation page.
// DOES NOT require the invited user to be logged in.
// ---------------------------------------------------------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token")?.trim();

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // -----------------------------------------------------
    // 1. Get invitation
    // -----------------------------------------------------
    const {
      data: invitation,
      error: invitationError,
    } = await supabase
      .from("competition_member_invitations")
      .select(`
        id,
        competition_id,
        email,
        status,
        token,
        expires_at,
        created_at
      `)
      .eq("token", token)
      .maybeSingle();

    if (invitationError) {
      console.error(
        "Competition member invitation lookup error:",
        invitationError
      );

      return NextResponse.json(
        {
          error: "Unable to load invitation.",
          details: invitationError.message,
        },
        { status: 500 }
      );
    }

    if (!invitation) {
      console.error(
        "Competition member invitation not found for token:",
        token
      );

      return NextResponse.json(
        { error: "Invitation not found." },
        { status: 404 }
      );
    }

    // -----------------------------------------------------
    // 2. Check invitation status
    // -----------------------------------------------------
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `This invitation is already ${invitation.status.toLowerCase()}.`,
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // 3. Check expiry
    // -----------------------------------------------------
    if (new Date(invitation.expires_at) < new Date()) {
      const { error: expiryError } = await supabase
        .from("competition_member_invitations")
        .update({
          status: "EXPIRED",
        })
        .eq("id", invitation.id);

      if (expiryError) {
        console.error(
          "Failed to mark invitation as expired:",
          expiryError
        );
      }

      return NextResponse.json(
        { error: "This invitation has expired." },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // 4. Get competition
    // -----------------------------------------------------
    const {
      data: competition,
      error: competitionError,
    } = await supabase
      .from("competitions")
      .select(`
        id,
        name,
        description,
        registration_fee,
        status,
        event_id
      `)
      .eq("id", invitation.competition_id)
      .maybeSingle();

    if (competitionError) {
      console.error(
        "Competition lookup error:",
        competitionError
      );

      return NextResponse.json(
        {
          error: "Unable to load competition.",
          details: competitionError.message,
        },
        { status: 500 }
      );
    }

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found." },
        { status: 404 }
      );
    }

    // -----------------------------------------------------
    // 5. Get event
    // -----------------------------------------------------
    const {
      data: event,
      error: eventError,
    } = await supabase
      .from("events")
      .select(`
        id,
        name,
        start_date,
        end_date,
        venue
      `)
      .eq("id", competition.event_id)
      .maybeSingle();

    if (eventError) {
      console.error(
        "Event lookup error:",
        eventError
      );

      return NextResponse.json(
        {
          error: "Unable to load event.",
          details: eventError.message,
        },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    // -----------------------------------------------------
    // 6. Return complete invitation
    // -----------------------------------------------------
    return NextResponse.json({
      invitation: {
        ...invitation,
        competition: {
          ...competition,
          event,
        },
      },
    });
  } catch (error) {
    console.error(
      "GET competition member invitation error:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong.",
        details: error?.message || "Unknown server error.",
      },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// POST
// Accept competition member invitation.
// User MUST be logged in here.
// ---------------------------------------------------------
export async function POST(request) {
  try {
    // -----------------------------------------------------
    // 1. Get logged-in user
    // -----------------------------------------------------
    const authSupabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await authSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "You must be logged in to accept this invitation.",
        },
        { status: 401 }
      );
    }

    // -----------------------------------------------------
    // 2. Read token
    // -----------------------------------------------------
    const body = await request.json();
    const token = body?.token?.trim();

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // -----------------------------------------------------
    // 3. Find invitation
    // -----------------------------------------------------
    const {
      data: invitation,
      error: invitationError,
    } = await supabase
      .from("competition_member_invitations")
      .select(`
        id,
        competition_id,
        email,
        status,
        token,
        expires_at
      `)
      .eq("token", token)
      .maybeSingle();

    if (invitationError) {
      console.error(
        "Invitation fetch error:",
        invitationError
      );

      return NextResponse.json(
        { error: "Unable to process invitation." },
        { status: 500 }
      );
    }

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found." },
        { status: 404 }
      );
    }

    // -----------------------------------------------------
    // 4. Check status
    // -----------------------------------------------------
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `This invitation is already ${invitation.status.toLowerCase()}.`,
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // 5. Check expiry
    // -----------------------------------------------------
    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from("competition_member_invitations")
        .update({
          status: "EXPIRED",
        })
        .eq("id", invitation.id);

      return NextResponse.json(
        { error: "This invitation has expired." },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // 6. Check invited email
    // -----------------------------------------------------
    const invitedEmail = invitation.email
      ?.trim()
      .toLowerCase();

    const userEmail = user.email
      ?.trim()
      .toLowerCase();

    if (!userEmail || invitedEmail !== userEmail) {
      return NextResponse.json(
        {
          error:
            "This invitation was sent to a different email address. Please sign in using the invited email.",
        },
        { status: 403 }
      );
    }

    // -----------------------------------------------------
    // 7. Get profile
    // -----------------------------------------------------
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Profile fetch error:",
        profileError
      );

      return NextResponse.json(
        { error: "Unable to load your profile." },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          error:
            "Your EventNest profile could not be found. Please complete registration first.",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------------------
    // 8. Check existing membership
    // -----------------------------------------------------
    const {
      data: existingMembership,
      error: membershipCheckError,
    } = await supabase
      .from("competition_members")
      .select("id")
      .eq("competition_id", invitation.competition_id)
      .eq("member_id", user.id)
      .maybeSingle();

    if (membershipCheckError) {
      console.error(
        "Membership check error:",
        membershipCheckError
      );

      return NextResponse.json(
        { error: "Unable to check membership." },
        { status: 500 }
      );
    }

    // -----------------------------------------------------
    // 9. Already a member
    // -----------------------------------------------------
    if (existingMembership) {
      const { error: alreadyAcceptedError } =
        await supabase
          .from("competition_member_invitations")
          .update({
            status: "ACCEPTED",
            accepted_at: new Date().toISOString(),
          })
          .eq("id", invitation.id);

      if (alreadyAcceptedError) {
        console.error(
          "Invitation update error:",
          alreadyAcceptedError
        );
      }

      return NextResponse.json({
        success: true,
        alreadyMember: true,
        message:
          "You are already a member of this competition.",
        competitionId: invitation.competition_id,
      });
    }

    // -----------------------------------------------------
    // 10. Create membership
    // -----------------------------------------------------
    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("competition_members")
      .insert({
        competition_id: invitation.competition_id,
        member_id: user.id,
      })
      .select("id")
      .single();

    if (membershipError) {
      // Duplicate membership
      if (membershipError.code === "23505") {
        await supabase
          .from("competition_member_invitations")
          .update({
            status: "ACCEPTED",
            accepted_at: new Date().toISOString(),
          })
          .eq("id", invitation.id);

        return NextResponse.json({
          success: true,
          alreadyMember: true,
          message:
            "You are already a member of this competition.",
          competitionId: invitation.competition_id,
        });
      }

      console.error(
        "Membership creation error:",
        membershipError
      );

      return NextResponse.json(
        {
          error:
            "Unable to add you as a competition member.",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------------------
    // 11. Update profile role
    // Do NOT downgrade ADMIN or ORGANIZER.
    // -----------------------------------------------------
    if (
      profile.role === "PARTICIPANT" ||
      profile.role === "COMPETITION_MEMBER"
    ) {
      const { error: roleError } = await supabase
        .from("profiles")
        .update({
          role: "COMPETITION_MEMBER",
        })
        .eq("id", user.id);

      if (roleError) {
        console.error(
          "Role update error:",
          roleError
        );

        await supabase
          .from("competition_members")
          .delete()
          .eq("id", membership.id);

        return NextResponse.json(
          {
            error:
              "Unable to complete your competition member setup.",
          },
          { status: 500 }
        );
      }
    }

    // -----------------------------------------------------
    // 12. Mark invitation accepted
    // -----------------------------------------------------
    const {
      error: acceptError,
    } = await supabase
      .from("competition_member_invitations")
      .update({
        status: "ACCEPTED",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (acceptError) {
      console.error(
        "Invitation acceptance update error:",
        acceptError
      );

      await supabase
        .from("competition_members")
        .delete()
        .eq("id", membership.id);

      return NextResponse.json(
        {
          error:
            "Unable to complete the invitation acceptance.",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------------------
    // 13. Success
    // -----------------------------------------------------
    return NextResponse.json({
      success: true,
      message:
        "Competition member invitation accepted successfully.",
      competitionId: invitation.competition_id,
    });
  } catch (error) {
    console.error(
      "POST invitation acceptance error:",
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