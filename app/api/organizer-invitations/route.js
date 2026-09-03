import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request) {
  let invitationId = null;

  try {
    // --------------------------------------------------
    // 1. Create Supabase server client
    // --------------------------------------------------
    const supabase = await createClient();

    // --------------------------------------------------
    // 2. Check logged-in user
    // --------------------------------------------------
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 3. Get request data
    // --------------------------------------------------
    const body = await request.json();

    const { eventId, email } = body;

    if (!eventId) {
      return NextResponse.json(
        {
          error: "Event ID is required.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error: "Organizer email is required.",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // --------------------------------------------------
    // 4. Validate email
    // --------------------------------------------------
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 5. Check current user's profile role
    // --------------------------------------------------
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile lookup error:", profileError);

      return NextResponse.json(
        {
          error: "Could not verify your account.",
        },
        { status: 500 }
      );
    }

    if (profile.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Only admins can invite organizers.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 6. Verify that this event belongs to the admin
    // --------------------------------------------------
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, name")
      .eq("id", eventId)
      .eq("created_by", user.id)
      .single();

    if (eventError || !event) {
      console.error("Event lookup error:", eventError);

      return NextResponse.json(
        {
          error: "Event not found or you do not own this event.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 7. Check for existing pending invitation
    // --------------------------------------------------
    const { data: existingInvitation, error: existingError } =
      await supabase
        .from("organizer_invitations")
        .select("id")
        .eq("event_id", eventId)
        .eq("email", cleanEmail)
        .eq("status", "PENDING")
        .maybeSingle();

    if (existingError) {
      console.error(
        "Existing invitation lookup error:",
        existingError
      );

      return NextResponse.json(
        {
          error: "Could not check existing invitations.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 8. Generate invitation token
    // --------------------------------------------------
    const token = crypto.randomUUID();

    const expiresAt = new Date(
      Date.now() + 48 * 60 * 60 * 1000
    ).toISOString();

    // --------------------------------------------------
    // 9. Update existing pending invitation
    //    OR create a new invitation
    // --------------------------------------------------
    let invitation;

    if (existingInvitation) {
      const { data, error } = await supabase
        .from("organizer_invitations")
        .update({
          invited_by: user.id,
          token,
          expires_at: expiresAt,
        })
        .eq("id", existingInvitation.id)
        .select()
        .single();

      if (error) {
        console.error(
          "Invitation update error:",
          error
        );

        return NextResponse.json(
          {
            error: "Could not update the invitation.",
          },
          { status: 500 }
        );
      }

      invitation = data;
    } else {
      const { data, error } = await supabase
        .from("organizer_invitations")
        .insert({
          event_id: eventId,
          email: cleanEmail,
          invited_by: user.id,
          status: "PENDING",
          token,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) {
        console.error(
          "Invitation creation error:",
          error
        );

        return NextResponse.json(
          {
            error: "Could not create the invitation.",
          },
          { status: 500 }
        );
      }

      invitation = data;
    }

    invitationId = invitation.id;

    // --------------------------------------------------
    // 10. Create invitation URL
    // --------------------------------------------------
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const cleanBaseUrl = baseUrl.replace(/\/$/, "");

    const invitationUrl =
      `${cleanBaseUrl}/organizer-invite/${token}`;

    // --------------------------------------------------
    // 11. Check Gmail configuration
    // --------------------------------------------------
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error(
        "GMAIL_USER or GMAIL_APP_PASSWORD is missing."
      );

      return NextResponse.json(
        {
          error: "Email service is not configured.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 12. Create Gmail transporter
    // --------------------------------------------------
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // --------------------------------------------------
    // 13. Send invitation email
    // --------------------------------------------------
    const message = await transporter.sendMail({
      from: `"EventNest" <${process.env.GMAIL_USER}>`,
      to: cleanEmail,
      subject: `You're invited to become an Organizer - ${event.name}`,

      text: `
Hello,

You have been invited to become an Organizer for the event:

${event.name}

Click the following link to accept your invitation:

${invitationUrl}

After accepting the invitation, you will be able to create your EventNest account and join the event as an Organizer.

This invitation will expire in 48 hours.

Regards,
EventNest
      `.trim(),

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px;">
          
          <h2 style="color: #2563eb;">
            EventNest Organizer Invitation
          </h2>

          <p>
            Hello,
          </p>

          <p>
            You have been invited to become an
            <strong>Organizer</strong> for:
          </p>

          <div style="
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          ">
            <strong>${event.name}</strong>
          </div>

          <p>
            Click the button below to accept your invitation
            and create your EventNest organizer account.
          </p>

          <div style="margin: 30px 0;">
            <a
              href="${invitationUrl}"
              style="
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 14px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
              "
            >
              Accept Invitation
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            This invitation will remain valid for 48 hours.
          </p>

          <p>
            Regards,<br />
            <strong>EventNest Team</strong>
          </p>

        </div>
      `,
    });

    // --------------------------------------------------
    // 14. Verify email was accepted
    // --------------------------------------------------
    if (
      !message.messageId ||
      (message.accepted &&
        message.accepted.length === 0)
    ) {
      console.error(
        "Invitation email was not accepted:",
        message
      );

      await supabase
        .from("organizer_invitations")
        .delete()
        .eq("id", invitationId);

      invitationId = null;

      return NextResponse.json(
        {
          error: "Invitation email could not be delivered.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 15. Success
    // --------------------------------------------------
    return NextResponse.json({
      success: true,
      message: `Invitation sent successfully to ${cleanEmail}.`,
      invitationId: invitation.id,
    });
  } catch (error) {
    console.error(
      "Organizer invitation error:",
      error
    );

    // --------------------------------------------------
    // Cleanup invitation if email sending failed
    // --------------------------------------------------
    if (invitationId) {
      try {
        const supabase = await createClient();

        await supabase
          .from("organizer_invitations")
          .delete()
          .eq("id", invitationId);
      } catch (cleanupError) {
        console.error(
          "Invitation cleanup error:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Something went wrong while sending the organizer invitation.",
      },
      { status: 500 }
    );
  }
}