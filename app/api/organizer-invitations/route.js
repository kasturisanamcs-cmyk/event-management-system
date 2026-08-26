import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
tls: {
  minVersion: "TLSv1.2",
  rejectUnauthorized: false,
},
});
try {
  await transporter.verify();
  console.log("GMAIL SMTP CONNECTION WORKS");
} catch (error) {
  console.error("GMAIL SMTP VERIFY ERROR:", error);
}

export async function POST(request) {
  try {
    const supabase = await createClient();

    // Check logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    // Get request data
    const body = await request.json();

    const eventId = body.eventId;
    const email = body.email?.trim().toLowerCase();
        

    if (!eventId || !email) {
      return NextResponse.json(
        { error: "Event ID and email are required." },
        { status: 400 }
      );
    }

    // Check that current user is ADMIN
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (profile?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only an ADMIN can invite organizers." },
        { status: 403 }
      );
    }

    // Check event belongs to this admin
    const { data: event, error: eventError } = await supabase
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
        { error: "Event not found or you do not have permission." },
        { status: 404 }
      );
    }
        // --------------------------------
// CHECK EXISTING PENDING INVITATION
// --------------------------------

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

// --------------------------------
// CREATE NEW TOKEN + EXPIRY
// --------------------------------

const token = crypto.randomUUID();

const expiresAt = new Date(
  Date.now() + 48 * 60 * 60 * 1000
).toISOString();

let invitation;

// --------------------------------
// IF PENDING EXISTS → UPDATE IT
// OTHERWISE → CREATE NEW ONE
// --------------------------------

if (existingInvitation) {
  const { data: updatedInvitation, error: updateError } =
    await supabase
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
} else {
  const { data: newInvitation, error: insertError } =
    await supabase
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
    

    
    // Invitation URL
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const invitationUrl =
      `${baseUrl}/organizer-invite/${token}`;

    // Send email
    const emailResult = await transporter.sendMail({
  from: `"EventNest" <${process.env.GMAIL_USER}>`,
  to: email,
  subject: `You're invited to organize ${event.name}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h1>EventNest Organizer Invitation</h1>

      <p>Hello,</p>

      <p>
        You have been invited to become an organizer for:
      </p>

      <h2>${event.name}</h2>

      <p>
        Click the button below to accept the invitation.
      </p>

      <p>
        <a
          href="${invitationUrl}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#2563eb;
            color:white;
            text-decoration:none;
            border-radius:8px;
            font-weight:bold;
          "
        >
          Accept Organizer Invitation
        </a>
      </p>

      <p>This invitation expires in 48 hours.</p>

      <p>
        If you were not expecting this invitation, you can ignore this email.
      </p>

      <p>— EventNest</p>
    </div>
  `,
});

    if (!emailResult?.messageId) {
  await supabase
    .from("organizer_invitations")
    .delete()
    .eq("id", invitation.id);

  throw new Error("Email could not be sent.");
}

    return NextResponse.json({
      success: true,
      message: "Organizer invitation sent successfully.",
    });
  } catch (error) {
    console.error("Organizer invitation error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong while sending the invitation.",
      },
      { status: 500 }
    );
  }
}