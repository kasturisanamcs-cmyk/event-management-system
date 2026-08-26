"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  async function loadEvent() {
    const supabase = createClient();

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error: eventError } = await supabase
      .from("events")
      .select(
        "id, name, description, start_date, end_date, registration_deadline, venue, event_image, status, created_at"
      )
      .eq("id", id)
      .eq("created_by", user.id)
      .single();

    if (eventError) {
      console.error("Event details error:", eventError);
      setError("Could not load this event.");
      setLoading(false);
      return;
    }

    setEvent(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center text-slate-400">
        Loading event...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div>
        <div className="mb-6">
          <Link
            href="/dashboard/events"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to Events
          </Link>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          {error || "Event not found."}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back */}
      <div className="mb-6">
        <Link
          href="/dashboard/events"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Events
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Event Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            {event.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                event.status === "PUBLISHED"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {event.status}
            </span>

            <span className="text-sm text-slate-500">
              Created {new Date(event.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Event image */}
      {event.event_image && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <img
            src={event.event_image}
            alt={event.name}
            className="max-h-[420px] w-full object-cover"
          />
        </div>
      )}

      {/* Event information */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Description */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold text-white">
            Description
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            {event.description}
          </p>
        </div>

        {/* Event details */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold text-white">
            Event Details
          </h2>

          <div className="mt-5 space-y-4 text-sm">
            <Detail
              label="Start Date"
              value={event.start_date}
            />

            <Detail
              label="End Date"
              value={event.end_date}
            />

            <Detail
              label="Registration Deadline"
              value={event.registration_deadline}
            />

            <Detail
              label="Venue"
              value={event.venue}
            />

            <Detail
              label="Status"
              value={event.status}
            />
          </div>
        </div>
      </div>

      {/* Management sections */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white">
          Manage Event
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Manage competitions, organizers, volunteers and participants
          for this event.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ManagementCard
            title="Competitions"
            description="Create and manage competitions."
            href={`/dashboard/events/${event.id}/competitions`}
          />

          <ManagementCard
            title="Organizers"
            description="Assign organizers to this event."
            href={`/dashboard/events/${event.id}/organizers`}
          />

          <ManagementCard
            title="Volunteers"
            description="Manage event tasks and volunteers."
            href={`/dashboard/events/${event.id}/volunteers`}
          />

          <ManagementCard
            title="Participants"
            description="View event registrations."
            href={`/dashboard/events/${event.id}/participants`}
          />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between gap-5 border-b border-white/5 pb-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-200">
        {value || "—"}
      </span>
    </div>
  );
}

function ManagementCard({ title, description, href }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-white/[0.06]"
    >
      <h3 className="font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <p className="mt-4 text-sm font-medium text-blue-400">
        Manage →
      </p>
    </Link>
  );
}