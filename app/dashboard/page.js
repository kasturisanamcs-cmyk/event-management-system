"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function EventsPage() {
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
      const { data, error } = await supabase
        .from("events")
        .select(`
          id,
          name,
          description,
          start_date,
          end_date,
          registration_deadline,
          venue,
          event_image,
          status,
          created_at,
          competitions (
            id
          )
        `)
        .order("start_date", { ascending: true });

      if (error) {
        throw error;
      }

      setEvents(data || []);
    } catch (err) {
      console.error("Error loading events:", err);
      setError(err.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(date) {
    if (!date) return "Not specified";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusStyle(status) {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500/10 text-green-400";

      case "DRAFT":
        return "bg-yellow-500/10 text-yellow-400";

      case "CANCELLED":
        return "bg-red-500/10 text-red-400";

      default:
        return "bg-blue-500/10 text-blue-400";
    }
  }

  return (
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
            View and manage events created in the system.
          </p>
        </div>

        <Link
          href="/dashboard/events/create-event"
          className="w-fit rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          + Create Event
        </Link>
      </div>

      {/* Events Container */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">

        {/* Section Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              All Events
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Events currently stored in EventNest
            </p>
          </div>

          {!loading && (
            <span className="text-sm text-slate-500">
              {events.length}{" "}
              {events.length === 1 ? "event" : "events"}
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

            <p className="mt-4 text-sm text-slate-400">
              Loading events...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-sm font-medium text-red-400">
              {error}
            </p>

            <button
              onClick={loadEvents}
              className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && events.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-4xl">📅</div>

            <h3 className="mt-4 text-lg font-semibold text-white">
              No events found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Create your first event to get started.
            </p>

            <Link
              href="/dashboard/events/create-event"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Create Event
            </Link>
          </div>
        )}

        {/* Event List */}
        {!loading && !error && events.length > 0 && (
          <div className="mt-6 space-y-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                formatDate={formatDate}
                formatTime={formatTime}
                getStatusStyle={getStatusStyle}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}


/* =====================================================
   EVENT CARD
===================================================== */

function EventCard({
  event,
  formatDate,
  formatTime,
  getStatusStyle,
}) {
  const competitionCount = event.competitions?.length || 0;

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-white/10 bg-[#08152b] p-4 transition hover:border-blue-500/30 sm:p-5 lg:flex-row lg:items-center lg:justify-between">

      {/* Event Information */}
      <div className="min-w-0">

        {/* Title + Status */}
        <div className="flex flex-wrap items-center gap-3">

          <h3 className="break-words text-lg font-semibold text-white">
            {event.name}
          </h3>

          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusStyle(
              event.status
            )}`}
          >
            {event.status || "UNKNOWN"}
          </span>

        </div>

        {/* Description */}
        {event.description && (
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            {event.description}
          </p>
        )}

        {/* Event Information */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

          <span>
            📅 {formatDate(event.start_date)}
          </span>

          <span>
            ◷ {formatTime(event.start_date)}
          </span>

          <span>
            📍 {event.venue || "Venue not specified"}
          </span>

          <span>
            🏆 {competitionCount}{" "}
            {competitionCount === 1 ? "competition" : "competitions"}
          </span>

        </div>

        {/* Registration Deadline */}
        {event.registration_deadline && (
          <p className="mt-3 text-xs text-slate-500">
            Registration deadline:{" "}
            <span className="text-slate-400">
              {formatDate(event.registration_deadline)}
            </span>
          </p>
        )}

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