import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const { qrToken } = await request.json();
    if (!qrToken) return NextResponse.json({ error: "QR token is required." }, { status: 400 });

    const admin = createAdminClient();
    const { data: ticket, error } = await admin
      .from("tickets")
      .select(`
        id,
        ticket_code,
        qr_token,
        status,
        issued_at,
        used_at,
        registrations (
          id,
          registration_number,
          participant_name,
          participant_email,
          phone,
          college,
          competition_id,
          session_id,
          competitions (id, name, event_id, events (id, name, venue))
        )
      `)
      .eq("qr_token", qrToken)
      .maybeSingle();

    if (error || !ticket?.registrations) {
      return NextResponse.json({ valid: false, error: "Invalid QR ticket." }, { status: 404 });
    }

    const registration = ticket.registrations;
    const { data: member } = await admin
      .from("competition_members")
      .select("id")
      .eq("competition_id", registration.competition_id)
      .eq("member_id", user.id)
      .maybeSingle();

    const { data: organizer } = await admin
      .from("event_organizers")
      .select("id")
      .eq("event_id", registration.competitions?.event_id)
      .eq("organizer_id", user.id)
      .maybeSingle();

    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const authorized = profile?.role === "ADMIN" || Boolean(member) || Boolean(organizer);

    if (!authorized) {
      return NextResponse.json({ valid: false, error: "You are not authorized to verify this competition ticket." }, { status: 403 });
    }

    if (ticket.status !== "ACTIVE") {
      return NextResponse.json({
        valid: false,
        used: ticket.status === "USED",
        error: ticket.status === "USED" ? "Ticket has already been used." : `Ticket is ${ticket.status.toLowerCase()}.`,
        ticket,
      }, { status: 409 });
    }

    return NextResponse.json({
      valid: true,
      ticket: {
        id: ticket.id,
        ticketCode: ticket.ticket_code,
        registrationId: registration.id,
        registrationNumber: registration.registration_number,
        participantName: registration.participant_name,
        participantEmail: registration.participant_email,
        college: registration.college,
        competition: registration.competitions?.name,
        event: registration.competitions?.events?.name,
        sessionId: registration.session_id,
      },
    });
  } catch (error) {
    console.error("Ticket verification error:", error);
    return NextResponse.json({ valid: false, error: "Ticket verification failed." }, { status: 500 });
  }
}
