import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const { qrToken } = await request.json();
    if (!qrToken) return NextResponse.json({ error: "QR token is required." }, { status: 400 });

    const admin = createAdminClient();
    const { data: ticket } = await admin
      .from("tickets")
      .select(`id, status, registration_id, registrations(id, competition_id, session_id, competitions(event_id, name))`)
      .eq("qr_token", qrToken)
      .maybeSingle();

    if (!ticket?.registrations) return NextResponse.json({ error: "Invalid ticket." }, { status: 404 });
    if (ticket.status !== "ACTIVE") return NextResponse.json({ error: "Ticket is not active." }, { status: 409 });

    const registration = ticket.registrations;
    const { data: member } = await admin.from("competition_members").select("id").eq("competition_id", registration.competition_id).eq("member_id", user.id).maybeSingle();
    const { data: organizer } = await admin.from("event_organizers").select("id").eq("event_id", registration.competitions?.event_id).eq("organizer_id", user.id).maybeSingle();
    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();

    if (profile?.role !== "ADMIN" && !member && !organizer) {
      return NextResponse.json({ error: "You are not authorized to check in this participant." }, { status: 403 });
    }

    const { data: existing } = await admin.from("attendance").select("id, checked_in_at").eq("registration_id", registration.id).maybeSingle();
    if (existing) return NextResponse.json({ alreadyCheckedIn: true, attendance: existing }, { status: 409 });

    const { data: attendance, error: attendanceError } = await admin
      .from("attendance")
      .insert({
        registration_id: registration.id,
        session_id: registration.session_id,
        checked_in_by: user.id,
        status: "CHECKED_IN",
      })
      .select()
      .single();

    if (attendanceError) {
      console.error("Attendance insert error:", attendanceError);
      return NextResponse.json({ error: "Attendance could not be recorded." }, { status: 500 });
    }

    await admin.from("tickets").update({ status: "USED", used_at: new Date().toISOString() }).eq("id", ticket.id);

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: "Check-in failed." }, { status: 500 });
  }
}
