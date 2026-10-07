"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EventDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />
            <p className="mt-4 text-sm text-slate-400">
              Loading event details...
            </p>
          </div>
        </div>
      }
    >
      <EventDetailsContent />
    </Suspense>
  );
}

function EventDetailsContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const eventId = searchParams.get("eventId");

  const [event, setEvent] = useState(null);
  const [competitions, setCompetitions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [competitionError, setCompetitionError] = useState("");

  useEffect(() => {
    if (!eventId) {
      setError("Event ID is missing.");
      setLoading(false);
      return;
    }

    loadEvent();
  }, [eventId]);

  /*
   * ==========================================================
   * PUBLIC EVENT LOADING
   * ==========================================================
   *
   * IMPORTANT:
   * No login check here.
   *
   * Anyone can view:
   * - Event details
   * - Event image
   * - Event dates
   * - Venue
   * - Published competitions
   * - Competition fees
   *
   * Login is required only when the participant clicks
   * Register inside the competition registration flow.
   *
   * ==========================================================
   */

  async function loadEvent() {
    try {
      setLoading(true);
      setError("");
      setCompetitionError("");

      // =====================================================
      // LOAD PUBLIC PUBLISHED EVENT
      // =====================================================

      const { data: eventData, error: eventError } =
        await supabase
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
          .eq("id", eventId)
          .eq("status", "PUBLISHED")
          .maybeSingle();

      if (eventError) {
        console.error("Event loading error:", eventError);
        setError(eventError.message);
        return;
      }

      if (!eventData) {
        setError(
          "This event was not found or is not currently published."
        );
        return;
      }

      setEvent(eventData);

      // =====================================================
      // LOAD PUBLIC PUBLISHED COMPETITIONS
      // =====================================================

      const {
        data: competitionData,
        error: competitionsError,
      } = await supabase
        .from("competitions")
        .select(
          `
            id,
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
            poster_url
          `
        )
        .eq("event_id", eventId)
        .eq("status", "PUBLISHED")
        .order("competition_date", {
          ascending: true,
        });

      if (competitionsError) {
        console.error(
          "Competition loading error:",
          competitionsError
        );

        setCompetitionError(competitionsError.message);
        setCompetitions([]);
      } else {
        setCompetitions(competitionData || []);
      }
    } catch (err) {
      console.error("Unexpected event error:", err);

      setError(
        "Something went wrong while loading the event."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // DATE HELPERS
  // ==========================================================

  function formatDate(date) {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatShortDate(date) {
    if (!date) {
      return "Date not available";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateRange(startDate, endDate) {
    if (!startDate) {
      return "Date not available";
    }

    if (!endDate || startDate === endDate) {
      return formatDate(startDate);
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  function formatTime(time) {
    if (!time) {
      return "Not available";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    date.setSeconds(0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatCompetitionSchedule(competition) {
    const date = formatShortDate(
      competition.competition_date
    );

    if (
      competition.start_time &&
      competition.end_time
    ) {
      return `${date} • ${formatTime(
        competition.start_time
      )} - ${formatTime(competition.end_time)}`;
    }

    return date;
  }

  function formatFee(fee) {
    if (fee === null || fee === undefined) {
      return "Not specified";
    }

    const amount = Number(fee);

    if (amount === 0) {
      return "Free";
    }

    return `₹${amount}`;
  }

  function getCompetitionRules(rules) {
    if (!rules) {
      return [];
    }

    return rules
      .split(/\r?\n/)
      .map((rule) => rule.trim())
      .filter(Boolean);
  }

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">

        <header className="border-b border-white/10 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm text-blue-400">
              EventNest
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Event Details
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Loading event information...
            </p>
          </div>
        </header>

        <main className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">

            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

            <p className="mt-4 text-sm text-slate-400">
              Loading event details...
            </p>

          </div>
        </main>
      </div>
    );
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">

        <header className="border-b border-white/10 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            <p className="text-sm text-blue-400">
              EventNest
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Event Details
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              View event information and competitions.
            </p>

          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">

            <h2 className="text-xl font-bold text-red-400">
              Unable to load event
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              {error}
            </p>

            <Link
              href="/participant/events"
              className="mt-5 inline-flex rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold transition hover:bg-blue-600"
            >
              ← Back to Events
            </Link>

          </div>

        </main>
      </div>
    );
  }

  // ==========================================================
  // MAIN PUBLIC EVENT PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-white/10 px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <p className="text-sm text-blue-400">
            EventNest
          </p>

          <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                Event Details
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Explore this event and its competitions.
              </p>

            </div>

            <div className="text-left sm:text-right">

              <p className="text-sm font-medium text-slate-300">
                Public Event
              </p>

              <p className="text-xs text-slate-500">
                No login required to browse
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* BACK BUTTON */}

        <Link
          href="/participant/events"
          className="mb-6 inline-flex items-center text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Events
        </Link>

        {/* ===================================================
            EVENT CARD
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a]">

          {/* EVENT IMAGE */}

          <div className="relative h-64 bg-slate-900 sm:h-80 lg:h-96">

            {event.event_image ? (
              <img
                src={event.event_image}
                alt={event.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-purple-500/20">

                <div className="text-center">

                  <div className="text-7xl">
                    🎫
                  </div>

                  <p className="mt-4 text-sm text-slate-400">
                    Event Image
                  </p>

                </div>

              </div>
            )}

            {/* PUBLISHED BADGE */}

            <div className="absolute left-4 top-4 rounded-full bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-300 backdrop-blur sm:left-6 sm:top-6">
              Published
            </div>

          </div>

          {/* EVENT INFORMATION */}

          <div className="p-5 sm:p-8">

            <p className="text-sm font-medium text-blue-400">
              EVENT
            </p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              {event.name}
            </h2>

            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-400 sm:text-base">
              {event.description ||
                "No description has been provided for this event."}
            </p>

            {/* EVENT INFO GRID */}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <InfoCard
                icon="📅"
                title="Event Dates"
                value={formatDateRange(
                  event.start_date,
                  event.end_date
                )}
              />

              <InfoCard
                icon="📍"
                title="Venue"
                value={
                  event.venue ||
                  "Venue not specified"
                }
              />

              <InfoCard
                icon="⏰"
                title="Registration Deadline"
                value={formatDate(
                  event.registration_deadline
                )}
              />

              <InfoCard
                icon="🏆"
                title="Competitions"
                value={`${competitions.length} ${
                  competitions.length === 1
                    ? "competition"
                    : "competitions"
                }`}
              />

            </div>

          </div>

        </section>

        {/* ===================================================
            COMPETITIONS
        ==================================================== */}

        <section className="mt-8">

          <div className="mb-5">

            <p className="text-sm font-medium text-blue-400">
              EVENT COMPETITIONS
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Available Competitions
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Explore competitions and register when you
              are ready.
            </p>

          </div>

          {/* COMPETITION ERROR */}

          {competitionError && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">

              <h3 className="font-semibold text-red-400">
                Unable to load competitions
              </h3>

              <p className="mt-2 text-sm text-slate-300">
                {competitionError}
              </p>

            </div>
          )}

          {/* NO COMPETITIONS */}

          {!competitionError &&
            competitions.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-10 text-center">

                <div className="text-5xl">
                  🏆
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  No competitions available
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  There are currently no published
                  competitions available for this event.
                </p>

              </div>
            )}

          {/* COMPETITION LIST */}

          {!competitionError &&
            competitions.length > 0 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                {competitions.map((competition) => {

                  const rules = getCompetitionRules(
                    competition.rules
                  );

                  return (
                    <article
                      key={competition.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] transition hover:-translate-y-1 hover:border-blue-500/40"
                    >

                      {/* POSTER */}

                      <div className="h-44 bg-slate-900">

                        {competition.poster_url ? (
                          <img
                            src={competition.poster_url}
                            alt={competition.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-purple-500/10">

                            <div className="text-center">

                              <div className="text-5xl">
                                🏆
                              </div>

                              <p className="mt-2 text-xs text-slate-500">
                                Competition
                              </p>

                            </div>

                          </div>
                        )}

                      </div>

                      {/* COMPETITION CONTENT */}

                      <div className="p-5">

                        <div className="mb-3 inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                          Published
                        </div>

                        <h3 className="text-xl font-semibold">
                          {competition.name}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                          {competition.description ||
                            "No description available."}
                        </p>

                        {/* DETAILS */}

                        <div className="mt-5 space-y-3 border-t border-white/10 pt-4">

                          {/* SCHEDULE */}

                          <div className="flex gap-3">

                            <span>
                              📅
                            </span>

                            <div className="min-w-0">

                              <p className="text-xs text-slate-500">
                                Schedule
                              </p>

                              <p className="mt-1 break-words text-sm text-slate-200">
                                {formatCompetitionSchedule(
                                  competition
                                )}
                              </p>

                            </div>

                          </div>

                          {/* VENUE */}

                          <div className="flex gap-3">

                            <span>
                              📍
                            </span>

                            <div className="min-w-0">

                              <p className="text-xs text-slate-500">
                                Venue
                              </p>

                              <p className="mt-1 break-words text-sm text-slate-200">
                                {competition.venue ||
                                  event.venue ||
                                  "Not specified"}
                              </p>

                            </div>

                          </div>

                          {/* FEE */}

                          <div className="flex gap-3">

                            <span>
                              💰
                            </span>

                            <div>

                              <p className="text-xs text-slate-500">
                                Registration Fee
                              </p>

                              <p className="mt-1 text-sm font-medium text-cyan-400">
                                {formatFee(
                                  competition.registration_fee
                                )}
                              </p>

                            </div>

                          </div>

                          {/* CAPACITY */}

                          {competition.capacity !== null &&
                            competition.capacity !==
                              undefined && (
                              <div className="flex gap-3">

                                <span>
                                  👥
                                </span>

                                <div>

                                  <p className="text-xs text-slate-500">
                                    Capacity
                                  </p>

                                  <p className="mt-1 text-sm text-slate-200">
                                    {competition.capacity}{" "}
                                    participants
                                  </p>

                                </div>

                              </div>
                            )}

                        </div>

                        {/* RULES */}

                        {rules.length > 0 && (
                          <div className="mt-5 border-t border-white/10 pt-4">

                            <p className="text-xs text-slate-500">
                              Rules
                            </p>

                            <div className="mt-2 space-y-2">

                              {rules
                                .slice(0, 3)
                                .map((rule, index) => (
                                  <div
                                    key={`${competition.id}-rule-${index}`}
                                    className="flex gap-2 text-xs leading-5 text-slate-400"
                                  >

                                    <span className="text-cyan-400">
                                      ✓
                                    </span>

                                    <span>
                                      {rule}
                                    </span>

                                  </div>
                                ))}

                            </div>

                            {rules.length > 3 && (
                              <p className="mt-2 text-xs text-slate-500">
                                + {rules.length - 3} more rule
                                {rules.length - 3 === 1
                                  ? ""
                                  : "s"}
                              </p>
                            )}

                          </div>
                        )}

                        {/* VIEW COMPETITION */}

                        <div className="mt-5">

                          <Link
                            href={`/participant/events/details/competition/${competition.id}`}
                            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20"
                          >
                            View Details →
                          </Link>

                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

        </section>

        {/* ===================================================
            ABOUT EVENT
        ==================================================== */}

        <section className="mt-8 rounded-2xl border border-white/10 bg-[#0f172a] p-5 sm:p-6">

          <h2 className="text-xl font-bold">
            About This Event
          </h2>

          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-400 sm:text-base">
            {event.description ||
              "No additional information is available."}
          </p>

        </section>

      </main>
    </div>
  );
}

/*
 * ============================================================
 * INFO CARD
 * ============================================================
 */

function InfoCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="mt-1 break-words text-sm font-medium text-slate-200">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}