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
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      // --------------------------------------------
      // 1. Get logged-in user
      // --------------------------------------------

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // --------------------------------------------
      // 2. Get competitions assigned to this member
      // --------------------------------------------

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

      const assignedCompetitions =
        (memberships || [])
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

  function formatDate(date) {
    if (!date) return "Not scheduled";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
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

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
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

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* -------------------------------------------- */}
      {/* Header */}
      {/* -------------------------------------------- */}

      <header className="border-b border-white/10 bg-[#0b1220]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-indigo-400">
              EventNest
            </p>

            <h1 className="mt-1 text-xl font-bold sm:text-2xl">
              Competition Member Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage the competitions you have been assigned to.
            </p>
          </div>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </header>

      {/* -------------------------------------------- */}
      {/* Main */}
      {/* -------------------------------------------- */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome */}
        <section className="mb-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 p-5">
          <p className="text-sm text-slate-400">
            Welcome
          </p>

          <h2 className="mt-1 text-xl font-bold">
            {user?.user_metadata?.full_name ||
              user?.email ||
              "Competition Member"}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Here you can see the competitions assigned
            to you and access their details.
          </p>
        </section>

        {/* -------------------------------------------- */}
        {/* Error */}
        {/* -------------------------------------------- */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* -------------------------------------------- */}
        {/* Loading */}
        {/* -------------------------------------------- */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />

              <p className="mt-3 text-sm text-slate-400">
                Loading your competitions...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ---------------------------------------- */}
            {/* Stats */}
            {/* ---------------------------------------- */}

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
                <p className="text-sm text-slate-400">
                  Assigned Competitions
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {competitions.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
                <p className="text-sm text-slate-400">
                  Member Status
                </p>

                <p className="mt-2 text-lg font-semibold text-emerald-300">
                  Active
                </p>
              </div>
            </div>

            {/* ---------------------------------------- */}
            {/* Competitions */}
            {/* ---------------------------------------- */}

            <section>
              <div className="mb-4">
                <h2 className="text-xl font-bold">
                  My Competitions
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Competitions where you are a team member.
                </p>
              </div>

              {competitions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b1220] px-6 py-12 text-center">
                  <p className="text-lg font-semibold">
                    No competitions assigned
                  </p>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                    You have not been assigned to any
                    competition yet. Once an organizer
                    adds you, the competition will appear
                    here automatically.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {competitions.map((competition) => (
                    <article
                      key={competition.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] transition hover:border-indigo-500/30"
                    >
                      {/* Poster */}
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
                          <span className="text-4xl">
                            🏆
                          </span>
                        </div>
                      )}

                      <div className="p-5">
                        {/* Name + status */}
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-bold">
                            {competition.name}
                          </h3>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                              competition.status
                            )}`}
                          >
                            {competition.status ||
                              "DRAFT"}
                          </span>
                        </div>

                        {/* Event */}
                        <p className="mt-2 text-sm text-indigo-300">
                          {competition.events?.name ||
                            "EventNest Event"}
                        </p>

                        {/* Description */}
                        {competition.description && (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                            {competition.description}
                          </p>
                        )}

                        {/* Details */}
                        <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-slate-500">
                              Date
                            </span>

                            <span className="text-right text-slate-200">
                              {formatDate(
                                competition.competition_date
                              )}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-slate-500">
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

                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-slate-500">
                              Venue
                            </span>

                            <span className="text-right text-slate-200">
                              {competition.venue ||
                                competition.events?.venue ||
                                "Not specified"}
                            </span>
                          </div>
                        </div>

                        {/* Action */}
                        <button
                          onClick={() =>
                            router.push(
                              `/competition-member/competitions/${competition.id}`
                            )
                          }
                          className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                        >
                          View Competition
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}