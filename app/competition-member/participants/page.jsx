"use client";

import { useEffect, useMemo, useState } from "react";

export default function CompetitionMemberParticipantsPage() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function loadParticipants() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/competition-member/registrations",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to load participants."
        );
      }

      setParticipants(result.registrations || []);
    } catch (error) {
      console.error("Load participants error:", error);

      setError(
        error.message || "Something went wrong while loading participants."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadParticipants();
  }, []);

  const competitions = useMemo(() => {
    return [
      ...new Set(
        participants
          .map((participant) => participant.competition_name)
          .filter(Boolean)
      ),
    ].sort();
  }, [participants]);

  const statuses = useMemo(() => {
    return [
      ...new Set(
        participants
          .map((participant) => participant.registration_status)
          .filter(Boolean)
      ),
    ].sort();
  }, [participants]);

  const filteredParticipants = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return participants.filter((participant) => {
      const matchesSearch =
        !searchValue ||
        [
          participant.participant_name,
          participant.participant_email,
          participant.college,
          participant.student_id,
          participant.registration_number,
          participant.competition_name,
          participant.team_name,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(searchValue)
          );

      const matchesCompetition =
        competitionFilter === "ALL" ||
        participant.competition_name === competitionFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        participant.registration_status === statusFilter;

      return (
        matchesSearch &&
        matchesCompetition &&
        matchesStatus
      );
    });
  }, [
    participants,
    search,
    competitionFilter,
    statusFilter,
  ]);

  function getStatusClass(status) {
    switch (status) {
      case "CONFIRMED":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

      case "APPROVED":
        return "border-blue-500/20 bg-blue-500/10 text-blue-400";

      case "PENDING":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

      case "REJECTED":
        return "border-red-500/20 bg-red-500/10 text-red-400";

      case "CANCELLED":
        return "border-slate-500/20 bg-slate-500/10 text-slate-400";

      default:
        return "border-slate-700 bg-slate-800 text-slate-300";
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Participants
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                View participants registered for your assigned
                competitions.
              </p>
            </div>

            <button
              type="button"
              onClick={loadParticipants}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Participants
            </p>

            <p className="mt-2 text-2xl font-bold">
              {participants.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Competitions
            </p>

            <p className="mt-2 text-2xl font-bold">
              {competitions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Showing
            </p>

            <p className="mt-2 text-2xl font-bold">
              {filteredParticipants.length}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="grid gap-3 md:grid-cols-3">

            {/* SEARCH */}
            <div className="md:col-span-1">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Name, email, college, registration..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-slate-500"
              />
            </div>

            {/* COMPETITION */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Competition
              </label>

              <select
                value={competitionFilter}
                onChange={(event) =>
                  setCompetitionFilter(event.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-slate-500"
              >
                <option value="ALL">
                  All Competitions
                </option>

                {competitions.map((competition) => (
                  <option
                    key={competition}
                    value={competition}
                  >
                    {competition}
                  </option>
                ))}
              </select>
            </div>

            {/* STATUS */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Registration Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-slate-500"
              >
                <option value="ALL">
                  All Statuses
                </option>

                {statuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-sm font-medium text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadParticipants}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-white" />

            <p className="mt-4 text-sm text-slate-400">
              Loading participants...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          participants.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
              <div className="text-4xl">👥</div>

              <h2 className="mt-4 text-lg font-semibold">
                No Participants Yet
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                No participants have registered for your
                assigned competitions yet.
              </p>
            </div>
          )}

        {/* NO FILTER RESULTS */}
        {!loading &&
          !error &&
          participants.length > 0 &&
          filteredParticipants.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
              <h2 className="text-lg font-semibold">
                No Matching Participants
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Try changing your search or filters.
              </p>
            </div>
          )}

        {/* DESKTOP TABLE */}
        {!loading &&
          !error &&
          filteredParticipants.length > 0 && (
            <>
              <div className="hidden overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left">
                    <thead className="border-b border-slate-800 bg-slate-950/70">
                      <tr>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Participant
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          College
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Competition
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Registration No.
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Participation
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Payment
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800">
                      {filteredParticipants.map(
                        (participant) => (
                          <tr
                            key={participant.registration_id}
                            className="transition hover:bg-white/[0.02]"
                          >
                            {/* PARTICIPANT */}
                            <td className="px-5 py-5">
                              <div>
                                <p className="font-semibold text-white">
                                  {participant.participant_name ||
                                    "—"}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {participant.participant_email ||
                                    "—"}
                                </p>

                                {participant.phone && (
                                  <p className="mt-1 text-xs text-slate-600">
                                    {participant.phone}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* COLLEGE */}
                            <td className="px-5 py-5">
                              <div>
                                <p className="text-sm text-slate-200">
                                  {participant.college || "—"}
                                </p>

                                {participant.student_id && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    ID:{" "}
                                    {participant.student_id}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* COMPETITION */}
                            <td className="px-5 py-5">
                              <p className="text-sm font-medium text-slate-200">
                                {participant.competition_name ||
                                  "—"}
                              </p>
                            </td>

                            {/* REGISTRATION */}
                            <td className="px-5 py-5">
                              <p className="font-mono text-xs text-slate-300">
                                {participant.registration_number ||
                                  "—"}
                              </p>
                            </td>

                            {/* PARTICIPATION */}
                            <td className="px-5 py-5">
                              <p className="text-sm text-slate-300">
                                {participant.participation_type ||
                                  "—"}
                              </p>

                              {participant.team_name && (
                                <p className="mt-1 text-xs text-slate-500">
                                  Team:{" "}
                                  {participant.team_name}
                                </p>
                              )}
                            </td>

                            {/* PAYMENT */}
                            <td className="px-5 py-5">
                              <p className="text-sm text-slate-300">
                                {participant.participation_mode ||
                                  "—"}
                              </p>

                              {participant.registration_fee !=
                                null && (
                                <p className="mt-1 text-xs text-slate-500">
                                  ₹
                                  {
                                    participant.registration_fee
                                  }
                                </p>
                              )}
                            </td>

                            {/* STATUS */}
                            <td className="px-5 py-5">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                                  participant.registration_status
                                )}`}
                              >
                                {participant.registration_status ||
                                  "—"}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE / TABLET CARDS */}
              <div className="grid gap-4 lg:hidden">
                {filteredParticipants.map(
                  (participant) => (
                    <div
                      key={participant.registration_id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                    >
                      {/* TOP */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-bold text-white">
                            {participant.participant_name ||
                              "—"}
                          </h2>

                          <p className="mt-1 break-all text-xs text-slate-500">
                            {participant.participant_email ||
                              "—"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                            participant.registration_status
                          )}`}
                        >
                          {participant.registration_status ||
                            "—"}
                        </span>
                      </div>

                      {/* DETAILS */}
                      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <MobileDetail
                          label="College"
                          value={participant.college}
                        />

                        <MobileDetail
                          label="Competition"
                          value={
                            participant.competition_name
                          }
                        />

                        <MobileDetail
                          label="Registration No."
                          value={
                            participant.registration_number
                          }
                        />

                        <MobileDetail
                          label="Student ID"
                          value={participant.student_id}
                        />

                        <MobileDetail
                          label="Phone"
                          value={participant.phone}
                        />

                        <MobileDetail
                          label="Participation"
                          value={
                            participant.participation_type
                          }
                        />

                        <MobileDetail
                          label="Team"
                          value={
                            participant.team_name ||
                            "Individual"
                          }
                        />

                        <MobileDetail
                          label="Payment Mode"
                          value={
                            participant.participation_mode
                          }
                        />
                      </div>

                      <div className="mt-5 border-t border-slate-800 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Registration Fee
                          </span>

                          <span className="text-sm font-semibold text-slate-200">
                            ₹
                            {participant.registration_fee ??
                              0}
                          </span>
                        </div>
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

function MobileDetail({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-slate-300">
        {value || "—"}
      </p>
    </div>
  );
}