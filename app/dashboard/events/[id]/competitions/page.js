"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CompetitionsPage() {
  const { id: eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [competitions, setCompetitions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId]);

  async function loadData() {
    const supabase = createClient();

    setLoading(true);
    setError("");

    try {
      /* =========================================
         AUTHENTICATION
      ========================================= */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("You must be logged in.");
        setLoading(false);
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
        .select("id, name, status")
        .eq("id", eventId)
        .single();

      if (eventError) {
        console.error("Event error:", eventError);
        throw new Error("Could not load this event.");
      }

      setEvent(eventData);

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
          event_id,
          name,
          description,
          rules,
          registration_fee,
          capacity,
          competition_date,
          start_time,
          end_time,
          check_in_start,
          check_in_end,
          late_entry_allowed,
          venue,
          status,
          poster_url,
          created_at
          `
        )
        .eq("event_id", eventId)
        .order("competition_date", {
          ascending: true,
        })
        .order("start_time", {
          ascending: true,
        });

      if (competitionError) {
        console.error(
          "Competition error:",
          competitionError
        );

        throw new Error(
          "Could not load competitions."
        );
      }

      setCompetitions(competitionData || []);
    } catch (err) {
      console.error("Competitions page error:", err);

      setError(
        err.message ||
          "Something went wrong while loading competitions."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value) {
    if (!value) return "Not specified";

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatTime(value) {
    if (!value) return "Not specified";

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

  function formatFee(value) {
    const fee = Number(value || 0);

    if (fee === 0) {
      return "Free";
    }

    return `₹${fee.toLocaleString("en-IN")}`;
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
            Loading competitions...
          </p>

        </div>
      </div>
    );
  }

  /* =========================================
     PAGE
  ========================================= */

  return (
    <div className="space-y-8">

      {/* Back */}
      <Link
        href={`/dashboard/events/${eventId}`}
        className="inline-flex text-sm text-slate-400 transition hover:text-white"
      >
        ← Back to Event
      </Link>

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

        <div className="min-w-0">

          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            {event?.name || "Event"}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Competitions
          </h1>

          <p className="mt-3 text-slate-400">
            Create and manage competitions for this event.
          </p>

        </div>

        <Link
          href={`/dashboard/events/${eventId}/competitions/create`}
          className="inline-flex w-fit items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          + Create Competition
        </Link>

      </div>

      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* =====================================
          SUMMARY
      ===================================== */}

      {!error && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">

          <SummaryCard
            label="Total Competitions"
            value={competitions.length}
          />

          <SummaryCard
            label="Published"
            value={
              competitions.filter(
                (item) => item.status === "PUBLISHED"
              ).length
            }
          />

          <SummaryCard
            label="Draft"
            value={
              competitions.filter(
                (item) => item.status === "DRAFT"
              ).length
            }
          />

        </div>
      )}

      {/* =====================================
          EMPTY STATE
      ===================================== */}

      {!error && competitions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center sm:p-12">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
            🏆
          </div>

          <h2 className="mt-5 text-xl font-semibold text-white">
            No competitions yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Create the first competition for this event.
          </p>

          <Link
            href={`/dashboard/events/${eventId}/competitions/create`}
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Create Competition
          </Link>

        </div>
      )}

      {/* =====================================
          COMPETITIONS
      ===================================== */}

      {!error && competitions.length > 0 && (
        <div className="space-y-4">

          {competitions.map((competition) => (
            <CompetitionCard
              key={competition.id}
              competition={competition}
              formatDate={formatDate}
              formatTime={formatTime}
              formatFee={formatFee}
              getStatusClass={getStatusClass}
              eventId={eventId}
            />
          ))}

        </div>
      )}

    </div>
  );
}


/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
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
  formatFee,
  getStatusClass,
  eventId,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

        {/* Main information */}
        <div className="min-w-0 flex-1">

          {/* Title */}
          <div className="flex flex-wrap items-center gap-3">

            <h2 className="break-words text-xl font-semibold text-white">
              {competition.name}
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusClass(
                competition.status
              )}`}
            >
              {competition.status || "UNKNOWN"}
            </span>

          </div>

          {/* Description */}
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {competition.description ||
              "No description provided."}
          </p>

          {/* Details */}
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">

            <InfoItem
              label="Date"
              value={formatDate(
                competition.competition_date
              )}
              icon="📅"
            />

            <InfoItem
              label="Time"
              value={`${formatTime(
                competition.start_time
              )} - ${formatTime(
                competition.end_time
              )}`}
              icon="⏰"
            />

            <InfoItem
              label="Venue"
              value={
                competition.venue ||
                "Not specified"
              }
              icon="📍"
            />

            <InfoItem
              label="Registration Fee"
              value={formatFee(
                competition.registration_fee
              )}
              icon="💰"
            />

            <InfoItem
              label="Capacity"
              value={
                competition.capacity ??
                "Unlimited"
              }
              icon="👥"
            />

            <InfoItem
              label="Late Entry"
              value={
                competition.late_entry_allowed
                  ? "Allowed"
                  : "Not allowed"
              }
              icon="🕐"
            />

          </div>

          {/* Check-in */}
          {(competition.check_in_start ||
            competition.check_in_end) && (
            <div className="mt-4 rounded-xl border border-white/5 bg-black/10 p-4">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Check-in Window
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {formatTime(
                  competition.check_in_start
                )}{" "}
                -{" "}
                {formatTime(
                  competition.check_in_end
                )}
              </p>

            </div>
          )}

        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-3 lg:flex-col">

          <Link
            href={`/dashboard/events/${eventId}/competitions/${competition.id}`}
            className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
          >
            View
          </Link>

          <Link
            href={`/dashboard/events/${eventId}/competitions/${competition.id}/edit`}
            className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-500/40 hover:bg-white/[0.05] hover:text-white"
          >
            Edit
          </Link>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   INFO ITEM
===================================================== */

function InfoItem({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/10 p-3">

      <p className="text-xs text-slate-500">
        {icon} {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-300">
        {value}
      </p>

    </div>
  );
}