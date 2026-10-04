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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  function navigate(path) {
    setMobileMenuOpen(false);
    router.push(path);
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
    <div className="min-h-screen overflow-x-hidden bg-[#020617] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* BRAND */}
          <button
            onClick={() => navigate("/competition-member/dashboard")}
            className="min-w-0 text-left"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-400 sm:text-xs">
              EventNest
            </p>

            <h1 className="mt-0.5 truncate text-base font-bold sm:text-xl">
              Competition Member
            </h1>
          </button>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-3 sm:flex">
            <div className="hidden text-right md:block">
              <p className="max-w-[180px] truncate text-sm font-medium text-white">
                {memberName}
              </p>

              <p className="text-xs text-slate-500">
                Competition Member
              </p>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((previous) => !previous)
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl text-slate-200 transition hover:bg-white/10 sm:hidden"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#0b1220] px-4 py-4 sm:hidden">
            <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="truncate text-sm font-semibold">
                {memberName}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Competition Member
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MobileMenuButton
                icon="🏠"
                label="Dashboard"
                onClick={() =>
                  navigate("/competition-member/dashboard")
                }
              />

              <MobileMenuButton
                icon="📋"
                label="Registrations"
                onClick={() =>
                  navigate("/competition-member/registrations")
                }
              />

              <MobileMenuButton
                icon="₹"
                label="Payments"
                onClick={() =>
                  navigate("/competition-member/payments")
                }
              />

              <MobileMenuButton
                icon="📷"
                label="QR Check-In"
                onClick={() =>
                  navigate("/competition-member/scan")
                }
              />
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/15 disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "🚪 Logout"}
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* WELCOME */}
        <section className="overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent p-5 sm:p-7">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300 sm:text-sm">
              Welcome back
            </p>

            <h2 className="mt-2 break-words text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {memberName}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Manage your assigned competitions, review
              registrations, verify payments, and handle
              participant check-ins from one place.
            </p>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <p className="break-words text-sm leading-6 text-red-300">
              {error}
            </p>

            <button
              onClick={loadDashboard}
              className="mt-3 w-full rounded-lg bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/20 sm:mt-0 sm:w-auto sm:shrink-0"
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

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <QuickAction
                  icon="📋"
                  title="Registrations"
                  description="Review participants"
                  onClick={() =>
                    navigate("/competition-member/registrations")
                  }
                  hover="hover:border-indigo-500/40"
                />

                <QuickAction
                  icon="₹"
                  title="Payments"
                  description="Verify offline payments"
                  onClick={() =>
                    navigate("/competition-member/payments")
                  }
                  hover="hover:border-emerald-500/40"
                  iconBackground="bg-emerald-500/10"
                />

                <QuickAction
                  icon="📷"
                  title="QR Check-In"
                  description="Scan participant tickets"
                  onClick={() =>
                    navigate("/competition-member/scan")
                  }
                  hover="hover:border-indigo-400/50"
                  className="border-indigo-500/30 bg-indigo-500/10"
                  iconBackground="bg-indigo-500/20"
                />

                <QuickAction
                  icon="✓"
                  title="Attendance"
                  description="View check-ins"
                  onClick={() =>
                    navigate("/competition-member/attendance")
                  }
                  hover="hover:border-purple-500/40"
                  iconBackground="bg-purple-500/10"
                />
              </div>
            </section>

            {/* STATS */}
            <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              <StatCard
                label="Assigned Competitions"
                value={competitions.length}
                description="Your competitions"
              />

              <StatCard
                label="Member Status"
                value="Active"
                description="Access enabled"
                valueClass="text-emerald-300"
              />

              <div className="col-span-2 rounded-2xl border border-white/10 bg-[#0b1220] p-4 sm:col-span-1 sm:p-5">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Next Competition
                </p>

                <p className="mt-2 break-words text-base font-bold leading-6 sm:text-lg">
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
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                      Next Up
                    </p>

                    <h2 className="mt-1 break-words text-xl font-bold sm:text-2xl">
                      {upcomingCompetition.name}
                    </h2>

                    <p className="mt-1 break-words text-sm text-slate-400">
                      {upcomingCompetition.events?.name ||
                        "EventNest Event"}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-400 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-2">
                      <span className="break-words">
                        📅{" "}
                        {formatDate(
                          upcomingCompetition.competition_date
                        )}
                      </span>

                      <span className="break-words">
                        🕐{" "}
                        {formatTime(
                          upcomingCompetition.start_time
                        )}
                      </span>

                      <span className="break-words">
                        📍{" "}
                        {upcomingCompetition.venue ||
                          upcomingCompetition.events?.venue ||
                          "Venue not specified"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/competition-member/competitions/${upcomingCompetition.id}`
                      )
                    }
                    className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500 sm:w-auto sm:min-w-[180px]"
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
                  Competitions where you are assigned as a member.
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
                    You have not been assigned to any competition
                    yet. Once an organizer adds you, the competition
                    will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {competitions.map((competition) => (
                    <article
                      key={competition.id}
                      className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] transition hover:border-indigo-500/30"
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

                      <div className="p-4 sm:p-5">
                        {/* TITLE */}
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <h3 className="min-w-0 break-words text-lg font-bold leading-6">
                            {competition.name}
                          </h3>

                          <span
                            className={`self-start rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusClass(
                              competition.status
                            )}`}
                          >
                            {competition.status || "DRAFT"}
                          </span>
                        </div>

                        {/* EVENT */}
                        <p className="mt-2 break-words text-sm font-medium text-indigo-300">
                          {competition.events?.name ||
                            "EventNest Event"}
                        </p>

                        {/* DESCRIPTION */}
                        {competition.description && (
                          <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-slate-400">
                            {competition.description}
                          </p>
                        )}

                        {/* DETAILS */}
                        <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                          <CompetitionDetail
                            label="Date"
                            value={formatDate(
                              competition.competition_date
                            )}
                          />

                          <CompetitionDetail
                            label="Time"
                            value={`${formatTime(
                              competition.start_time
                            )} - ${formatTime(
                              competition.end_time
                            )}`}
                          />

                          <CompetitionDetail
                            label="Venue"
                            value={
                              competition.venue ||
                              competition.events?.venue ||
                              "Not specified"
                            }
                          />

                          <CompetitionDetail
                            label="Capacity"
                            value={
                              competition.capacity ||
                              "Not specified"
                            }
                          />
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/competition-member/competitions/${competition.id}`
                              )
                            }
                            className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                          >
                            Details
                          </button>

                          <button
                            onClick={() =>
                              navigate(
                                "/competition-member/registrations"
                              )
                            }
                            className="min-h-11 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
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

            {/* QR CTA */}
            <section className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-indigo-300">
                    Ready for check-in?
                  </p>

                  <h2 className="mt-1 text-lg font-bold sm:text-xl">
                    Scan participant tickets
                  </h2>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
                    Use your phone camera to scan a participant's
                    EventNest QR ticket and record their attendance.
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate("/competition-member/scan")
                  }
                  className="w-full min-h-12 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 sm:w-auto sm:min-w-[190px]"
                >
                  📷 Open QR Scanner
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

/* ---------------------------------------
   QUICK ACTION
---------------------------------------- */

function QuickAction({
  icon,
  title,
  description,
  onClick,
  hover = "",
  className = "",
  iconBackground = "bg-indigo-500/10",
}) {
  return (
    <button
      onClick={onClick}
      className={`group min-w-0 rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-left transition sm:p-4 ${hover} ${className}`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg sm:h-11 sm:w-11 sm:text-xl ${iconBackground}`}
      >
        {icon}
      </div>

      <p className="mt-3 break-words text-sm font-semibold leading-5">
        {title}
      </p>

      <p className="mt-1 hidden text-xs leading-5 text-slate-500 sm:block">
        {description}
      </p>
    </button>
  );
}

/* ---------------------------------------
   STAT CARD
---------------------------------------- */

function StatCard({
  label,
  value,
  description,
  valueClass = "",
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0b1220] p-4 sm:p-5">
      <p className="text-xs font-medium leading-5 text-slate-500 sm:text-sm">
        {label}
      </p>

      <p
        className={`mt-2 break-words text-2xl font-bold sm:text-3xl ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {description}
      </p>
    </div>
  );
}

/* ---------------------------------------
   COMPETITION DETAIL
---------------------------------------- */

function CompetitionDetail({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-slate-500">
        {label}
      </span>

      <span className="min-w-0 break-words text-right text-slate-200">
        {value}
      </span>
    </div>
  );
}

/* ---------------------------------------
   MOBILE MENU BUTTON
---------------------------------------- */

function MobileMenuButton({
  icon,
  label,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-white/10"
    >
      <span>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}