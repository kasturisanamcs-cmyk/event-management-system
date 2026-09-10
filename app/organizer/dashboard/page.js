"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/client";

export default function OrganizerDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
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
        router.push("/login");
        return;
      }

      const { data, error: eventsError } = await supabase
        .from("event_organizers")
        .select(`
          id,
          assigned_at,
          events (
            id,
            name,
            description,
            start_date,
            end_date,
            registration_deadline,
            venue,
            event_image,
            status
          )
        `)
        .eq("organizer_id", user.id)
        .order("assigned_at", { ascending: false });

      if (eventsError) {
        throw eventsError;
      }

      const assignedEvents = (data || [])
        .filter((item) => item.events)
        .map((item) => ({
          ...item.events,
          assigned_at: item.assigned_at,
        }));

      setEvents(assignedEvents);
    } catch (err) {
      console.error("Organizer dashboard error:", err);
      setError(
        err?.message || "Unable to load your organizer dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="Organizer Dashboard">
      {/* Page Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
          EventNest
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Organizer Dashboard
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Manage your assigned events, competitions, participants, and
          volunteers from one place.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Organizer Overview */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="My Events"
          value={loading ? "..." : events.length}
          description="Events assigned to you"
          icon="📅"
        />

        <DashboardCard
          title="Competitions"
          value="—"
          description="Competitions under your events"
          icon="🏆"
        />

        <DashboardCard
          title="Participants"
          value="—"
          description="Participants registered for competitions"
          icon="👥"
        />

        <DashboardCard
          title="Volunteers"
          value="—"
          description="Volunteers helping with your events"
          icon="🤝"
        />
      </div>

      {/* Main Content */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* My Events */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                My Events
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Events assigned to you by the administrator
              </p>
            </div>

            <Link
              href="/organizer/events"
              className="w-fit rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center">
              <div className="text-3xl">⏳</div>

              <h3 className="mt-3 font-semibold text-white">
                Loading events...
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Fetching your assigned events.
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center">
              <div className="text-3xl">📅</div>

              <h3 className="mt-3 font-semibold text-white">
                No events assigned
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Once an administrator assigns an event to you, it will
                appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {events.slice(0, 3).map((event) => (
                <EventPreview
                  key={event.id}
                  event={event}
                />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Common organizer tasks
          </p>

          <div className="mt-6 space-y-3">
            <QuickAction
              icon="🏆"
              title="Create Competition"
              href="/organizer/competitions/create"
            />

            <QuickAction
              icon="📋"
              title="Manage Competitions"
              href="/organizer/competitions"
            />

            <QuickAction
              icon="👤"
              title="Invite Competition Member"
              href="/organizer/competitions"
            />

            <QuickAction
              icon="👥"
              title="Manage Participants"
              href="/organizer/competitions"
            />

            <QuickAction
              icon="🤝"
              title="Manage Volunteers"
              href="/organizer/competitions"
            />
          </div>
        </section>
      </div>

      {/* Competitions */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              My Competitions
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Competitions created under your assigned events
            </p>
          </div>

          <Link
            href="/organizer/competitions"
            className="w-fit rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
          >
            Manage
          </Link>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center">
          <div className="text-3xl">🏆</div>

          <h3 className="mt-3 font-semibold text-white">
            Competition management
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your competitions will appear here once the competition
            module is connected to your assigned events.
          </p>
        </div>
      </section>

      {/* Organizer Workflow */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <h2 className="text-xl font-bold text-white">
          Organizer Workflow
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Follow this process to manage your assigned events
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <WorkflowStep
            number="01"
            title="Receive Event"
            description="The administrator assigns an event to you."
          />

          <WorkflowStep
            number="02"
            title="Create Competitions"
            description="Create competitions inside your assigned event."
          />

          <WorkflowStep
            number="03"
            title="Invite Members"
            description="Invite competition members to help manage competitions."
          />

          <WorkflowStep
            number="04"
            title="Manage Event"
            description="Manage participants, volunteers, schedules, and event activities."
          />
        </div>
      </section>
    </DashboardLayout>
  );
}

function DashboardCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
          {icon}
        </div>

        <p className="text-2xl font-bold text-white">
          {value}
        </p>
      </div>

      <p className="mt-4 text-sm font-semibold text-white">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function EventPreview({ event }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#0b1224] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-white">
            {event.name}
          </h3>

          <StatusBadge status={event.status} />
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-slate-400">
          {event.description || "No description available."}
        </p>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
          <span>📅 {formatDate(event.start_date)}</span>

          <span>→ {formatDate(event.end_date)}</span>

          <span>📍 {event.venue || "Venue not specified"}</span>
        </div>
      </div>

      <Link
        href={`/organizer/events/${event.id}`}
        className="w-full shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-500 sm:w-auto"
      >
        Manage Event
      </Link>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  href,
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-blue-500/30 hover:bg-blue-500/5"
    >
      <span className="text-xl">{icon}</span>

      <span className="text-sm font-medium text-slate-200">
        {title}
      </span>
    </Link>
  );
}

function WorkflowStep({
  number,
  title,
  description,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1b35] p-5">
      <p className="text-xs font-bold tracking-widest text-blue-400">
        {number}
      </p>

      <h3 className="mt-3 font-semibold text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    DRAFT: "bg-yellow-500/10 text-yellow-400",
    PUBLISHED: "bg-green-500/10 text-green-400",
    ONGOING: "bg-blue-500/10 text-blue-400",
    COMPLETED: "bg-slate-500/10 text-slate-400",
    CANCELLED: "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
        styles[status] || "bg-white/10 text-slate-400"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "Date not specified";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}