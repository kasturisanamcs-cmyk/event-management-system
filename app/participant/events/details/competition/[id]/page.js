"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function formatDate(date) {
  if (!date) return "Date not available";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");

  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatFee(fee) {
  const amount = Number(fee || 0);

  if (amount === 0) {
    return "Free";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export default function ParticipantCompetitionDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const competitionId = params?.id;

  const [competition, setCompetition] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [existingRegistration, setExistingRegistration] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ----------------------------------------------------------
   * LOAD COMPETITION
   * ----------------------------------------------------------
   *
   * IMPORTANT:
   *
   * This page is PUBLIC.
   *
   * A user does NOT need to be logged in to see:
   * - Competition
   * - Description
   * - Rules
   * - Fee
   * - Sessions
   * - Venue
   * - Availability
   *
   * Login is checked ONLY when Register Now is clicked.
   *
   * ----------------------------------------------------------
   */

  useEffect(() => {
    if (competitionId) {
      loadCompetition();
    }
  }, [competitionId]);

  async function loadCompetition() {
    const supabase = createClient();

    setLoading(true);
    setError("");

    try {
      /*
       * ======================================================
       * 1. LOAD PUBLISHED COMPETITION
       * ======================================================
       */

      const {
        data: competitionData,
        error: competitionError,
      } = await supabase
        .from("competitions")
        .select(`
          id,
          event_id,
          organizer_id,
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
        `)
        .eq("id", competitionId)
        .eq("status", "PUBLISHED")
        .maybeSingle();

      if (competitionError) {
        throw competitionError;
      }

      if (!competitionData) {
        setError(
          "Competition not found or is not published."
        );
        return;
      }

      setCompetition(competitionData);

      /*
       * ======================================================
       * 2. LOAD SESSIONS + AVAILABILITY
       * ======================================================
       */

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.rpc(
        "get_competition_session_availability",
        {
          target_competition_id: competitionId,
        }
      );

      if (sessionError) {
        console.error(
          "Session availability error:",
          sessionError
        );

        /*
         * Fallback to direct session query.
         */

        const {
          data: fallbackSessions,
          error: fallbackError,
        } = await supabase
          .from("competition_sessions")
          .select(`
            id,
            session_name,
            session_date,
            start_time,
            end_time,
            check_in_start,
            check_in_end,
            late_entry_allowed,
            venue,
            capacity
          `)
          .eq("competition_id", competitionId)
          .order("session_date", {
            ascending: true,
          })
          .order("start_time", {
            ascending: true,
          });

        if (fallbackError) {
          console.error(
            "Fallback session error:",
            fallbackError
          );

          setSessions([]);
        } else {
          setSessions(
            (fallbackSessions || []).map((session) => ({
              ...session,
              registered_count: null,
              available_seats: session.capacity,
            }))
          );
        }
      } else {
        setSessions(sessionData || []);
      }

      /*
       * ======================================================
       * 3. OPTIONAL LOGIN CHECK
       * ======================================================
       *
       * We do NOT require login.
       *
       * We only check whether a user happens to already
       * be logged in so we can show "Already Registered".
       *
       * If no user exists, the page continues normally.
       * ======================================================
       */

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const {
          data: registrationData,
          error: registrationError,
        } = await supabase
          .from("registrations")
          .select(`
            id,
            registration_number,
            status,
            registered_at,
            session_id
          `)
          .eq("user_id", user.id)
          .eq("competition_id", competitionId)
          .in("status", ["PENDING", "APPROVED", "CONFIRMED"])
          .maybeSingle();

        if (registrationError) {
          console.warn(
            "Could not check existing registration:",
            registrationError
          );

          setExistingRegistration(null);
        } else {
          setExistingRegistration(
            registrationData || null
          );
        }
      } else {
        /*
         * Not logged in is completely allowed here.
         */
        setExistingRegistration(null);
      }
    } catch (err) {
      console.error(
        "Competition details loading error:",
        err
      );

      setError(
        err?.message ||
          "Could not load competition details."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==========================================================
   * REGISTER BUTTON
   * ==========================================================
   *
   * THIS is where login is required.
   *
   * Not logged in:
   *      → /login
   *
   * Logged in:
   *      → registration form
   *
   * The return URL is passed so the user can continue to
   * the same competition after signing in.
   * ==========================================================
   */

  async function handleRegister() {
    if (!competition) {
      return;
    }

    const supabase = createClient();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Authentication check error:",
          userError
        );
      }

      /*
       * ------------------------------------------------------
       * NOT LOGGED IN
       * ------------------------------------------------------
       */

      if (!user) {
        const registrationUrl =
          `/participant/events/details/competition/${competition.id}/register`;

        const loginUrl =
          `/login?redirectTo=${encodeURIComponent(
            registrationUrl
          )}`;

        router.push(loginUrl);

        return;
      }

      /*
       * ------------------------------------------------------
       * LOGGED IN
       * ------------------------------------------------------
       */

      router.push(
        `/participant/events/details/competition/${competition.id}/register`
      );
    } catch (err) {
      console.error(
        "Register button error:",
        err
      );

      router.push("/login");
    }
  }

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-8 text-white sm:px-6 lg:px-8">

        <div className="mx-auto max-w-5xl">

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />

            <p className="mt-4 text-sm text-slate-400">
              Loading competition...
            </p>

          </div>

        </div>

      </main>
    );
  }

  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */

  if (error || !competition) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-8 text-white sm:px-6 lg:px-8">

        <div className="mx-auto max-w-5xl">

          <Link
            href="/participant/events"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to Events
          </Link>

          <div className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-6 sm:p-8">

            <h1 className="text-xl font-semibold text-red-300">
              {error || "Competition not found."}
            </h1>

            <Link
              href="/participant/events"
              className="mt-6 inline-flex rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              ← Back to Events
            </Link>

          </div>

        </div>

      </main>
    );
  }

  /*
   * ==========================================================
   * CHECK FULL
   * ==========================================================
   */

  const competitionFull =
    sessions.length > 0 &&
    sessions.every(
      (session) =>
        session.available_seats !== null &&
        session.available_seats !== undefined &&
        Number(session.available_seats) <= 0
    );

  /*
   * ==========================================================
   * MAIN PAGE
   * ==========================================================
   */

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* ==================================================
            BACK
        =================================================== */}

        <Link
          href={`/participant/events/details?eventId=${competition.event_id}`}
          className="inline-flex items-center text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Event
        </Link>

        {/* ==================================================
            HERO
        =================================================== */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">

          {competition.poster_url ? (
            <div className="border-b border-white/10 bg-slate-950">

              <img
                src={competition.poster_url}
                alt={`${competition.name} poster`}
                className="max-h-[420px] w-full object-contain"
              />

            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center border-b border-white/10 bg-gradient-to-br from-blue-500/10 via-slate-950 to-purple-500/10 px-6 text-center">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                  Competition
                </p>

                <h1 className="mt-3 text-3xl font-bold text-white sm:text-5xl">
                  {competition.name}
                </h1>

              </div>

            </div>
          )}

          <div className="p-6 sm:p-8 lg:p-10">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                  Competition
                </p>

                <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                  {competition.name}
                </h1>

              </div>

              <div className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                Published
              </div>

            </div>

            {competition.description && (
              <p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-300 sm:text-base">
                {competition.description}
              </p>
            )}

            {/* QUICK INFORMATION */}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <InfoCard
                label="Registration Fee"
                value={formatFee(
                  competition.registration_fee
                )}
              />

              <InfoCard
                label="Maximum Participants"
                value={
                  competition.capacity
                    ? String(competition.capacity)
                    : "Not specified"
                }
              />

              <InfoCard
                label="Venue"
                value={
                  competition.venue ||
                  "Venue not specified"
                }
              />

              <InfoCard
                label="Competition Date"
                value={
                  competition.competition_date
                    ? formatDate(
                        competition.competition_date
                      )
                    : "See sessions"
                }
              />

            </div>

          </div>

        </section>

        {/* ==================================================
            RULES
        =================================================== */}

        {competition.rules && (
          <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">

            <h2 className="text-xl font-semibold text-white">
              Competition Rules
            </h2>

            <div className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-300">
              {competition.rules}
            </div>

          </section>
        )}

        {/* ==================================================
            SESSIONS
        =================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">

          <div>

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Schedule
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Choose a Session
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select a session during registration.
            </p>

          </div>

          {sessions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">

              <p className="text-sm text-yellow-300">
                No sessions are currently available for
                this competition.
              </p>

            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">

              {sessions.map((session, index) => {

                const isFull =
                  session.available_seats !== null &&
                  session.available_seats !== undefined &&
                  Number(session.available_seats) <= 0;

                return (
                  <div
                    key={session.id}
                    className={`rounded-2xl border p-5 transition ${
                      isFull
                        ? "border-red-500/20 bg-red-500/5"
                        : "border-white/10 bg-slate-950/40 hover:border-blue-500/30"
                    }`}
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                          Session {index + 1}
                        </p>

                        <h3 className="mt-1 text-lg font-semibold text-white">
                          {session.session_name ||
                            `Session ${index + 1}`}
                        </h3>

                      </div>

                      {isFull ? (
                        <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-300">
                          FULL
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                          Available
                        </span>
                      )}

                    </div>

                    <div className="mt-5 space-y-3 text-sm">

                      <DetailRow
                        label="Date"
                        value={formatDate(
                          session.session_date
                        )}
                      />

                      <DetailRow
                        label="Time"
                        value={`${formatTime(
                          session.start_time
                        )} – ${formatTime(
                          session.end_time
                        )}`}
                      />

                      <DetailRow
                        label="Venue"
                        value={
                          session.venue ||
                          competition.venue ||
                          "Not specified"
                        }
                      />

                      <DetailRow
                        label="Check-in"
                        value={
                          session.check_in_start &&
                          session.check_in_end
                            ? `${formatTime(
                                session.check_in_start
                              )} – ${formatTime(
                                session.check_in_end
                              )}`
                            : "Not specified"
                        }
                      />

                    </div>

                    <div className="mt-5 border-t border-white/10 pt-4">

                      {session.available_seats !== null &&
                      session.available_seats !==
                        undefined ? (
                        <p className="text-sm text-slate-400">

                          <span className="font-semibold text-white">
                            {session.available_seats}
                          </span>{" "}
                          seats available

                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Capacity information unavailable
                        </p>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

        {/* ==================================================
            REGISTRATION
        =================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-white/[0.04] to-purple-500/10 p-6 sm:p-8">

          {existingRegistration ? (
            <div>

              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
                Already Registered
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Your registration is already created
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Registration Number:{" "}

                <span className="font-semibold text-white">
                  {existingRegistration.registration_number ||
                    "Processing"}
                </span>
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Status:{" "}

                <span className="font-semibold text-slate-300">
                  {existingRegistration.status}
                </span>
              </p>

              <Link
                href="/participant/registrations"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                View My Registrations
              </Link>

            </div>
          ) : (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                  Ready to participate?
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  Register for {competition.name}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Choose your preferred session and
                  complete the registration process.
                </p>

              </div>

              <button
                type="button"
                onClick={handleRegister}
                disabled={
                  sessions.length === 0 ||
                  competitionFull
                }
                className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {competitionFull
                  ? "Competition Full"
                  : "Register Now →"}
              </button>

            </div>
          )}

        </section>

        {/* ==================================================
            BOTTOM NAVIGATION
        =================================================== */}

        <div className="flex flex-col gap-3 py-8 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/participant/events"
            className="text-sm text-slate-500 transition hover:text-white"
          >
            ← Browse All Events
          </Link>

          <Link
            href="/participant/registrations"
            className="text-sm text-slate-500 transition hover:text-white"
          >
            My Registrations →
          </Link>

        </div>

      </div>

    </main>
  );
}

/*
 * ============================================================
 * INFO CARD
 * ============================================================
 */

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">

      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-white">
        {value}
      </p>

    </div>
  );
}

/*
 * ============================================================
 * DETAIL ROW
 * ============================================================
 */

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">

      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-medium text-slate-200 sm:text-right">
        {value}
      </span>

    </div>
  );
}