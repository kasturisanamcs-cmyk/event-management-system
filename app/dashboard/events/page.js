"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

      // Get the current user's role.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      let query = supabase
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
          created_by,
          created_at,
          competitions (
            id
          )
        `)
        .order("created_at", { ascending: false });

      /*
       * ADMIN:
       * See all events.
       *
       * ORGANIZER:
       * See only events created by the logged-in organizer.
       */
      if (profile?.role !== "ADMIN") {
        query = query.eq("created_by", user.id);
      }

      const { data, error: eventsError } = await query;

      if (eventsError) {
        throw eventsError;
      }

      setEvents(data || []);
    } catch (err) {
      console.error("Load events error:", err);

      setError(
        err?.message || "Something went wrong while loading events."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            EventNest
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            My Events
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Create and manage your events from one place.
          </p>
        </div>

        <Link
          href="/dashboard/events/create-event"
          className="inline-flex w-fit shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
        >
          + Create Event
        </Link>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading events...
          </p>
        </div>
      ) : events.length === 0 ? (
        /* EMPTY STATE */
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl text-blue-400">
            +
          </div>

          <h2 className="mt-5 text-xl font-semibold text-white">
            No events yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            You have not created any events yet. Create your first event
            to start managing competitions, organizers, and participants.
          </p>

          <Link
            href="/dashboard/events/create-event"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Create Your First Event →
          </Link>
        </div>
      ) : (
        /* EVENT LIST */
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Your Events
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="grid gap-5">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPublished={loadEvents}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   EVENT CARD
========================= */

function EventCard({ event, onPublished }) {
  const supabase = createClient();

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  const status = event.status || "DRAFT";

  const competitionCount = Array.isArray(event.competitions)
    ? event.competitions.length
    : 0;

  async function handlePublish() {
    if (publishing) return;

    const confirmed = window.confirm(
      `Publish "${event.name}"?\n\nOnce published, participants will be able to see this event.`
    );

    if (!confirmed) {
      return;
    }

    setPublishing(true);
    setPublishError("");

    try {
      const { error } = await supabase
        .from("events")
        .update({
          status: "PUBLISHED",
        })
        .eq("id", event.id);

      if (error) {
        throw error;
      }

      await onPublished();
    } catch (err) {
      console.error("Publish event error:", err);

      setPublishError(
        err?.message || "Unable to publish this event."
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-blue-500/20 hover:bg-white/[0.06]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* EVENT INFORMATION */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="break-words text-lg font-semibold text-white sm:text-xl">
                {event.name || "Untitled Event"}
              </h3>

              <StatusBadge status={status} />
            </div>

            {event.description && (
              <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-400">
                {event.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              {event.start_date && (
                <span className="break-words">
                  📅 {formatDate(event.start_date)}
                </span>
              )}

              {event.end_date && (
                <span className="break-words">
                  → {formatDate(event.end_date)}
                </span>
              )}

              {event.venue && (
                <span className="break-words">
                  📍 {event.venue}
                </span>
              )}

              <span>
                🏆 {competitionCount} competition
                {competitionCount !== 1 ? "s" : ""}
              </span>
            </div>

            {event.registration_deadline && (
              <p className="mt-3 text-xs text-slate-500">
                Registration deadline:{" "}
                <span className="text-slate-400">
                  {formatDate(event.registration_deadline)}
                </span>
              </p>
            )}

            {publishError && (
              <p className="mt-3 text-xs text-red-400">
                {publishError}
              </p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex shrink-0 flex-wrap gap-2">
            {/* EDIT */}
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#08152b] px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white sm:w-auto"
            >
              Edit
            </Link>

            {/* PUBLISH */}
            {status === "DRAFT" && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {publishing ? "Publishing..." : "Publish Event"}
              </button>
            )}

            {/* MANAGE EVENT */}
            <Link
              href={`/dashboard/events/${event.id}`}
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#08152b] px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white sm:w-auto"
            >
              Manage Event →
            </Link>
          </div>
        </div>
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
    PUBLISHED: "bg-green-500/10 text-green-400",
    ACTIVE: "bg-green-500/10 text-green-400",
    UPCOMING: "bg-blue-500/10 text-blue-400",
    COMPLETED: "bg-slate-500/10 text-slate-400",
    CANCELLED: "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
        styles[status] || "bg-slate-500/10 text-slate-400"
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

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}