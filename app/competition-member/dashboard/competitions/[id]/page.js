"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CompetitionMemberCompetitionPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const competitionId = params?.id;

  const [competition, setCompetition] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (competitionId) {
      loadCompetition();
    }
  }, [competitionId]);

  async function loadCompetition() {
    try {
      setLoading(true);
      setError("");

      // --------------------------------------------
      // 1. Check logged-in user
      // --------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      // --------------------------------------------
      // 2. Verify this user is actually a member
      // --------------------------------------------

      const { data: membership, error: membershipError } =
        await supabase
          .from("competition_members")
          .select("id, assigned_at")
          .eq("competition_id", competitionId)
          .eq("member_id", user.id)
          .maybeSingle();

      if (membershipError) {
        console.error(
          "Membership verification error:",
          membershipError
        );

        setError(
          "Unable to verify your competition membership."
        );

        return;
      }

      if (!membership) {
        setError(
          "You are not assigned to this competition."
        );

        return;
      }

      // --------------------------------------------
      // 3. Load competition
      // --------------------------------------------

      const { data: competitionData, error: competitionError } =
        await supabase
          .from("competitions")
          .select(`
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
            poster_url,
            event_id,
            events (
              id,
              name,
              description,
              start_date,
              end_date,
              venue,
              status
            )
          `)
          .eq("id", competitionId)
          .single();

      if (competitionError || !competitionData) {
        console.error(
          "Competition lookup error:",
          competitionError
        );

        setError("Competition could not be found.");

        return;
      }

      setCompetition(competitionData);

      // --------------------------------------------
      // 4. Load competition sessions
      // --------------------------------------------

      const { data: sessionData, error: sessionError } =
        await supabase
          .from("competition_sessions")
          .select(`
            id,
            competition_id,
            session_name,
            session_date,
            start_time,
            end_time,
            check_in_start,
            check_in_end,
            late_entry_allowed,
            venue,
            created_at
          `)
          .eq("competition_id", competitionId)
          .order("session_date", {
            ascending: true,
          })
          .order("start_time", {
            ascending: true,
          });

      if (sessionError) {
        console.error(
          "Session lookup error:",
          sessionError
        );

        setSessions([]);
      } else {
        setSessions(sessionData || []);
      }
    } catch (err) {
      console.error(
        "Competition member competition page error:",
        err
      );

      setError(
        "Something went wrong while loading the competition."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------
  // Format date
  // --------------------------------------------

  function formatDate(date) {
    if (!date) return "Not scheduled";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // --------------------------------------------
  // Format time
  // --------------------------------------------

  function formatTime(time) {
    if (!time) return "Not set";

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
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

  // --------------------------------------------
  // Status style
  // --------------------------------------------

  function getStatusClass(status) {
    switch (status) {
      case "PUBLISHED":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

      case "ONGOING":
        return "border-blue-500/30 bg-blue-500/10 text-blue-300";

      case "COMPLETED":
        return "border-slate-500/30 bg-slate-500/10 text-slate-300";

      case "CANCELLED":
        return "border-red-500/30 bg-red-500/10 text-red-300";

      default:
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
    }
  }

  // --------------------------------------------
  // Loading
  // --------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />

          <p className="mt-4 text-sm text-slate-400">
            Loading competition...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------
  // Error
  // --------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] px-4 py-10 text-white">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-red-500/20 bg-[#0b1220] p-6 text-center">
            <div className="text-4xl">⚠️</div>

            <h1 className="mt-4 text-xl font-bold">
              Unable to open competition
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {error}
            </p>

            <button
              onClick={() =>
                router.push("/competition-member/dashboard")
              }
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* ------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------ */}

      <header className="border-b border-white/10 bg-[#0b1220]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <button
              onClick={() =>
                router.push("/competition-member/dashboard")
              }
              className="mb-2 text-sm text-indigo-400 transition hover:text-indigo-300"
            >
              ← Back to Dashboard
            </button>

            <p className="text-sm font-semibold text-indigo-400">
              EventNest
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              {competition?.name}
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              {competition?.events?.name ||
                "EventNest Event"}
            </p>
          </div>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 sm:w-auto"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ------------------------------------------ */}
      {/* Main */}
      {/* ------------------------------------------ */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ---------------------------------------- */}
        {/* Hero */}
        {/* ---------------------------------------- */}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220]">
          {competition?.poster_url && (
            <div className="h-48 w-full overflow-hidden sm:h-64">
              <img
                src={competition.poster_url}
                alt={competition.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Competition
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {competition?.name}
                </h2>
              </div>

              <span
                className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                  competition?.status
                )}`}
              >
                {competition?.status || "DRAFT"}
              </span>
            </div>

            {competition?.description && (
              <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-300">
                {competition.description}
              </p>
            )}
          </div>
        </section>

        {/* ---------------------------------------- */}
        {/* Competition Information */}
        {/* ---------------------------------------- */}

        <section className="mt-6">
          <h2 className="text-xl font-bold">
            Competition Information
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard
              label="Competition Date"
              value={formatDate(
                competition?.competition_date
              )}
            />

            <InfoCard
              label="Competition Time"
              value={`${formatTime(
                competition?.start_time
              )} - ${formatTime(
                competition?.end_time
              )}`}
            />

            <InfoCard
              label="Venue"
              value={
                competition?.venue ||
                competition?.events?.venue ||
                "Not specified"
              }
            />

            <InfoCard
              label="Check-in"
              value={`${formatTime(
                competition?.check_in_start
              )} - ${formatTime(
                competition?.check_in_end
              )}`}
            />

            <InfoCard
              label="Late Entry"
              value={
                competition?.late_entry_allowed
                  ? "Allowed"
                  : "Not allowed"
              }
            />

            <InfoCard
              label="Capacity"
              value={
                competition?.capacity
                  ? String(competition.capacity)
                  : "Not specified"
              }
            />
          </div>
        </section>

        {/* ---------------------------------------- */}
        {/* Sessions */}
        {/* ---------------------------------------- */}

        <section className="mt-8">
          <div>
            <h2 className="text-xl font-bold">
              Competition Sessions
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Your competition schedule and session timings.
            </p>
          </div>

          {sessions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-[#0b1220] p-6">
              <p className="text-sm text-slate-400">
                No separate sessions have been scheduled
                for this competition.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {sessions.map((session, index) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-white/10 bg-[#0b1220] p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
                        Session {index + 1}
                      </p>

                      <h3 className="mt-1 text-lg font-bold">
                        {session.session_name ||
                          `Session ${index + 1}`}
                      </h3>
                    </div>

                    <p className="text-sm font-medium text-slate-300">
                      {formatDate(session.session_date)}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoCard
                      label="Time"
                      value={`${formatTime(
                        session.start_time
                      )} - ${formatTime(
                        session.end_time
                      )}`}
                    />

                    <InfoCard
                      label="Check-in"
                      value={`${formatTime(
                        session.check_in_start
                      )} - ${formatTime(
                        session.check_in_end
                      )}`}
                    />

                    <InfoCard
                      label="Venue"
                      value={
                        session.venue ||
                        competition?.venue ||
                        "Not specified"
                      }
                    />

                    <InfoCard
                      label="Late Entry"
                      value={
                        session.late_entry_allowed
                          ? "Allowed"
                          : "Not allowed"
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---------------------------------------- */}
        {/* Rules */}
        {/* ---------------------------------------- */}

        {competition?.rules && (
          <section className="mt-8">
            <h2 className="text-xl font-bold">
              Competition Rules
            </h2>

            <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1220] p-5 sm:p-6">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {competition.rules}
              </p>
            </div>
          </section>
        )}

        {/* ---------------------------------------- */}
        {/* Event Information */}
        {/* ---------------------------------------- */}

        {competition?.events && (
          <section className="mt-8">
            <h2 className="text-xl font-bold">
              Event Information
            </h2>

            <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1220] p-5 sm:p-6">
              <h3 className="text-lg font-bold">
                {competition.events.name}
              </h3>

              {competition.events.description && (
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {competition.events.description}
                </p>
              )}

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InfoCard
                  label="Event Start"
                  value={formatDate(
                    competition.events.start_date
                  )}
                />

                <InfoCard
                  label="Event End"
                  value={formatDate(
                    competition.events.end_date
                  )}
                />

                <InfoCard
                  label="Event Venue"
                  value={
                    competition.events.venue ||
                    "Not specified"
                  }
                />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// --------------------------------------------------
// Reusable information card
// --------------------------------------------------

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-200">
        {value || "Not available"}
      </p>
    </div>
  );
}
