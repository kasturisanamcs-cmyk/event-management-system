"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (
        sessionError ||
        !session?.access_token
      ) {
        throw new Error(
          "Please log in again."
        );
      }

      const response = await fetch(
        "/api/participant/registration",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to load your registrations."
        );
      }

      const formatted =
        (result.registrations || []).map(
          (registration) => ({
            id: registration.result_id,

            registrationNumber:
              registration.result_registration_number,

            status:
              registration.result_status,

            participantName:
              registration.result_participant_name,

            competitionId:
              registration.result_competition_id,

            competitionName:
              registration.result_competition_name,

            competitionDate:
              registration.result_competition_date,

            startTime:
              registration.result_start_time,

            endTime:
              registration.result_end_time,

            venue:
              registration.result_venue,

            registeredAt:
              registration.result_registered_at,
          })
        );

      setRegistrations(formatted);
    } catch (error) {
      console.error(
        "Participant dashboard error:",
        error
      );

      setError(
        error.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ----------------------------------------------------------
     UPCOMING REGISTRATIONS
  ---------------------------------------------------------- */

  const upcomingRegistrations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return registrations.filter(
      (registration) => {
        if (!registration.competitionDate) {
          return false;
        }

        const competitionDate =
          new Date(
            registration.competitionDate
          );

        competitionDate.setHours(
          0,
          0,
          0,
          0
        );

        return competitionDate >= today;
      }
    );
  }, [registrations]);

  /* ----------------------------------------------------------
     STATS
  ---------------------------------------------------------- */

  const totalRegistrations =
    registrations.length;

  const confirmedRegistrations =
    registrations.filter(
      (registration) =>
        registration.status === "CONFIRMED"
    ).length;

  const upcomingCount =
    upcomingRegistrations.length;

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */

  return (
    <DashboardLayout title="Participant Dashboard">

      <div className="space-y-6 sm:space-y-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 sm:text-sm">
            EventNest
          </p>

          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Participant Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Manage your registrations, competitions,
            tickets and upcoming participation from
            one place.
          </p>
        </section>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}


        {/* ==================================================
            STATISTICS
        ================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

          <StatCard
            icon="✓"
            title="My Registrations"
            value={
              loading
                ? "..."
                : totalRegistrations
            }
            description="Confirmed registrations"
          />

          <StatCard
            icon="✓"
            title="Confirmed"
            value={
              loading
                ? "..."
                : confirmedRegistrations
            }
            description="Registrations ready for participation"
          />

          <StatCard
            icon="◷"
            title="Upcoming"
            value={
              loading
                ? "..."
                : upcomingCount
            }
            description="Upcoming competitions"
          />

        </section>


        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* =================================================
              MY COMPETITIONS
          ================================================= */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6 xl:col-span-2">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-semibold text-white">
                  My Competitions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your confirmed EventNest registrations.
                </p>
              </div>

              <Link
                href="/participant/registrations"
                className="w-fit text-sm font-medium text-blue-400 transition hover:text-blue-300"
              >
                View all →
              </Link>

            </div>


            <div className="mt-5 space-y-3 sm:mt-6">

              {loading ? (
                <>
                  <LoadingCard />
                  <LoadingCard />
                </>
              ) : registrations.length === 0 ? (
                <EmptyState />
              ) : (
                registrations
                  .slice(0, 5)
                  .map((registration) => (
                    <CompetitionCard
                      key={registration.id}
                      registration={
                        registration
                      }
                    />
                  ))
              )}

            </div>

          </section>


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">

            <h2 className="text-xl font-semibold text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quickly access your EventNest activities.
            </p>


            <div className="mt-5 space-y-3">

              <QuickAction
                href="/participant/events"
                icon="◇"
                title="Browse Events"
                description="Find competitions and events"
              />

              <QuickAction
                href="/participant/registrations"
                icon="✓"
                title="My Registrations"
                description="View your registrations"
              />

              <QuickAction
                href="/participant/tickets"
                icon="▤"
                title="My Tickets & QR"
                description="View your tickets and QR codes"
              />

              <QuickAction
                href="/participant/schedule"
                icon="◷"
                title="Schedule"
                description="Check your event schedule"
              />

            </div>

          </section>

        </div>


        {/* ==================================================
            UPCOMING PARTICIPATION
        ================================================== */}

        <section>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">
              Upcoming Participation
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Competitions you are registered for.
            </p>
          </div>


          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <LoadingCard />
              <LoadingCard />
            </div>
          ) : upcomingRegistrations.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
              <p className="font-medium text-white">
                No upcoming competitions
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Browse available events to find your next competition.
              </p>

              <Link
                href="/participant/events"
                className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {upcomingRegistrations
                .slice(0, 4)
                .map((registration) => (
                  <UpcomingCard
                    key={registration.id}
                    registration={
                      registration
                    }
                  />
                ))}

            </div>
          )}

        </section>


        {/* ==================================================
            TICKET CTA
        ================================================== */}

        {registrations.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-white/[0.03] to-cyan-500/10 p-5 sm:p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  EventNest Ticket
                </p>

                <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                  Ready for your competition?
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  Open your confirmed ticket and present
                  the QR code at the competition check-in
                  counter.
                </p>
              </div>

              <Link
                href="/participant/tickets"
                className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 sm:w-auto"
              >
                View My Ticket
              </Link>

            </div>

          </section>
        )}

      </div>

    </DashboardLayout>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-blue-500/20 hover:bg-white/[0.06] sm:p-6">

      <div className="flex items-start justify-between gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-lg text-blue-400">
          {icon}
        </div>

        <span className="text-3xl font-bold text-white">
          {value}
        </span>

      </div>

      <p className="mt-4 text-sm font-medium text-white">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   COMPETITION CARD
============================================================ */

function CompetitionCard({
  registration,
}) {
  const status =
    registration.status || "CONFIRMED";

  return (
    <div className="rounded-xl border border-white/10 bg-[#08152b] p-4 sm:p-5">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="truncate font-semibold text-white">
              {registration.competitionName ||
                "Competition"}
            </h3>

            <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-green-400">
              {status}
            </span>

          </div>

          <p className="mt-2 text-xs text-slate-500">
            Registration:{" "}
            <span className="text-slate-400">
              {registration.registrationNumber ||
                "—"}
            </span>
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">

            {registration.competitionDate && (
              <span>
                📅{" "}
                {formatDate(
                  registration.competitionDate
                )}
              </span>
            )}

            {registration.venue && (
              <span>
                📍 {registration.venue}
              </span>
            )}

          </div>

        </div>


        <Link
          href="/participant/tickets"
          className="inline-flex w-full shrink-0 items-center justify-center rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white sm:w-auto"
        >
          View Ticket
        </Link>

      </div>

    </div>
  );
}


/* ============================================================
   UPCOMING CARD
============================================================ */

function UpcomingCard({
  registration,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            Upcoming
          </p>

          <h3 className="mt-2 truncate text-lg font-semibold text-white">
            {registration.competitionName ||
              "Competition"}
          </h3>

        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          🏆
        </div>

      </div>


      <div className="mt-5 space-y-2 text-sm">

        {registration.competitionDate && (
          <div className="flex gap-3">
            <span className="text-slate-500">
              Date
            </span>

            <span className="text-slate-300">
              {formatDate(
                registration.competitionDate
              )}
            </span>
          </div>
        )}

        {registration.startTime && (
          <div className="flex gap-3">
            <span className="text-slate-500">
              Time
            </span>

            <span className="text-slate-300">
              {formatTime(
                registration.startTime
              )}
            </span>
          </div>
        )}

        {registration.venue && (
          <div className="flex gap-3">
            <span className="text-slate-500">
              Venue
            </span>

            <span className="break-words text-slate-300">
              {registration.venue}
            </span>
          </div>
        )}

      </div>

    </div>
  );
}


/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
  href,
  icon,
  title,
  description,
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#08152b] p-4 transition hover:border-blue-500/30 hover:bg-blue-500/[0.05]"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

    </Link>
  );
}


/* ============================================================
   LOADING CARD
============================================================ */

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-xl border border-white/10 bg-white/[0.03] p-5">

      <div className="h-4 w-40 rounded bg-white/10" />

      <div className="mt-3 h-3 w-64 max-w-full rounded bg-white/5" />

      <div className="mt-3 h-3 w-48 max-w-full rounded bg-white/5" />

    </div>
  );
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-400">
        🏆
      </div>

      <p className="mt-4 font-medium text-white">
        No confirmed registrations yet
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Browse events and register for a competition.
      </p>

      <Link
        href="/participant/events"
        className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        Browse Events
      </Link>

    </div>
  );
}


/* ============================================================
   DATE HELPERS
============================================================ */

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function formatTime(value) {
  if (!value) {
    return "—";
  }

  const parts = value.split(":");

  if (parts.length < 2) {
    return value;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value;
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}