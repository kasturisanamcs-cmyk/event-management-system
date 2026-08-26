"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const supabase = createClient();

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const { data, error: eventsError } = await supabase
      .from("events")
      .select(
        "id, name, description, start_date, end_date, venue, status, created_at"
      )
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (eventsError) {
      console.error("Events error:", eventsError);
      setError("Could not load events.");
      setLoading(false);
      return;
    }

    setEvents(data || []);
    setLoading(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Event Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Events
          </h1>

          <p className="mt-3 text-slate-400">
            Create and manage your EventNest events.
          </p>
        </div>

        <Link
          href="/dashboard/events/create-event"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
        >
          + Create Event
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-slate-400">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
            ▣
          </div>

          <h2 className="mt-5 text-xl font-semibold text-white">
            No events yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            You haven't created any events yet. Create your first event
            to start managing competitions and participants.
          </p>

          <Link
            href="/dashboard/events/create-event"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Create Your First Event
          </Link>
          
        </div>
      ) : (
        /* Events */
        <div className="grid gap-5">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-white/20"
            >
              <div className="flex flex-col justify-between gap-5 sm:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">
                      {event.name}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        event.status === "PUBLISHED"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <p className="mt-2 max-w-2xl text-sm text-slate-400">
                    {event.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                    <span>📅 {event.start_date}</span>
                    <span>📍 {event.venue}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-start">
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}