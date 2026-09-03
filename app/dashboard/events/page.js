"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function MyEventsPage() {
  const supabase = createClient();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (eventsError) {
        throw eventsError;
      }

      setEvents(data || []);
    } catch (err) {
      console.error("Load events error:", err);
      setError(
        err?.message || "Something went wrong while loading your events."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="My Events">
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              EventNest
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              My Events
            </h1>

            <p className="mt-2 text-slate-400">
              Create and manage your events from one place.
            </p>
          </div>

          <Link
            href="/dashboard/events/create-event"
            className="w-fit rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            + Create Event
          </Link>

        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <p className="text-sm text-slate-400">
              Loading your events...
            </p>
          </div>
        ) : events.length === 0 ? (

          /* Empty State */
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl text-blue-400">
              +
            </div>

            <h2 className="mt-5 text-xl font-semibold text-white">
              No events yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              You have not created any events yet. Create your first event
              to start managing competitions, organizers and volunteers.
            </p>

            <Link
              href="/dashboard/events/create-event"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Create Your First Event →
            </Link>

          </div>

        ) : (

          /* Event List */
          <div className="space-y-5">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Your Events
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {events.length} event{events.length !== 1 ? "s" : ""} created
                </p>
              </div>
            </div>

            <div className="grid gap-5">

              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ))}

            </div>

          </div>

        )}

      </div>
    </DashboardLayout>
  );
}


/* =========================
   EVENT CARD
========================= */

function EventCard({ event }) {
  const status = event.status || "DRAFT";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-blue-500/20 hover:bg-white/[0.06]">

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        {/* Event Information */}
        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3">

            <h3 className="text-lg font-semibold text-white">
              {event.name}
            </h3>

            <StatusBadge status={status} />

          </div>

          {event.description && (
            <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-slate-400">
              {event.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

            {event.start_date && (
              <span>
                📅 {formatDate(event.start_date)}
              </span>
            )}

            {event.end_date && (
              <span>
                → {formatDate(event.end_date)}
              </span>
            )}

            {event.venue && (
              <span>
                📍 {event.venue}
              </span>
            )}

          </div>

        </div>

        {/* Manage Button */}
        <Link
          href={`/dashboard/events/${event.id}`}
          className="w-fit shrink-0 rounded-xl border border-white/10 bg-[#08152b] px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
        >
          Manage Event →
        </Link>

      </div>

    </div>
  );
}


/* =========================
   STATUS BADGE
========================= */

function StatusBadge({ status }) {
  const styles = {
    DRAFT: "bg-yellow-500/10 text-yellow-400",
    ACTIVE: "bg-green-500/10 text-green-400",
    UPCOMING: "bg-blue-500/10 text-blue-400",
    COMPLETED: "bg-slate-500/10 text-slate-400",
    CANCELLED: "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
        styles[status] || styles.DRAFT
      }`}
    >
      {status}
    </span>
  );
}


/* =========================
   DATE FORMAT
========================= */

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}