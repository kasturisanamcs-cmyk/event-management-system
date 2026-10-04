import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const competitionId = searchParams.get("competitionId");
  const admin = createAdminClient();
  let query = admin.from("announcements").select("id,title,message,status,published_at,event_id,competition_id,events(name),competitions(name)").eq("status","PUBLISHED").order("published_at",{ascending:false});
  if (eventId) query = query.eq("event_id", eventId);
  if (competitionId) query = query.eq("competition_id", competitionId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Could not load announcements." }, { status: 500 });
  return NextResponse.json({ announcements: data || [] });
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json();
    if (!body.title?.trim() || !body.message?.trim()) return NextResponse.json({ error: "Title and message are required." }, { status: 400 });

    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
    let authorized = profile?.role === "ADMIN";
    if (body.eventId) {
      const { data: assignment } = await admin.from("event_organizers").select("id").eq("event_id", body.eventId).eq("organizer_id", user.id).maybeSingle();
      authorized = authorized || Boolean(assignment);
    }
    if (body.competitionId) {
      const { data: membership } = await admin.from("competition_members").select("id").eq("competition_id", body.competitionId).eq("member_id", user.id).maybeSingle();
      authorized = authorized || Boolean(membership);
    }
    if (!authorized) return NextResponse.json({ error: "You are not authorized to publish this announcement." }, { status: 403 });

    const { data, error } = await admin.from("announcements").insert({
      event_id: body.eventId || null,
      competition_id: body.competitionId || null,
      title: body.title.trim(),
      message: body.message.trim(),
      status: "PUBLISHED",
      created_by: user.id,
      published_at: new Date().toISOString(),
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, announcement: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not publish announcement." }, { status: 500 });
  }
}
