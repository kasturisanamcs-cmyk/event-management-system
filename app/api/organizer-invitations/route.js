
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/* =========================================================
   GMAIL SMTP CONFIGURATION
========================================================= */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },

  tls: {
    minVersion: "TLSv1.2",
    servername: "smtp.gmail.com",
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
});

/* =========================================================
   HTML ESCAPE
   Prevents event name from breaking the email HTML.
========================================================= */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   POST
========================================================= */

export async function POST(request) {
  let invitationId = null;

  try {
    /* =====================================================
       SUPABASE
    ===================================================== */

    const supabase = await createClient();

    /* =====================================================
       CHECK LOGIN
    ===================================================== */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Supabase auth error:", userError);

      return NextResponse.json(
        {
          error: "Unable to verify your login session.",
        },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    /* =====================================================
       GET REQUEST DATA
    ===================================================== */

    const body = await request.json();

    const eventId = body?.eventId;
    const email = body?.email?.trim().toLowerCase();

    if (!eventId || !email) {
      return NextResponse.json(
        {
          error: "Event ID and email are required.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       BASIC EMAIL VALIDATION
    ===================================================== */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       CHECK ADMIN ROLE
    ===================================================== */

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile) {
      return NextResponse.json(
        {
          error: "Your profile could not be found.",
        },
        { status: 404 }
      );
    }

    const userRole = profile.role?.trim().toUpperCase();

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Only an ADMIN can invite organizers.",
        },
        { status: 403 }
      );
    }

    /* =====================================================
       CHECK EVENT
       Event must belong to logged-in admin.
    ===================================================== */

    const {
      data: event,
      error: eventError,
    } = await supabase
      .from("events")
      .select("id, name")
      .eq("id", eventId)
      .eq("created_by", user.id)
      .maybeSingle();

    if (eventError) {
      throw eventError;
    }

    if (!event) {
      return NextResponse.json(
        {
          error:
            "Event not found or you do not have permission.",
        },
        { status: 404 }
      );
    }

    /* =====================================================
       CHECK EXISTING PENDING INVITATION
    ===================================================== */

    const {
      data: existingInvitation,
      error: existingError,
    } = await supabase
      .from("organizer_invitations")
      .select("id, status")
      .eq("event_id", eventId)
      .eq("email", email)
      .eq("status", "PENDING")
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    /* =====================================================
       CREATE TOKEN
    ===================================================== */

    const token = crypto.randomUUID();

    const expiresAt = new Date(
      Date.now() + 48 * 60 * 60 * 1000
    ).toISOString();

    let invitation;

    /* =====================================================
       UPDATE EXISTING INVITATION
    ===================================================== */

    if (existingInvitation) {
      const {
        data: updatedInvitation,
        error: updateError,
      } = await supabase
        .from("organizer_invitations")
        .update({
          token,
          expires_at: expiresAt,
          status: "PENDING",
          created_at: new Date().toISOString(),
        })
        .eq("id", existingInvitation.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      invitation = updatedInvitation;
    }

    /* =====================================================
       CREATE NEW INVITATION
    ===================================================== */

    else {
      const {
        data: newInvitation,
        error: insertError,
      } = await supabase
        .from("organizer_invitations")
        .insert({
          event_id: eventId,
          email,
          invited_by: user.id,
          status: "PENDING",
          token,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      invitation = newInvitation;
    }

    invitationId = invitation.id;

    /* =====================================================
       INVITATION URL
    ===================================================== */

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!baseUrl) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL is not configured."
      );
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, "");

    const invitationUrl =
      `${cleanBaseUrl}/organizer-invite/${token}`;

    /* =====================================================
       ESCAPE EVENT NAME FOR HTML
    ===================================================== */

    const safeEventName = escapeHtml(event.name);

    /* =====================================================
       SEND EMAIL
    ===================================================== */

    const emailResult = await transporter.sendMail({
      from: `"EventNest" <${process.env.GMAIL_USER}>`,
      to: email,
      replyTo: process.env.GMAIL_USER,

      subject:
        `You're invited to organize ${event.name}`,

      text: `
EventNest Organizer Invitation

Hello,

You have been invited to become an organizer for:

${event.name}

Accept the invitation using this link:

${invitationUrl}

This invitation expires in 48 hours.

If you were not expecting this email, you can ignore it.

— EventNest
      `.trim(),

      html: `
        <!DOCTYPE html>

        <html>
          <body
            style="
              margin:0;
              padding:0;
              background:#f4f7fb;
              font-family:Arial,Helvetica,sans-serif;
            "
          >

            <div
              style="
                max-width:600px;
                margin:40px auto;
                background:#ffffff;
                border-radius:12px;
                padding:32px;
                box-sizing:border-box;
              "
            >

              <h1
                style="
                  margin-top:0;
                  color:#111827;
                "
              >
                EventNest Organizer Invitation
              </h1>

              <p
                style="
                  color:#374151;
                  font-size:16px;
                  line-height:1.6;
                "
              >
                Hello,
              </p>

              <p
                style="
                  color:#374151;
                  font-size:16px;
                  line-height:1.6;
                "
              >
                You have been invited to become an
                organizer for:
              </p>

              <h2
                style="
                  color:#111827;
                  margin-top:24px;
                "
              >
                ${safeEventName}
              </h2>

              <p
                style="
                  color:#374151;
                  font-size:16px;
                  line-height:1.6;
                "
              >
                Click the button below to accept
                the organizer invitation.
              </p>

              <div
                style="
                  margin:30px 0;
                  text-align:center;
                "
              >

                <a
                  href="${invitationUrl}"
                  style="
                    display:inline-block;
                    padding:14px 24px;
                    background:#2563eb;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:8px;
                    font-weight:bold;
                  "
                >
                  Accept Organizer Invitation
                </a>

              </div>

              <p
                style="
                  color:#6b7280;
                  font-size:14px;
                  line-height:1.6;
                "
              >
                This invitation expires in 48 hours.
              </p>

              <p
                style="
                  color:#6b7280;
                  font-size:14px;
                  line-height:1.6;
                "
              >
                If you were not expecting this email,
                you can safely ignore it.
              </p>

              <p
                style="
                  color:#6b7280;
                  font-size:14px;
                  margin-top:30px;
                "
              >
                — EventNest
              </p>

            </div>

          </body>
        </html>
      `,
    });

    /* =====================================================
       IMPORTANT:
       CHECK ACTUAL SMTP RESULT
    ===================================================== */

    console.log("EMAIL RESULT:", {
      messageId: emailResult?.messageId,
      accepted: emailResult?.accepted,
      rejected: emailResult?.rejected,
      response: emailResult?.response,
      envelope: emailResult?.envelope,
    });

    /* =====================================================
       VERIFY RECIPIENT WAS ACCEPTED
    ===================================================== */

    const accepted =
      Array.isArray(emailResult?.accepted) &&
      emailResult.accepted
        .map((item) => String(item).toLowerCase())
        .includes(email);

    const rejected =
      Array.isArray(emailResult?.rejected) &&
      emailResult.rejected
        .map((item) => String(item).toLowerCase())
        .includes(email);

    if (!emailResult?.messageId || rejected || !accepted) {
      /* -----------------------------------------------
         EMAIL WAS NOT ACCEPTED
      ------------------------------------------------ */

      if (invitationId) {
        await supabase
          .from("organizer_invitations")
          .delete()
          .eq("id", invitationId);
      }

      return NextResponse.json(
        {
          error:
            "The email server did not accept the invitation email.",
          emailAccepted: false,
        },
        { status: 502 }
      );
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Organizer invitation email was accepted by the email server.",

        emailAccepted: true,

        messageId: emailResult.messageId,
      },
      { status: 200 }
    );
  }

  /* =======================================================
     ERROR HANDLER
  ======================================================= */

  catch (error) {
    console.error(
      "Organizer invitation error:",
      error
    );

    /* =====================================================
       DELETE INVITATION IF EMAIL FAILED
    ===================================================== */

    try {
      if (invitationId) {
        const supabase = await createClient();

        await supabase
          .from("organizer_invitations")
          .delete()
          .eq("id", invitationId);
      }
    } catch (cleanupError) {
      console.error(
        "Invitation cleanup error:",
        cleanupError
      );
    }

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong while sending the organizer invitation.",
      },
      { status: 500 }
    );
  }
}

