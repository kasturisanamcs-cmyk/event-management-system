"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function MyEventsPage() {
  const supabase = createClient();

  const [events, setEvents] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    setError("");

    try {
      // ---------------------------------------------------------
      // CURRENT USER
      // ---------------------------------------------------------

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

      // ---------------------------------------------------------
      // CURRENT USER ROLE
      // ---------------------------------------------------------

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const currentRole = String(profile?.role || "")
        .trim()
        .toUpperCase();

      setRole(currentRole);

      // ---------------------------------------------------------
      // ADMIN
      // ADMIN CAN SEE ALL EVENTS
      // ---------------------------------------------------------

      if (currentRole === "ADMIN") {
        const {
          data,
          error: eventsError,
        } = await supabase
          .from("events")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

        if (eventsError) {
          throw eventsError;
        }

        setEvents(data || []);
        return;
      }

      // ---------------------------------------------------------
      // ORGANIZER
      //
      // Organizer can SEE:
      // 1. Events they created
      // 2. Events assigned through event_organizers
      //
      // Organizer CANNOT:
      // - Create event
      // - Edit event
      // - Publish event
      // ---------------------------------------------------------

      if (currentRole === "ORGANIZER") {
        const eventMap = new Map();

        // -------------------------------------------------------
        // EVENTS CREATED BY ORGANIZER
        // -------------------------------------------------------

        const {
          data: createdEvents,
          error: createdEventsError,
        } = await supabase
          .from("events")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (createdEventsError) {
          throw createdEventsError;
        }

        (createdEvents || []).forEach((event) => {
          eventMap.set(event.id, {
            ...event,
            assignment_type: "CREATED",
          });
        });

        // -------------------------------------------------------
        // EVENTS ASSIGNED TO ORGANIZER
        // -------------------------------------------------------

        const {
          data: assignments,
          error: assignmentError,
        } = await supabase
          .from("event_organizers")
          .select("event_id, assigned_at")
          .eq("organizer_id", user.id);

        if (assignmentError) {
          throw assignmentError;
        }

        const assignedEventIds = [
          ...new Set(
            (assignments || [])
              .map((item) => item.event_id)
              .filter(Boolean)
          ),
        ];

        if (assignedEventIds.length > 0) {
          const {
            data: assignedEvents,
            error: assignedEventsError,
          } = await supabase
            .from("events")
            .select("*")
            .in("id", assignedEventIds);

          if (assignedEventsError) {
            throw assignedEventsError;
          }

          (assignedEvents || []).forEach((event) => {
            const existing = eventMap.get(event.id);

            eventMap.set(event.id, {
              ...event,
              assignment_type:
                existing?.assignment_type === "CREATED"
                  ? "CREATED"
                  : "ASSIGNED",
            });
          });
        }

        // -------------------------------------------------------
        // SORT
        // -------------------------------------------------------

        const organizerEvents = Array.from(
          eventMap.values()
        ).sort((a, b) => {
          const dateA = new Date(
            a.created_at || 0
          ).getTime();

          const dateB = new Date(
            b.created_at || 0
          ).getTime();

          return dateB - dateA;
        });

        setEvents(organizerEvents);
        return;
      }

      // ---------------------------------------------------------
      // OTHER ROLES
      // ---------------------------------------------------------

      setEvents([]);
    } catch (err) {
      console.error("Load events error:", err);

      setError(
        err?.message ||
          "Something went wrong while loading events."
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // ADMIN ONLY — PUBLISH
  // ============================================================

  async function handlePublish(eventId) {
    if (role !== "ADMIN") {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to publish this event?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const {
        error: updateError,
      } = await supabase
        .from("events")
        .update({
          status: "PUBLISHED",
        })
        .eq("id", eventId);

      if (updateError) {
        throw updateError;
      }

      await loadEvents();
    } catch (err) {
      console.error(
        "Publish event error:",
        err
      );

      setError(
        err?.message ||
          "Failed to publish the event."
      );
    }
  }

  return (
    <DashboardLayout title="My Events">
      <div className="space-y-8">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              EventNest
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              My Events
            </h1>

            <p className="mt-2 text-slate-400">
              {role === "ORGANIZER"
                ? "View events assigned to you."
                : "Create and manage your events from one place."}
            </p>
          </div>

          {/* ==================================================
              CREATE EVENT — ADMIN ONLY
          =================================================== */}

          {role === "ADMIN" && (
            <Link
              href="/dashboard/events/create-event"
              className="w-fit rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              + Create Event
            </Link>
          )}

        </div>

        {/* ======================================================
            ERROR
        ======================================================= */}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ======================================================
            LOADING
        ======================================================= */}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <p className="text-sm text-slate-400">
              Loading events...
            </p>
          </div>
        ) : events.length === 0 ? (

          /* ====================================================
             EMPTY
          ===================================================== */

          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl text-blue-400">
              +
            </div>

            <h2 className="mt-5 text-xl font-semibold text-white">
              {role === "ORGANIZER"
                ? "No events assigned"
                : "No events yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {role === "ORGANIZER"
                ? "You currently do not have any events assigned to you."
                : "You have not created any events yet."}
            </p>

            {/* ADMIN ONLY */}

            {role === "ADMIN" && (
              <Link
                href="/dashboard/events/create-event"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Create Your First Event →
              </Link>
            )}

          </div>

        ) : (

          /* ====================================================
             EVENTS
          ===================================================== */

          <div className="space-y-5">

            <div>
              <h2 className="text-xl font-semibold text-white">
                {role === "ORGANIZER"
                  ? "Assigned Events"
                  : "Your Events"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {events.length} event
                {events.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <div className="grid gap-5">

              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  role={role}
                  onPublish={handlePublish}
                />
              ))}

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

/* ==============================================================
   EVENT CARD
================================================================ */

function EventCard({
  event,
  role,
  onPublish,
}) {
  const status = String(
    event.status || "DRAFT"
  )
    .trim()
    .toUpperCase();

  const isAdmin = role === "ADMIN";
  const isOrganizer = role === "ORGANIZER";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-blue-500/20 hover:bg-white/[0.06]">

      <div className="flex flex-col gap-5">

        {/* ======================================================
            EVENT DETAILS
        ======================================================= */}

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3">

            <h3 className="text-lg font-semibold text-white">
              {event.name}
            </h3>

            <StatusBadge status={status} />

            {/* ORGANIZER ASSIGNED BADGE */}

            {isOrganizer &&
              event.assignment_type ===
                "ASSIGNED" && (
                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-400">
                  ASSIGNED
                </span>
              )}

          </div>

          {event.description && (
            <p className="mt-2 line-clamp-2 max-w-3xl text-sm text-slate-400">
              {event.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

            {event.start_date && (
              <span>
                📅 {event.start_date}
              </span>
            )}

            {event.end_date && (
              <span>
                → {event.end_date}
              </span>
            )}

            {event.venue && (
              <span>
                📍 {event.venue}
              </span>
            )}

          </div>

        </div>

        {/* ======================================================
            ACTIONS
        ======================================================= */}

        <div className="flex flex-wrap gap-2">

          {/* ====================================================
              ADMIN ONLY:
              EDIT
          ===================================================== */}

          {isAdmin && (
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
            >
              Edit
            </Link>
          )}

          {/* ====================================================
              ADMIN ONLY:
              PUBLISH
          ===================================================== */}

          {isAdmin && status === "DRAFT" && (
            <button
              type="button"
              onClick={() =>
                onPublish(event.id)
              }
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Publish Event
            </button>
          )}

          {/* ====================================================
              MANAGE EVENT
              BOTH ADMIN + ORGANIZER
          ===================================================== */}

          <Link
            href={`/dashboard/events/${event.id}`}
            className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
          >
            Manage Event →
          </Link>

        </div>

      </div>
    </div>
  );
}

/* ==============================================================
   STATUS BADGE
================================================================ */

function StatusBadge({ status }) {
  let className =
    "border-amber-500/20 bg-amber-500/10 text-amber-400";

  if (status === "PUBLISHED") {
    className =
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  if (status === "COMPLETED") {
    className =
      "border-slate-500/20 bg-slate-500/10 text-slate-400";
  }

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      {status}
    </span>
  );
}