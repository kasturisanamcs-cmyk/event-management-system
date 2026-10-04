"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CompetitionMemberDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const { data: memberships, error: membershipError } =
        await supabase
          .from("competition_members")
          .select(`
            id,
            competition_id,
            assigned_at,
            competitions (
              id,
              name,
              description,
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
                start_date,
                end_date,
                venue
              )
            )
          `)
          .eq("member_id", currentUser.id)
          .order("assigned_at", {
            ascending: false,
          });

      if (membershipError) {
        console.error(
          "Competition membership error:",
          membershipError
        );

        setError(
          "Unable to load your assigned competitions."
        );

        return;
      }

      const assignedCompetitions = (memberships || [])
        .map((membership) => membership.competitions)
        .filter(Boolean);

      setCompetitions(assignedCompetitions);
    } catch (err) {
      console.error(
        "Competition member dashboard error:",
        err
      );

      setError(
        "Something went wrong while loading your dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await supabase.auth.signOut();

      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  function formatDate(date) {
    if (!date) return "Not scheduled";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

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

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

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

  function getUpcomingCompetition() {
    if (!competitions.length) return null;

    const today = new Date();

    const upcoming = competitions
      .filter((competition) => {
        if (!competition.competition_date) return false;

        return new Date(competition.competition_date) >= today;
      })
      .sort(
        (a, b) =>
          new Date(a.competition_date) -
          new Date(b.competition_date)
      );

    return upcoming[0] || competitions[0];
  }

  const upcomingCompetition = getUpcomingCompetition();

  const memberName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Competition Member";

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#020617]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              EventNest
            </p>

            <h1 className="mt-1 truncate text-lg font-bold sm:text-xl">
              Competition Member
            </h1>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* WELCOME */}
        <section className="overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent p-5 sm:p-7">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-indigo-300">
              Welcome back
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {memberName}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Manage your assigned competitions, review
              registrations, verify payments, and handle
              participant check-ins from one place.
            </p>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-300">
              {error}
            </p>

            <button
              onClick={loadDashboard}
              className="w-full rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 sm:w-auto"
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />

              <p className="mt-4 text-sm text-slate-400">
                Loading your dashboard...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* QUICK ACTIONS */}
            <section className="mt-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold sm:text-xl">
                  Quick Actions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Quickly access the tools you use most.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                  onClick={() =>
                    router.push(
                      "/competition-member/registrations"
                    )
                  }
                  className="group rounded-2xl border border-white/10 bg-[#0b1220] p-4 text-left transition hover:border-indigo-500/40 hover:bg-white/[0.04]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-xl">
                    📋
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    Registrations
                  </p>

                  <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                    Review participants
                  </p>
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/competition-member/payments"
                    )
                  }
                  className="group rounded-2xl border border-white/10 bg-[#0b1220] p-4 text-left transition hover:border-emerald-500/40 hover:bg-white/[0.04]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
                    ₹
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    Payments
                  </p>

                  <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                    Verify offline payments
                  </p>
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/competition-member/scan"
                    )
                  }
                  className="group rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-left transition hover:border-indigo-400/50 hover:bg-indigo-500/15"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-xl">
                    📷
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    QR Check-In
                  </p>

                  <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                    Scan participant tickets
                  </p>
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/competition-member/attendance"
                    )
                  }
                  className="group rounded-2xl border border-white/10 bg-[#0b1220] p-4 text-left transition hover:border-purple-500/40 hover:bg-white/[0.04]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-xl">
                    ✓
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    Attendance
                  </p>

                  <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                    View check-ins
                  </p>
                </button>
              </div>
            </section>

            {/* STATS */}
            <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4 sm:p-5">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Assigned Competitions
                </p>

                <p className="mt-2 text-2xl font-bold sm:text-3xl">
                  {competitions.length}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Your competitions
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4 sm:p-5">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Member Status
                </p>

                <p className="mt-2 text-xl font-bold text-emerald-300 sm:text-2xl">
                  Active
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Access enabled
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-white/10 bg-[#0b1220] p-4 sm:col-span-1 sm:p-5">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Next Competition
                </p>

                <p className="mt-2 truncate text-base font-bold sm:text-lg">
                  {upcomingCompetition?.name ||
                    "Nothing scheduled"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {upcomingCompetition
                    ? formatDate(
                        upcomingCompetition.competition_date
                      )
                    : "No upcoming competition"}
                </p>
              </div>
            </section>

            {/* UPCOMING COMPETITION */}
            {upcomingCompetition && (
              <section className="mt-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-transparent p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                      Next Up
                    </p>

                    <h2 className="mt-1 truncate text-xl font-bold sm:text-2xl">
                      {upcomingCompetition.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      {upcomingCompetition.events?.name ||
                        "EventNest Event"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
                      <span>
                        📅{" "}
                        {formatDate(
                          upcomingCompetition.competition_date
                        )}
                      </span>

                      <span>
                        🕐{" "}
                        {formatTime(
                          upcomingCompetition.start_time
                        )}
                      </span>

                      <span>
                        📍{" "}
                        {upcomingCompetition.venue ||
                          upcomingCompetition.events?.venue ||
                          "Venue not specified"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/competition-member/competitions/${upcomingCompetition.id}`
                      )
                    }
                    className="w-full shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 sm:w-auto"
                  >
                    Open Competition
                  </button>
                </div>
              </section>
            )}

            {/* COMPETITIONS */}
            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold sm:text-xl">
                  My Competitions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Competitions where you are assigned as a
                  member.
                </p>
              </div>

              {competitions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b1220] px-5 py-12 text-center sm:px-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                    🏆
                  </div>

                  <p className="mt-4 text-lg font-semibold">
                    No competitions assigned
                  </p>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    You have not been assigned to any
                    competition yet. Once an organizer adds
                    you, the competition will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {competitions.map((competition) => (
                    <article
                      key={competition.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] transition hover:border-indigo-500/30"
                    >
                      {/* POSTER */}
                      {competition.poster_url ? (
                        <div className="h-44 w-full overflow-hidden bg-black/20">
                          <img
                            src={competition.poster_url}
                            alt={competition.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-44 items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                          <span className="text-5xl">
                            🏆
                          </span>
                        </div>
                      )}

                      <div className="p-5">
                        {/* TITLE */}
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="min-w-0 text-lg font-bold">
                            {competition.name}
                          </h3>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusClass(
                              competition.status
                            )}`}
                          >
                            {competition.status ||
                              "DRAFT"}
                          </span>
                        </div>

                        {/* EVENT */}
                        <p className="mt-2 text-sm font-medium text-indigo-300">
                          {competition.events?.name ||
                            "EventNest Event"}
                        </p>

                        {/* DESCRIPTION */}
                        {competition.description && (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                            {competition.description}
                          </p>
                        )}

                        {/* DETAILS */}
                        <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                          <div className="flex items-start justify-between gap-4 text-sm">
                            <span className="shrink-0 text-slate-500">
                              Date
                            </span>

                            <span className="text-right text-slate-200">
                              {formatDate(
                                competition.competition_date
                              )}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4 text-sm">
                            <span className="shrink-0 text-slate-500">
                              Time
                            </span>

                            <span className="text-right text-slate-200">
                              {formatTime(
                                competition.start_time
                              )}{" "}
                              -{" "}
                              {formatTime(
                                competition.end_time
                              )}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4 text-sm">
                            <span className="shrink-0 text-slate-500">
                              Venue
                            </span>

                            <span className="text-right text-slate-200">
                              {competition.venue ||
                                competition.events?.venue ||
                                "Not specified"}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4 text-sm">
                            <span className="shrink-0 text-slate-500">
                              Capacity
                            </span>

                            <span className="text-right text-slate-200">
                              {competition.capacity ||
                                "Not specified"}
                            </span>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <button
                            onClick={() =>
                              router.push(
                                `/competition-member/competitions/${competition.id}`
                              )
                            }
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                          >
                            Details
                          </button>

                          <button
                            onClick={() =>
                              router.push(
                                "/competition-member/registrations"
                              )
                            }
                            className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                          >
                            Registrations
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* MOBILE QR CTA */}
            <section className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-300">
                    Ready for check-in?
                  </p>

                  <h2 className="mt-1 text-lg font-bold">
                    Scan participant tickets
                  </h2>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
                    Use your phone camera to scan a participant's
                    EventNest QR ticket and record their
                    attendance.
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      "/competition-member/scan"
                    )
                  }
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 sm:w-auto"
                >
                  Open QR Scanner
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}