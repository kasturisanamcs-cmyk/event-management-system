import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || !["ADMIN", "ORGANIZER"].includes(profile.role)) return NextResponse.json({ error: "Organizer access required." }, { status: 403 });

    let eventIds = [];
    if (profile.role === "ADMIN") {
      const { data: events } = await admin.from("events").select("id");
      eventIds = (events || []).map(e => e.id);
    } else {
      const { data: assignments } = await admin.from("event_organizers").select("event_id").eq("organizer_id", user.id);
      eventIds = (assignments || []).map(a => a.event_id);
    }

    if (!eventIds.length) return NextResponse.json({ events: [], competitions: [], registrations: [], payments: [], attendance: [] });

    const { data: competitions } = await admin.from("competitions").select("id,name,event_id,registration_fee,status,competition_date,venue,events(name)").in("event_id", eventIds).order("created_at", { ascending: false });
    const competitionIds = (competitions || []).map(c => c.id);
    if (!competitionIds.length) return NextResponse.json({ events: eventIds, competitions: [], registrations: [], payments: [], attendance: [] });

    const { data: registrations } = await admin.from("registrations").select("id,registration_number,status,registered_at,participant_name,participant_email,college,competition_id,session_id,competitions(name,events(name))").in("competition_id", competitionIds).order("registered_at", { ascending: false });
    const registrationIds = (registrations || []).map(r => r.id);
    const { data: payments } = registrationIds.length ? await admin.from("payments").select("id,registration_id,amount,status,provider_payment_id,paid_at,created_at").in("registration_id", registrationIds).order("created_at", { ascending: false }) : { data: [] };
    const { data: attendance } = registrationIds.length ? await admin.from("attendance").select("id,registration_id,session_id,checked_in_at,status").in("registration_id", registrationIds).order("checked_in_at", { ascending: false }) : { data: [] };
    const { data: members } = await admin.from("competition_members").select("id,competition_id,member_id,assigned_at,profiles(full_name)").in("competition_id", competitionIds);
    const { data: sessions } = await admin.from("competition_sessions").select("id,competition_id,session_name,session_date,start_time,end_time,venue,capacity").in("competition_id", competitionIds).order("session_date");
    const { data: events } = await admin.from("events").select("id,name,start_date,end_date,venue,status").in("id", eventIds);
    return NextResponse.json({ events: events || [], competitions: competitions || [], registrations: registrations || [], payments: payments || [], attendance: attendance || [], members: members || [], sessions: sessions || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load organizer operations." }, { status: 500 });
  }
}
