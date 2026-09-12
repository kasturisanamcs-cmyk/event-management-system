import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

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
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. Read request body
    // --------------------------------------------------
    const body = await request.json();

    const competitionId = body.competitionId;
    const email = body.email?.trim().toLowerCase();

    if (!competitionId || !email) {
      return NextResponse.json(
        { error: "Competition ID and email are required." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Validate email
    // --------------------------------------------------
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. Get organizer profile
    // --------------------------------------------------
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Your profile could not be found." },
        { status: 404 }
      );
    }

    if (profile.role !== "ORGANIZER") {
      return NextResponse.json(
        { error: "Only organizers can invite competition members." },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 5. Create service-role client
    // --------------------------------------------------
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Supabase service role environment variables are missing.");

      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient(
      supabaseUrl,
      serviceRoleKey
    );

    // --------------------------------------------------
    // 6. Get competition and event
    // --------------------------------------------------
    const { data: competition, error: competitionError } =
      await supabase
        .from("competitions")
        .select(
          `
          id,
          name,
          event_id,
          events (
            id,
            name
          )
          `
        )
        .eq("id", competitionId)
        .single();

    if (competitionError || !competition) {
      console.error("Competition lookup error:", competitionError);

      return NextResponse.json(
        { error: "Competition not found." },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 7. Verify organizer is assigned to this event
    // --------------------------------------------------
    const { data: organizerAssignment, error: assignmentError } =
      await supabase
        .from("event_organizers")
        .select("id")
        .eq("event_id", competition.event_id)
        .eq("organizer_id", user.id)
        .maybeSingle();

    if (assignmentError) {
      console.error(
        "Organizer assignment check error:",
        assignmentError
      );

      return NextResponse.json(
        { error: "Unable to verify your organizer access." },
        { status: 500 }
      );
    }

    if (!organizerAssignment) {
      return NextResponse.json(
        {
          error:
            "You are not assigned as an organizer for this competition's event.",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 8. Find existing EventNest user with this email
    // --------------------------------------------------
    let existingUser = null;

    for (let page = 1; page <= 10; page++) {
      const { data: usersData, error: usersError } =
        await adminSupabase.auth.admin.listUsers({
          page,
          perPage: 1000,
        });

      if (usersError) {
        console.error("User lookup error:", usersError);
        break;
      }

      const users = usersData?.users || [];

      existingUser = users.find(
        (authUser) =>
          authUser.email?.toLowerCase() === email
      );

      if (existingUser) {
        break;
      }

      if (users.length < 1000) {
        break;
      }
    }

    // --------------------------------------------------
    // 9. Check whether user is already a competition member
    // --------------------------------------------------
    if (existingUser) {
      const { data: existingMembership, error: membershipError } =
        await adminSupabase
          .from("competition_members")
          .select("id")
          .eq("competition_id", competitionId)
          .eq("member_id", existingUser.id)
          .maybeSingle();

      if (membershipError) {
        console.error(
          "Membership check error:",
          membershipError
        );

        return NextResponse.json(
          { error: "Unable to check existing membership." },
          { status: 500 }
        );
      }

      if (existingMembership) {
        return NextResponse.json(
          {
            error:
              "This person is already a member of this competition.",
          },
          { status: 409 }
        );
      }
    }

    // --------------------------------------------------
    // 10. Check existing pending invitation
    // --------------------------------------------------
    const { data: existingInvitation, error: invitationCheckError } =
      await adminSupabase
        .from("competition_member_invitations")
        .select("*")
        .eq("competition_id", competitionId)
        .eq("email", email)
        .eq("status", "PENDING")
        .maybeSingle();

    if (invitationCheckError) {
      console.error(
        "Invitation check error:",
        invitationCheckError
      );

      return NextResponse.json(
        { error: "Unable to check existing invitation." },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 11. Create new token and expiry
    // --------------------------------------------------
    const token = crypto.randomUUID();

    const expiresAt = new Date(
      Date.now() + 48 * 60 * 60 * 1000
    ).toISOString();

    let invitation;
    let createdNewInvitation = false;

    // Keep old values so we can restore them if email sending fails
    const previousInvitation = existingInvitation
      ? {
          token: existingInvitation.token,
          expires_at: existingInvitation.expires_at,
          invited_by: existingInvitation.invited_by,
        }
      : null;

    // --------------------------------------------------
    // 12. Update existing invitation or create new one
    // --------------------------------------------------
    if (existingInvitation) {
      const { data, error } = await adminSupabase
        .from("competition_member_invitations")
        .update({
          token,
          expires_at: expiresAt,
          invited_by: user.id,
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
          { error: "Failed to update the invitation." },
          { status: 500 }
        );
      }

      invitation = data;
    } else {
      const { data, error } = await adminSupabase
        .from("competition_member_invitations")
        .insert({
          competition_id: competitionId,
          email,
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
          { error: "Failed to create the invitation." },
          { status: 500 }
        );
      }

      invitation = data;
      createdNewInvitation = true;
    }

    // --------------------------------------------------
    // 13. Create invitation URL
    // --------------------------------------------------
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const invitationUrl =
      `${siteUrl}/competition-member-invite/${invitation.token}`;

    // --------------------------------------------------
    // 14. Check Gmail configuration
    // --------------------------------------------------
    if (
      !process.env.GMAIL_USER ||
      !process.env.GMAIL_APP_PASSWORD
    ) {
      console.error(
        "Gmail environment variables are missing."
      );

      if (createdNewInvitation) {
        await adminSupabase
          .from("competition_member_invitations")
          .delete()
          .eq("id", invitation.id);
      } else if (previousInvitation) {
        await adminSupabase
          .from("competition_member_invitations")
          .update({
            token: previousInvitation.token,
            expires_at: previousInvitation.expires_at,
            invited_by: previousInvitation.invited_by,
          })
          .eq("id", invitation.id);
      }

      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 15. Create Gmail transporter
    // --------------------------------------------------
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // --------------------------------------------------
    // 16. Send invitation email
    // --------------------------------------------------
    try {
      await transporter.sendMail({
        from: `"EventNest" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `You're invited to join ${competition.name} on EventNest`,

        text: `
Hello,

You have been invited to join "${competition.name}" as a Competition Member on EventNest.

Competition: ${competition.name}
Event: ${competition.events?.name || "EventNest Event"}

Accept your invitation here:

${invitationUrl}

This invitation is valid for 48 hours.

If you did not expect this invitation, you can safely ignore this email.

Regards,
EventNest Team
        `,

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              background:#020617;
              color:#f8fafc;
              padding:30px;
            "
          >
            <div
              style="
                max-width:600px;
                margin:auto;
                background:#0b1220;
                border:1px solid rgba(255,255,255,0.08);
                border-radius:14px;
                padding:30px;
              "
            >

              <h1
                style="
                  margin-top:0;
                  color:#818cf8;
                "
              >
                EventNest
              </h1>

              <h2
                style="
                  color:#f8fafc;
                "
              >
                Competition Member Invitation
              </h2>

              <p
                style="
                  color:#cbd5e1;
                  line-height:1.6;
                "
              >
                You have been invited to join
                <strong>${competition.name}</strong>
                as a Competition Member.
              </p>

              <p
                style="
                  color:#94a3b8;
                "
              >
                Event:
                <strong
                  style="
                    color:#f8fafc;
                  "
                >
                  ${competition.events?.name || "EventNest Event"}
                </strong>
              </p>

              <div
                style="
                  margin:30px 0;
                "
              >
                <a
                  href="${invitationUrl}"
                  style="
                    display:inline-block;
                    background:#6366f1;
                    color:white;
                    text-decoration:none;
                    padding:14px 22px;
                    border-radius:8px;
                    font-weight:bold;
                  "
                >
                  Accept Invitation
                </a>
              </div>

              <p
                style="
                  color:#94a3b8;
                  font-size:14px;
                "
              >
                This invitation is valid for 48 hours.
              </p>

              <p
                style="
                  color:#64748b;
                  font-size:13px;
                "
              >
                If you did not expect this invitation,
                you can safely ignore this email.
              </p>

            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error(
        "Competition member invitation email error:",
        emailError
      );

      // Restore previous invitation if this was a resend
      if (createdNewInvitation) {
        await adminSupabase
          .from("competition_member_invitations")
          .delete()
          .eq("id", invitation.id);
      } else if (previousInvitation) {
        await adminSupabase
          .from("competition_member_invitations")
          .update({
            token: previousInvitation.token,
            expires_at: previousInvitation.expires_at,
            invited_by: previousInvitation.invited_by,
          })
          .eq("id", invitation.id);
      }

      return NextResponse.json(
        {
          error:
            "The invitation could not be sent. Please try again.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 17. Success
    // --------------------------------------------------
    return NextResponse.json(
      {
        success: true,
        message:
          "Competition member invitation sent successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Competition member invitation API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while sending the invitation.",
      },
      { status: 500 }
    );
  }
}