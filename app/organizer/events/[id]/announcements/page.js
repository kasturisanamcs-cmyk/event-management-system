/* eslint-disable react-hooks/immutability, react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/client";

export default function OrganizerAnnouncementsPage(){
 const {id:eventId}=useParams(); const supabase=createClient(); const [event,setEvent]=useState(null); const [rows,setRows]=useState([]); const [form,setForm]=useState({title:"",message:""}); const [saving,setSaving]=useState(false); const [error,setError]=useState("");
 useEffect(()=>{if(eventId)load()},[eventId]);
 async function load(){const {data:{user}}=await supabase.auth.getUser(); if(!user)return; const {data:e}=await supabase.from("events").select("id,name").eq("id",eventId).single(); setEvent(e); const r=await fetch(`/api/announcements?eventId=${eventId}`); const d=await r.json(); setRows(d.announcements||[])}
 async function publish(e){e.preventDefault();setSaving(true);setError("");try{const r=await fetch("/api/announcements",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({eventId,title:form.title,message:form.message})});const d=await r.json();if(!r.ok)throw new Error(d.error);setForm({title:"",message:""});await load()}catch(err){setError(err.message)}finally{setSaving(false)}}
 return <DashboardLayout title="Announcements"><main className="mx-auto max-w-5xl"><Link href={`/organizer/events/${eventId}`} className="text-sm text-slate-400 hover:text-white">← Back to Event</Link><header className="mt-6"><p className="text-xs uppercase tracking-[0.2em] text-blue-400">Organizer</p><h1 className="mt-2 text-3xl font-bold">{event?.name||"Event"} Announcements</h1></header><form onSubmit={publish} className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6"><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Announcement title" className="w-full rounded-xl border border-white/10 bg-[#071225] px-4 py-3 text-white outline-none"/><textarea required rows={5} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Write the announcement..." className="mt-4 w-full rounded-xl border border-white/10 bg-[#071225] px-4 py-3 text-white outline-none"/>{error&&<p className="mt-3 text-sm text-red-300">{error}</p>}<button disabled={saving} className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold disabled:opacity-50">{saving?"Publishing...":"Publish Announcement"}</button></form><section className="mt-8 space-y-4">{rows.map(r=><article key={r.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"><p className="text-xs text-blue-400">{new Date(r.published_at).toLocaleString("en-IN")}</p><h2 className="mt-2 text-xl font-bold">{r.title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-400">{r.message}</p></article>)}{rows.length===0&&<p className="text-slate-500">No announcements yet.</p>}</section></main></DashboardLayout>
}
