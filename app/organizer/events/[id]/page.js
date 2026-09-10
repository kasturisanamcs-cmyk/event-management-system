"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/client";

export default function OrganizerEventDetailsPage() {
  const { id: eventId } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  async function loadEvent() {
    const supabase = createClient();

    setLoading(true);
    setError("");

    try {
      // Get logged-in organizer
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

      // Load event assigned to this organizer
      const { data, error: eventError } = await supabase
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
            status,
            created_at
          )
        `)
        .eq("event_id", eventId)
        .eq("organizer_id", user.id)
        .single();

      if (eventError) {
        console.error("Organizer event error:", eventError);
        setError("You do not have access to this event.");
        return;
      }

      if (!data?.events) {
        setError("Event not found.");
        return;
      }

      setEvent({
        ...data.events,
        assigned_at: data.assigned_at,
      });
    } catch (err) {
      console.error("Error loading organizer event:", err);
      setError("Could not load this event.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Event">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
          <p className="text-slate-400">Loading event...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    return (
      <DashboardLayout title="Event">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <h2 className="text-xl font-semibold text-red-300">
            {error || "Event not found"}
          </h2>

          <Link
            href="/organizer/events"
            className="mt-5 inline-flex rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            ← Back to My Events
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Event">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Back */}
        <Link
          href="/organizer/events"
          className="inline-flex text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to My Events
        </Link>

        {/* Event Header */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          {event.event_image && (
            <div className="h-56 w-full overflow-hidden bg-slate-900 sm:h-72">
              <img
                src={event.event_image}
                alt={event.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                  EventNest
                </p>

                <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                  {event.name}
                </h1>

                <p className="mt-3 max-w-3xl text-slate-400">
                  {event.description || "No description provided."}
                </p>
              </div>

              <StatusBadge status={event.status} />
            </div>
          </div>
        </section>

        {/* Event Details */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white">
              Event Details
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Information about your assigned event.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard
              icon="📅"
              label="Start Date"
              value={formatDate(event.start_date)}
            />

            <DetailCard
              icon="📅"
              label="End Date"
              value={formatDate(event.end_date)}
            />

            <DetailCard
              icon="⏰"
              label="Registration Deadline"
              value={formatDateTime(event.registration_deadline)}
            />

            <DetailCard
              icon="📍"
              label="Venue"
              value={event.venue || "Not specified"}
            />
          </div>
        </section>

        {/* Management */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white">
              Event Management
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Manage the different parts of your assigned event.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* Competitions */}
            <ManagementCard
              icon="🏆"
              title="Competitions"
              description="Create and manage competitions under this event."
              href={`/organizer/events/${event.id}/competitions`}
              active
            />

            {/* Participants */}
            <ManagementCard
              icon="👥"
              title="Participants"
              description="View and manage participants registered for this event."
            />

            {/* Volunteers */}
            <ManagementCard
              icon="🤝"
              title="Volunteers"
              description="Manage volunteers and their event responsibilities."
            />

            {/* Schedule */}
            <ManagementCard
              icon="🗓️"
              title="Schedule"
              description="View and manage the schedule for your event."
            />

            {/* Announcements */}
            <ManagementCard
              icon="📢"
              title="Announcements"
              description="Manage announcements and event updates."
            />

            {/* Event Information */}
            <ManagementCard
              icon="ℹ️"
              title="Event Information"
              description="Review the information and configuration of this event."
            />
          </div>
        </section>

        {/* Organizer Notice */}
        <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
          <div className="flex gap-4">
            <div className="text-2xl">💡</div>

            <div>
              <h3 className="font-semibold text-white">
                Organizer Access
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                This event was assigned to you by the administrator.
                You can manage the competitions and other operational
                activities of this event. Organizer assignment itself
                is handled by the administrator.
              </p>
            </div>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}

/* -----------------------------
   Status Badge
----------------------------- */

function StatusBadge({ status }) {
  const styles = {
    DRAFT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    PUBLISHED: "bg-green-500/10 text-green-400 border-green-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    COMPLETED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-4 py-2 text-xs font-semibold ${
        styles[status] ||
        "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      {status}
    </span>
  );
}

/* -----------------------------
   Detail Card
----------------------------- */

function DetailCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>

        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>

      <p className="mt-3 break-words text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

/* -----------------------------
   Management Card
----------------------------- */

function ManagementCard({
  icon,
  title,
  description,
  href,
  active = false,
}) {
  const content = (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      {active && (
        <div className="mt-5 text-sm font-semibold text-blue-400">
          Open Management →
        </div>
      )}

      {!active && (
        <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-600">
          Coming soon
        </div>
      )}
    </>
  );

  if (active && href) {
    return (
      <Link
        href={href}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.06]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      {content}
    </div>
  );
}

/* -----------------------------
   Date Helpers
----------------------------- */

function formatDate(date) {
  if (!date) return "Not specified";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "Not specified";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}