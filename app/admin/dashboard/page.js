"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState(null);

  const [events, setEvents] = useState([]);
  const [organizerCount, setOrganizerCount] = useState(0);
  const [competitionCount, setCompetitionCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      /* =========================================
         AUTHENTICATION
      ========================================= */

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      /* =========================================
         LOAD EVENTS
      ========================================= */

      const {
        data: eventData,
        error: eventError,
      } = await supabase
        .from("events")
        .select(
          `
          id,
          name,
          description,
          start_date,
          end_date,
          registration_deadline,
          venue,
          event_image,
          status,
          created_at
          `
        )
        .order("created_at", {
          ascending: false,
        });

      if (eventError) {
        throw eventError;
      }

      setEvents(eventData || []);

      /* =========================================
         LOAD ORGANIZERS
      ========================================= */

      const {
        count: organizers,
        error: organizerError,
      } = await supabase
        .from("profiles")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("role", "ORGANIZER");

      if (organizerError) {
        console.error(
          "Organizer count error:",
          organizerError
        );
      } else {
        setOrganizerCount(organizers || 0);
      }

      /* =========================================
         LOAD COMPETITIONS
      ========================================= */

      const {
        count: competitions,
        error: competitionError,
      } = await supabase
        .from("competitions")
        .select("id", {
          count: "exact",
          head: true,
        });

      if (competitionError) {
        console.error(
          "Competition count error:",
          competitionError
        );
      } else {
        setCompetitionCount(competitions || 0);
      }
    } catch (err) {
      console.error(
        "Admin dashboard error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load the admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value) {
    if (!value) {
      return "Date not specified";
    }

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

          <p className="mt-5 text-sm text-slate-400">
            Loading admin dashboard...
          </p>

        </div>
      </div>
    );
  }

  return (
    <>
      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            EventNest
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            Create events and manage organizers and competitions
            from one central dashboard.
          </p>

        </div>

        <Link
          href="/dashboard/events/create-event"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
        >
          <span className="text-lg">
            +
          </span>

          Create Event
        </Link>

      </div>

      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300 sm:flex-row sm:items-center sm:justify-between">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={loadDashboard}
            className="w-fit font-semibold text-white underline"
          >
            Try Again
          </button>

        </div>
      )}

      {/* =====================================
          STATISTICS
      ===================================== */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

        <AdminStat
          icon="▣"
          title="Events"
          value={events.length}
          description="Events stored in EventNest"
        />

        <AdminStat
          icon="♙"
          title="Organizers"
          value={organizerCount}
          description="Organizers registered in EventNest"
        />

        <AdminStat
          icon="◎"
          title="Competitions"
          value={competitionCount}
          description="Competitions across all events"
        />

      </div>

      {/* =====================================
          EVENT MANAGEMENT
      ===================================== */}

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h2 className="text-xl font-semibold text-white">
              Event Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create an event first, then manage everything related
              to it.
            </p>

          </div>

          <Link
            href="/dashboard/events"
            className="w-fit text-sm font-semibold text-blue-400 transition hover:text-blue-300"
          >
            View all events →
          </Link>

        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <ManagementCard
            number="01"
            icon="+"
            title="Create Event"
            description="Create a new EventNest event with its basic information."
            href="/dashboard/events/create-event"
            button="Create Event"
          />

          <ManagementCard
            number="02"
            icon="▣"
            title="Manage Events"
            description="Open an event to manage competitions, organizers and participants."
            href="/dashboard/events"
            button="View Events"
          />

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.05] p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                ✓
              </div>

              <span className="text-xs font-semibold text-blue-400">
                EVENT LEVEL
              </span>

            </div>

            <h3 className="mt-5 text-base font-semibold text-white">
              Manage Event
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Inside each event you can invite organizers,
              manage competitions, and view participants.
            </p>

          </div>

        </div>

      </div>

      {/* =====================================
          EVENTS
      ===================================== */}

      <div className="mt-8">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h2 className="text-xl font-semibold text-white">
              Recent Events
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Events currently stored in EventNest.
            </p>

          </div>

          <Link
            href="/dashboard/events"
            className="w-fit text-sm font-semibold text-blue-400 hover:text-blue-300"
          >
            View all →
          </Link>

        </div>

        <div className="mt-5">

          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">

              <div className="text-4xl">
                📅
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white">
                No events yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Create your first event to start managing
                competitions and organizers.
              </p>

              <Link
                href="/dashboard/events/create-event"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Create Event
              </Link>

            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">

              {events.slice(0, 4).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  formatDate={formatDate}
                />
              ))}

            </div>
          )}

        </div>

      </div>

      {/* =====================================
          EVENT MANAGEMENT STRUCTURE
      ===================================== */}

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">

        <h2 className="text-xl font-semibold text-white">
          Event Management Structure
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Event-level management keeps organizers,
          competitions, and participants connected to the correct event.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <StructureCard
            icon="♙"
            title="Organizers"
            description="Invite and manage organizers for a specific event."
          />

          <StructureCard
            icon="◎"
            title="Competitions"
            description="Create and manage competitions belonging to the event."
          />

          <StructureCard
            icon="◆"
            title="Participants"
            description="View registrations and participants connected to event competitions."
          />

        </div>

      </div>

      {/* =====================================
          RECENT ACTIVITY
      ===================================== */}

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">

        <h2 className="text-xl font-semibold text-white">
          Dashboard Overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current system information from EventNest.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <OverviewItem
            title="Total Events"
            value={events.length}
          />

          <OverviewItem
            title="Total Organizers"
            value={organizerCount}
          />

          <OverviewItem
            title="Total Competitions"
            value={competitionCount}
          />

        </div>

      </div>
    </>
  );
}


/* =====================================================
   ADMIN STAT
===================================================== */

function AdminStat({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-400">
          {icon}
        </div>

        <span className="text-3xl font-bold text-white">
          {value}
        </span>

      </div>

      <p className="mt-4 text-sm font-medium text-white">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* =====================================================
   MANAGEMENT CARD
===================================================== */

function ManagementCard({
  number,
  icon,
  title,
  description,
  href,
  button,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#08152b] p-5 transition hover:border-blue-500/30">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          {icon}
        </div>

        <span className="text-xs font-bold text-slate-600">
          {number}
        </span>

      </div>

      <h3 className="mt-5 text-base font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
        {description}
      </p>

      <Link
        href={href}
        className="mt-5 inline-flex text-sm font-semibold text-blue-400 transition hover:text-blue-300"
      >
        {button} →
      </Link>

    </div>
  );
}


/* =====================================================
   EVENT CARD
===================================================== */

function EventCard({
  event,
  formatDate,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-blue-500/30 sm:p-6">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">
            {event.status || "UNKNOWN"}
          </span>

          <h3 className="mt-4 break-words text-xl font-semibold text-white">
            {event.name}
          </h3>

        </div>

        <span className="shrink-0 text-2xl">
          ▣
        </span>

      </div>

      <div className="mt-5 space-y-2 text-sm text-slate-400">

        <p>
          <span className="text-slate-500">
            Date:
          </span>{" "}
          {formatDate(event.start_date)}
        </p>

        <p>
          <span className="text-slate-500">
            Location:
          </span>{" "}
          {event.venue || "Not specified"}
        </p>

        {event.registration_deadline && (
          <p>
            <span className="text-slate-500">
              Registration:
            </span>{" "}
            {formatDate(event.registration_deadline)}
          </p>
        )}

      </div>

      <Link
        href={`/dashboard/events/${event.id}`}
        className="mt-6 flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-blue-500/30 hover:bg-blue-500/[0.05]"
      >
        Manage Event →
      </Link>

    </div>
  );
}


/* =====================================================
   STRUCTURE CARD
===================================================== */

function StructureCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#08152b] p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        {icon}
      </div>

      <h3 className="mt-4 text-base font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* =====================================================
   OVERVIEW ITEM
===================================================== */

function OverviewItem({
  title,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#08152b] p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}