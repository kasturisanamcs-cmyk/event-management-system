"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [organizers, setOrganizers] = useState([]);

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

    try {
      /* =========================================
         CHECK AUTHENTICATION
      ========================================= */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      /* =========================================
         LOAD EVENT
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
          created_by,
          created_at
          `
        )
        .eq("id", id)
        .single();

      if (eventError) {
        console.error("Event details error:", eventError);
        throw new Error("Could not load this event.");
      }

      /* =========================================
         LOAD COMPETITIONS
      ========================================= */

      const {
        data: competitionData,
        error: competitionError,
      } = await supabase
        .from("competitions")
        .select(
          `
          id,
          name,
          description,
          registration_fee,
          capacity,
          competition_date,
          start_time,
          end_time,
          venue,
          status,
          poster_url
          `
        )
        .eq("event_id", id)
        .order("competition_date", {
          ascending: true,
        });

      if (competitionError) {
        console.error(
          "Competition loading error:",
          competitionError
        );
      }

      /* =========================================
         LOAD EVENT ORGANIZERS
      ========================================= */

      const {
        data: organizerAssignments,
        error: organizerError,
      } = await supabase
        .from("event_organizers")
        .select(
          `
          id,
          organizer_id,
          assigned_at
          `
        )
        .eq("event_id", id);

      if (organizerError) {
        console.error(
          "Organizer loading error:",
          organizerError
        );
      }

      let organizerData = [];

      if (
        organizerAssignments &&
        organizerAssignments.length > 0
      ) {
        const organizerIds = organizerAssignments.map(
          (item) => item.organizer_id
        );

        const {
          data: profiles,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            `
            id,
            full_name,
            role
            `
          )
          .in("id", organizerIds);

        if (profileError) {
          console.error(
            "Organizer profile error:",
            profileError
          );
        } else {
          organizerData = profiles || [];
        }
      }

      setEvent(eventData);
      setCompetitions(competitionData || []);
      setOrganizers(organizerData);
    } catch (err) {
      console.error("Event page error:", err);

      setError(
        err.message || "Something went wrong while loading the event."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value) {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(value) {
    if (!value) return "—";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatTime(value) {
    if (!value) return "—";

    const [hours, minutes] = value.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusClass(status) {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500/10 text-green-400";

      case "DRAFT":
        return "bg-yellow-500/10 text-yellow-400";

      case "CANCELLED":
        return "bg-red-500/10 text-red-400";

      case "COMPLETED":
        return "bg-purple-500/10 text-purple-400";

      default:
        return "bg-blue-500/10 text-blue-400";
    }
  }

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     ERROR
  ========================================= */

  if (error || !event) {
    return (
      <div className="space-y-6">

        <Link
          href="/dashboard/events"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Events
        </Link>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          <h2 className="font-semibold text-red-300">
            Unable to load event
          </h2>

          <p className="mt-2 text-sm text-red-300/80">
            {error || "Event not found."}
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     MAIN PAGE
  ========================================= */

  return (
    <div className="space-y-8">

      {/* =====================================
          BACK
      ===================================== */}

      <Link
        href="/dashboard/events"
        className="inline-flex text-sm text-slate-400 transition hover:text-white"
      >
        ← Back to Events
      </Link>

      {/* =====================================
          EVENT HEADER
      ===================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        <div className="min-w-0">

          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Event Management
          </p>

          <h1 className="mt-2 break-words text-3xl font-bold text-white sm:text-4xl">
            {event.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                event.status
              )}`}
            >
              {event.status || "UNKNOWN"}
            </span>

            <span className="text-sm text-slate-500">
              Created {formatDateTime(event.created_at)}
            </span>

          </div>

        </div>

        {/* Edit Event */}
        <Link
          href={`/dashboard/events/${event.id}/edit`}
          className="w-fit shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
        >
          Edit Event
        </Link>

      </div>

      {/* =====================================
          EVENT IMAGE
      ===================================== */}

      {event.event_image && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <img
            src={event.event_image}
            alt={event.name}
            className="max-h-[420px] w-full object-cover"
          />
        </div>
      )}

      {/* =====================================
          EVENT INFORMATION
      ===================================== */}

      <div className="grid gap-5 lg:grid-cols-2">

        {/* Description */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">

          <h2 className="text-lg font-semibold text-white">
            Description
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            {event.description || "No description provided."}
          </p>

        </div>

        {/* Event Details */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">

          <h2 className="text-lg font-semibold text-white">
            Event Details
          </h2>

          <div className="mt-5 space-y-4">

            <Detail
              label="Start Date"
              value={formatDate(event.start_date)}
            />

            <Detail
              label="End Date"
              value={formatDate(event.end_date)}
            />

            <Detail
              label="Registration Deadline"
              value={formatDate(
                event.registration_deadline
              )}
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

      {/* =====================================
          EVENT STATISTICS
      ===================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">

        <StatCard
          label="Competitions"
          value={competitions.length}
        />

        <StatCard
          label="Organizers"
          value={organizers.length}
        />

        <StatCard
          label="Event Status"
          value={event.status || "—"}
        />

      </div>

      {/* =====================================
          ORGANIZERS
      ===================================== */}

      <section>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h2 className="text-xl font-semibold text-white">
              Event Organizers
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Organizers assigned to this event.
            </p>
          </div>

          <Link
            href={`/dashboard/events/${event.id}/organizers`}
            className="w-fit text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Manage Organizers →
          </Link>

        </div>

        <div className="mt-5">

          {organizers.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm text-slate-500">
                No organizers have been assigned to this event yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {organizers.map((organizer) => (
                <div
                  key={organizer.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-400">
                      {(organizer.full_name || "O")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-medium text-white">
                        {organizer.full_name || "Unnamed Organizer"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {organizer.role || "ORGANIZER"}
                      </p>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </section>

      {/* =====================================
          COMPETITIONS
      ===================================== */}

      <section>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h2 className="text-xl font-semibold text-white">
              Competitions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Competitions created under this event.
            </p>
          </div>

          <Link
            href={`/dashboard/events/${event.id}/competitions`}
            className="w-fit text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Manage Competitions →
          </Link>

        </div>

        <div className="mt-5">

          {competitions.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

              <p className="text-sm text-slate-500">
                No competitions have been created for this event yet.
              </p>

              <Link
                href={`/dashboard/events/${event.id}/competitions`}
                className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Create Competition
              </Link>

            </div>
          ) : (
            <div className="space-y-4">

              {competitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  getStatusClass={getStatusClass}
                />
              ))}

            </div>
          )}

        </div>

      </section>

      {/* =====================================
          MANAGEMENT
      ===================================== */}

      <section>

        <h2 className="text-xl font-semibold text-white">
          Manage Event
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Manage the main areas of this event.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <ManagementCard
            title="Competitions"
            description="Create and manage competitions for this event."
            href={`/dashboard/events/${event.id}/competitions`}
          />

          <ManagementCard
            title="Organizers"
            description="Assign and manage organizers for this event."
            href={`/dashboard/events/${event.id}/organizers`}
          />

          <ManagementCard
            title="Participants"
            description="View registrations and participants for this event."
            href={`/dashboard/events/${event.id}/participants`}
          />

        </div>

      </section>

    </div>
  );
}


/* =====================================================
   DETAIL
===================================================== */

function Detail({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/5 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="break-words text-sm font-medium text-slate-200 sm:text-right">
        {value || "—"}
      </span>

    </div>
  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-2xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}


/* =====================================================
   COMPETITION CARD
===================================================== */

function CompetitionCard({
  competition,
  formatDate,
  formatTime,
  getStatusClass,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#08152b] p-5">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3">

            <h3 className="break-words text-lg font-semibold text-white">
              {competition.name}
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusClass(
                competition.status
              )}`}
            >
              {competition.status || "UNKNOWN"}
            </span>

          </div>

          {competition.description && (
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {competition.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

            <span>
              📅 {formatDate(competition.competition_date)}
            </span>

            <span>
              ◷ {formatTime(competition.start_time)}
            </span>

            <span>
              📍 {competition.venue || "Venue not specified"}
            </span>

            <span>
              👥{" "}
              {competition.capacity ?? "Unlimited"} capacity
            </span>

          </div>

        </div>

        <Link
          href={`/dashboard/events/${competition.event_id || ""}/competitions/${competition.id}`}
          className="w-fit shrink-0 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
        >
          View Competition
        </Link>

      </div>

    </div>
  );
}


/* =====================================================
   MANAGEMENT CARD
===================================================== */

function ManagementCard({
  title,
  description,
  href,
}) {
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