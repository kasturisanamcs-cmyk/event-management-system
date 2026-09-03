import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

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
    // 3. Create server-only Supabase admin client
    // --------------------------------------------------
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is missing.");

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
    // 4. Find invitation
    // --------------------------------------------------
    const {
      data: invitation,
      error: invitationError,
    } = await supabaseAdmin
      .from("organizer_invitations")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (invitationError) {
      console.error("Invitation lookup error:", invitationError);

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
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        {
          error: "This invitation has expired.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 7. Make sure email matches
    // --------------------------------------------------
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

    // --------------------------------------------------
    // 8. Update profile role
    // --------------------------------------------------
    const { error: profileError } = await supabaseAdmin
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

    // --------------------------------------------------
    // 9. Connect organizer to event
    // --------------------------------------------------
    const { error: organizerError } = await supabaseAdmin
      .from("event_organizers")
      .insert({
        event_id: invitation.event_id,
        organizer_id: user.id,
      });

    // If already connected, continue
    if (organizerError && organizerError.code !== "23505") {
      console.error("Event organizer error:", organizerError);

      return NextResponse.json(
        {
          error: "Could not connect you to the event.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 10. Mark invitation as accepted
    // --------------------------------------------------
    const { error: updateError } = await supabaseAdmin
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

    // --------------------------------------------------
    // 11. Success
    // --------------------------------------------------
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