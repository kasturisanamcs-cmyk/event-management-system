import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// ---------------------------------------------------------
// GET
// Used by the invitation page to check invitation details
// ---------------------------------------------------------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const { data: invitation, error } = await supabase
      .from("competition_member_invitations")
      .select(`
        id,
        email,
        status,
        token,
        expires_at,
        created_at,
        competition:competitions (
          id,
          name,
          description,
          registration_fee,
          status,
          event:events (
            id,
            name,
            start_date,
            end_date,
            venue
          )
        )
      `)
      .eq("token", token)
      .maybeSingle();

    if (error) {
      console.error("Invitation lookup error:", error);

      return NextResponse.json(
        { error: "Unable to load invitation." },
        { status: 500 }
      );
    }

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found." },
        { status: 404 }
      );
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `This invitation is already ${invitation.status.toLowerCase()}.`,
        },
        { status: 400 }
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from("competition_member_invitations")
        .update({ status: "EXPIRED" })
        .eq("id", invitation.id);

      return NextResponse.json(
        { error: "This invitation has expired." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      invitation,
    });
  } catch (error) {
    console.error("GET invitation error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// POST
// Accept competition member invitation
// ---------------------------------------------------------
export async function POST(request) {
  try {
    // Get currently logged-in user from normal Supabase client
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

    const body = await request.json();
    const token = body?.token;

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // -----------------------------------------------------
    // Find invitation
    // -----------------------------------------------------
    const { data: invitation, error: invitationError } = await supabase
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
      console.error("Invitation fetch error:", invitationError);

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
    // Check invitation status
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
    // Check expiry
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
    // Check invited email matches logged-in account
    // -----------------------------------------------------
    const invitedEmail = invitation.email?.trim().toLowerCase();
    const userEmail = user.email?.trim().toLowerCase();

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
    // Get user profile
    // -----------------------------------------------------
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);

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
    // Check whether already a member
    // -----------------------------------------------------
    const { data: existingMembership, error: membershipCheckError } =
      await supabase
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
    // Already member
    // -----------------------------------------------------
    if (existingMembership) {
      const { error: alreadyAcceptedError } = await supabase
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
        message: "You are already a member of this competition.",
        competitionId: invitation.competition_id,
      });
    }

    // -----------------------------------------------------
    // Create competition membership
    // -----------------------------------------------------
    const { data: membership, error: membershipError } =
      await supabase
        .from("competition_members")
        .insert({
          competition_id: invitation.competition_id,
          member_id: user.id,
        })
        .select("id")
        .single();

    if (membershipError) {
      // Unique constraint means membership may have been
      // created by another request at the same time.
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
          message: "You are already a member of this competition.",
          competitionId: invitation.competition_id,
        });
      }

      console.error(
        "Membership creation error:",
        membershipError
      );

      return NextResponse.json(
        {
          error: "Unable to add you as a competition member.",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------------------
    // Update profile role
    //
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
        console.error("Role update error:", roleError);

        // Roll back membership if role update fails.
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
    // Mark invitation as accepted
    // -----------------------------------------------------
    const { error: acceptError } = await supabase
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

      // Roll back membership because invitation state
      // could not be completed.
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
    // Success
    // -----------------------------------------------------
    return NextResponse.json({
      success: true,
      message: "Competition member invitation accepted successfully.",
      competitionId: invitation.competition_id,
    });
  } catch (error) {
    console.error("POST invitation acceptance error:", error);

    return NextResponse.json(
      { error: "Something went wrong while accepting the invitation." },
      { status: 500 }
    );
  }
}