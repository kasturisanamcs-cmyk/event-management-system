import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();

    // 1. Check if user is logged in
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

    // 2. Get invitation token
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

    // 3. Find invitation
    const { data: invitation, error: invitationError } = await supabase
      .from("organizer_invitations")
      .select("*")
      .eq("token", token)
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json(
        {
          error: "Invalid invitation.",
        },
        { status: 404 }
      );
    }

    // 4. Check invitation status
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        {
          error: "This invitation is no longer pending.",
        },
        { status: 400 }
      );
    }

    // 5. Check invitation expiry
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        {
          error: "This invitation has expired.",
        },
        { status: 400 }
      );
    }

    // 6. Make sure logged-in email matches invitation email
    if (
      user.email &&
      invitation.email.toLowerCase() !== user.email.toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "This invitation was sent to a different email address.",
        },
        { status: 403 }
      );
    }

    // 7. Update user's profile role to ORGANIZER
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: "ORGANIZER",
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);

      return NextResponse.json(
        {
          error: "Could not update your profile.",
        },
        { status: 500 }
      );
    }

    // 8. Connect organizer with the event
    const { error: organizerError } = await supabase
      .from("event_organizers")
      .insert({
        event_id: invitation.event_id,
        organizer_id: user.id,
      });

    // If relationship already exists, continue
    if (organizerError && organizerError.code !== "23505") {
      console.error("Event organizer error:", organizerError);

      return NextResponse.json(
        {
          error: "Could not connect you to the event.",
        },
        { status: 500 }
      );
    }

    // 9. Mark invitation as accepted
    const { error: updateError } = await supabase
      .from("organizer_invitations")
      .update({
        status: "ACCEPTED",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (updateError) {
      console.error("Invitation update error:", updateError);

      return NextResponse.json(
        {
          error: "Could not complete the invitation.",
        },
        { status: 500 }
      );
    }

    // 10. Success
    return NextResponse.json({
      success: true,
      message: "Organizer invitation accepted successfully.",
      eventId: invitation.event_id,
    });
  } catch (error) {
    console.error("Accept invitation error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while accepting the invitation.",
      },
      { status: 500 }
    );
  }
}