"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ParticipantsPage() {
  const supabase = createClient();

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadParticipants() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.access_token) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      const response = await fetch(
        "/api/organizer/participants",
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
          result.error || "Failed to load participants."
        );
      }

      setParticipants(result.participants || []);
    } catch (error) {
      console.error("Load Participants error:", error);
      setError(
        error?.message || "Failed to load participants."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadParticipants();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              EventNest
            </p>

            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              Participants
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              View participants registered for your competitions.
            </p>
          </div>

          <button
            type="button"
            onClick={loadParticipants}
            disabled={loading}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Participants
            </p>

            <p className="mt-2 text-2xl font-bold">
              {participants.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Confirmed
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {
                participants.filter(
                  (p) =>
                    String(p.status).toUpperCase() ===
                    "CONFIRMED"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-400">
              {
                participants.filter(
                  (p) =>
                    String(p.status).toUpperCase() ===
                    "PENDING"
                ).length
              }
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-white" />

            <p className="mt-4 text-sm text-slate-400">
              Loading Participants...
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          participants.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center">
              <h2 className="text-lg font-semibold">
                No Participants
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                No participants have registered for your
                competitions yet.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          participants.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-800 bg-slate-950/70">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Participant
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        College
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Competition
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Registration
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {participants.map((participant) => (
                      <tr
                        key={participant.id}
                        className="hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-white">
                            {participant.name || "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {participant.email || "—"}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-300">
                          {participant.college || "—"}
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-200">
                            {participant.competition || "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {participant.event || ""}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-xs text-slate-300">
                          {participant.registration_number || "—"}
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                            {participant.status || "UNKNOWN"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

      </div>
    </div>
  );
}