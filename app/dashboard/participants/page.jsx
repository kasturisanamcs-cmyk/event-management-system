"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CompetitionMembersPage() {
  const supabase = createClient();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [competitionFilter, setCompetitionFilter] =
    useState("ALL");

  async function loadMembers() {
    try {
      setLoading(true);
      setError("");

      // Get current browser session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      // Send access token to API
      const response = await fetch(
        "/api/organizer/competition-members",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to load Competition Members."
        );
      }

      setMembers(result.members || []);
    } catch (error) {
      console.error(
        "Load Competition Members error:",
        error
      );

      setError(
        error.message ||
          "Failed to load Competition Members."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const competitions = useMemo(() => {
    return [
      ...new Set(
        members
          .map((member) => member.competition)
          .filter(Boolean)
      ),
    ].sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !searchValue ||
        [
          member.name,
          member.competition,
          member.role,
          member.status,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(searchValue)
          );

      const matchesCompetition =
        competitionFilter === "ALL" ||
        member.competition ===
          competitionFilter;

      return (
        matchesSearch &&
        matchesCompetition
      );
    });
  }, [
    members,
    search,
    competitionFilter,
  ]);

  return (
    <div className="min-h-screen bg-[#020617] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                EventNest
              </p>

              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                Competition Members
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                View Competition Members assigned to
                your competitions.
              </p>
            </div>

            <button
              type="button"
              onClick={loadMembers}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50 sm:w-auto"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Members
            </p>

            <p className="mt-2 text-2xl font-bold">
              {members.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Competitions
            </p>

            <p className="mt-2 text-2xl font-bold">
              {competitions.length}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="grid gap-3 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search member or competition..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Competition
              </label>

              <select
                value={competitionFilter}
                onChange={(event) =>
                  setCompetitionFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-slate-500"
              >
                <option value="ALL">
                  All Competitions
                </option>

                {competitions.map(
                  (competition) => (
                    <option
                      key={competition}
                      value={competition}
                    >
                      {competition}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-sm font-medium text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadMembers}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Try Again
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-white" />

            <p className="mt-4 text-sm text-slate-400">
              Loading Competition Members...
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          members.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
              <div className="text-4xl">
                👥
              </div>

              <h2 className="mt-4 text-lg font-semibold">
                No Competition Members
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                No Competition Members are currently
                assigned to your competitions.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          members.length > 0 &&
          filteredMembers.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
              <h2 className="text-lg font-semibold">
                No Matching Members
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Try changing your search or competition
                filter.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          filteredMembers.length > 0 && (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">

                    <thead className="border-b border-slate-800 bg-slate-950/70">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Name
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Competition
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Role
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800">
                      {filteredMembers.map(
                        (member) => (
                          <tr
                            key={member.id}
                            className="transition hover:bg-white/[0.02]"
                          >
                            <td className="px-6 py-5">
                              <p className="font-semibold text-white">
                                {member.name}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm text-slate-300">
                                {member.competition}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <span className="text-sm text-slate-300">
                                Competition Member
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                                Active
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                  </table>
                </div>
              </div>

              <div className="grid gap-4 lg:hidden">
                {filteredMembers.map(
                  (member) => (
                    <div
                      key={member.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <h2 className="text-base font-bold text-white">
                            {member.name}
                          </h2>

                          <p className="mt-1 text-sm text-slate-400">
                            {member.competition}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
                          Active
                        </span>

                      </div>

                      <div className="mt-5 border-t border-slate-800 pt-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                          Role
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                          Competition Member
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}

      </div>
    </div>
  );
}