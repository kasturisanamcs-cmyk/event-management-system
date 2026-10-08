"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CompetitionMemberCompetitionsPage() {
  const supabase = createClient();

  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCompetitions() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      if (!session?.access_token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        "/api/competition-member/competitions",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Failed to load competitions."
        );
      }

      setCompetitions(
        Array.isArray(result?.competitions)
          ? result.competitions
          : []
      );
    } catch (err) {
      console.error(
        "Competition Member competitions error:",
        err
      );

      setError(
        err?.message || "Failed to load competitions."
      );

      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompetitions();
  }, []);

  const totalRegistrations = useMemo(
    () =>
      competitions.reduce(
        (total, competition) =>
          total +
          Number(competition.registrationCount || 0),
        0
      ),
    [competitions]
  );

  const pendingRegistrations = useMemo(
    () =>
      competitions.reduce(
        (total, competition) =>
          total +
          Number(competition.pendingCount || 0),
        0
      ),
    [competitions]
  );

  function formatDate(date) {
    if (!date) return "Date not specified";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(time) {
    if (!time) return "Time not specified";

    const parts = String(time).split(":");

    if (parts.length < 2) {
      return time;
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return time;
    }

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusClass(status) {
    const normalized = String(status || "")
      .trim()
      .toUpperCase();

    if (normalized === "PUBLISHED") {
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    }

    if (normalized === "DRAFT") {
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";
    }

    if (normalized === "CANCELLED") {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    return "border-slate-700 bg-slate-800/50 text-slate-300";
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              EventNest
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My Competitions
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Competitions assigned to you as a Competition Member.
            </p>
          </div>

          <button
            type="button"
            onClick={loadCompetitions}
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-[#0b1224] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              My Competitions
            </p>

            <p className="mt-3 text-3xl font-bold">
              {competitions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1224] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Registrations
            </p>

            <p className="mt-3 text-3xl font-bold">
              {totalRegistrations}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b1224] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Pending Registrations
            </p>

            <p className="mt-3 text-3xl font-bold text-amber-400">
              {pendingRegistrations}
            </p>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-[#0b1224] p-10 text-center">
            <p className="text-sm text-slate-400">
              Loading your competitions...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && competitions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0b1224] px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-2xl">
              🏆
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              No competitions assigned
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You have not been assigned to any competition yet.
              Once an organizer assigns you, the competition will
              appear here.
            </p>
          </div>
        )}

        {/* COMPETITIONS */}
        {!loading && competitions.length > 0 && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {competitions.map((competition) => (
              <div
                key={competition.id}
                className="rounded-2xl border border-slate-800 bg-[#0b1224] p-5 transition hover:border-slate-700 sm:p-6"
              >
                {/* TOP */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-bold">
                      {competition.name ||
                        "Unnamed Competition"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {competition.eventName ||
                        "EventNest Event"}
                    </p>
                  </div>

                  <span
                    className={`w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                      competition.status
                    )}`}
                  >
                    {competition.status || "UNKNOWN"}
                  </span>
                </div>

                {/* DETAILS */}
                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      Date
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {formatDate(
                        competition.competitionDate
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      Time
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {formatTime(
                        competition.startTime
                      )}
                      {competition.endTime
                        ? ` - ${formatTime(
                            competition.endTime
                          )}`
                        : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      Venue
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      {competition.venue ||
                        "Venue not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      Registration Fee
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      ₹
                      {Number(
                        competition.registrationFee || 0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* COUNTS */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-[#020617] p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      Registrations
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {Number(
                        competition.registrationCount || 0
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#020617] p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      Pending
                    </p>

                    <p className="mt-2 text-2xl font-bold text-amber-400">
                      {Number(
                        competition.pendingCount || 0
                      )}
                    </p>
                  </div>
                </div>

                {/* OPEN BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `/competition-member/competitions/${competition.id}`;
                  }}
                  className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
                >
                  Open Competition
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}