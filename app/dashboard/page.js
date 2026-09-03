"use client";

import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const events = [
  {
    id: "tech-hackathon-2026",
    title: "Tech Hackathon 2026",
    date: "20 August 2026",
    time: "10:00 AM",
    venue: "Main Auditorium",
    status: "ACTIVE",
    competitions: 5,
  },
  {
    id: "ai-innovation-challenge",
    title: "AI Innovation Challenge",
    date: "25 August 2026",
    time: "11:30 AM",
    venue: "Computer Lab",
    status: "UPCOMING",
    competitions: 8,
  },
  {
    id: "web-development-contest",
    title: "Web Development Contest",
    date: "30 August 2026",
    time: "09:30 AM",
    venue: "Seminar Hall",
    status: "UPCOMING",
    competitions: 6,
  },
];

export default function EventsPage() {
  return (
    <DashboardLayout title="Events">
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              EventNest
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              Events
            </h1>

            <p className="mt-2 text-slate-400">
              View and manage events created by the system.
            </p>
          </div>

          <Link
            href="/dashboard/events/create-event"
            className="w-fit rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            + Create Event
          </Link>
        </div>

        {/* Event List */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                All Events
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Events currently available in EventNest
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {events.length} events
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}


/* =========================
   EVENT CARD
========================= */

function EventCard({ event }) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-white/10 bg-[#08152b] p-5 transition hover:border-blue-500/30 sm:flex-row sm:items-center sm:justify-between">

      {/* Event Information */}
      <div className="min-w-0">

        <div className="flex flex-wrap items-center gap-3">

          <h3 className="text-lg font-semibold text-white">
            {event.title}
          </h3>

          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
              event.status === "ACTIVE"
                ? "bg-green-500/10 text-green-400"
                : "bg-blue-500/10 text-blue-400"
            }`}
          >
            {event.status}
          </span>

        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

          <span>
            📅 {event.date}
          </span>

          <span>
            ◷ {event.time}
          </span>

          <span>
            📍 {event.venue}
          </span>

          <span>
            🏆 {event.competitions} competitions
          </span>

        </div>

      </div>

      {/* View Button */}
      <Link
        href={`/dashboard/events/${event.id}`}
        className="w-fit shrink-0 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
      >
        View
      </Link>

    </div>
  );
}