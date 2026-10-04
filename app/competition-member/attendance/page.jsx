"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function CompetitionMemberAttendancePage() {
  const supabase = createClient();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadAttendance(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Authentication required.");
      }

      const { data, error: attendanceError } =
        await supabase
          .from("attendance")
          .select(`
            id,
            checked_in_at,
            status,
            tickets (
              id,
              ticket_number,
              registrations (
                id,
                registration_number,
                participant_name,
                participant_email,
                college,
                competition_id,
                competitions (
                  id,
                  name
                )
              )
            )
          `)
          .order("checked_in_at", {
            ascending: false,
          });

      if (attendanceError) {
        throw new Error(attendanceError.message);
      }

      const formatted =
        (data || [])
          .map((record) => {
            const ticket = record.tickets;
            const registration =
              ticket?.registrations;
            const competition =
              registration?.competitions;

            return {
              id: record.id,
              checkedInAt: record.checked_in_at,
              status: record.status,

              ticketNumber:
                ticket?.ticket_number || "—",

              registrationNumber:
                registration?.registration_number ||
                "—",

              participantName:
                registration?.participant_name ||
                "—",

              participantEmail:
                registration?.participant_email ||
                "—",

              college:
                registration?.college || "—",

              competitionName:
                competition?.name || "—",
            };
          })
          .filter(
            (item) =>
              item.participantName !== "—" ||
              item.registrationNumber !== "—"
          );

      setAttendance(formatted);
    } catch (error) {
      console.error(
        "Load attendance error:",
        error
      );

      setError(
        error.message ||
          "Failed to load attendance records."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAttendance();
  }, []);

  const filteredAttendance = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return attendance;
    }

    return attendance.filter((item) =>
      [
        item.participantName,
        item.participantEmail,
        item.college,
        item.registrationNumber,
        item.ticketNumber,
        item.competitionName,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [attendance, search]);

  const totalCheckedIn =
    attendance.filter(
      (item) =>
        item.status === "CHECKED_IN"
    ).length;

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Competition Member
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Attendance
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              View participants who have successfully
              checked in through the EventNest QR system.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAttendance(true)}
            disabled={refreshing}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={refreshing ? "animate-spin" : ""}>
              ↻
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* SUMMARY CARDS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-500">
              Total Check-ins
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {totalCheckedIn}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Successfully recorded attendance
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-500">
              Records Found
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {filteredAttendance.length}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Matching current search
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 sm:col-span-2 lg:col-span-1">
            <p className="text-sm text-emerald-400">
              QR Check-In
            </p>

            <p className="mt-2 text-xl font-bold text-white">
              Active
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Attendance is recorded automatically
              after successful QR verification.
            </p>
          </div>
        </div>

        {/* SEARCH */}

        <div className="mb-5">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search participant, registration, ticket, college or competition..."
              className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-white/[0.05]"
            />
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />

            <p className="mt-4 text-sm text-slate-400">
              Loading attendance...
            </p>
          </div>
        ) : filteredAttendance.length === 0 ? (
          /* EMPTY */

          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-2xl">
              ✓
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              {search
                ? "No matching attendance"
                : "No attendance recorded yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? "Try a different search term."
                : "Successful participant QR check-ins will appear here automatically."}
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE CARDS */}

            <div className="space-y-4 md:hidden">
              {filteredAttendance.map(
                (item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-white">
                          {item.participantName}
                        </h2>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.participantEmail}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                        Checked In
                      </span>
                    </div>

                    <div className="mt-5 space-y-3 border-t border-white/10 pt-4">

                      <AttendanceDetail
                        label="Competition"
                        value={item.competitionName}
                      />

                      <AttendanceDetail
                        label="Registration"
                        value={
                          item.registrationNumber
                        }
                      />

                      <AttendanceDetail
                        label="Ticket"
                        value={
                          item.ticketNumber
                        }
                      />

                      <AttendanceDetail
                        label="College"
                        value={item.college}
                      />

                      <AttendanceDetail
                        label="Checked In"
                        value={formatDate(
                          item.checkedInAt
                        )}
                      />
                    </div>
                  </article>
                )
              )}
            </div>

            {/* DESKTOP TABLE */}

            <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-left">
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Participant
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Competition
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Registration
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Ticket
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        College
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Checked In
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAttendance.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-white">
                              {
                                item.participantName
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                item.participantEmail
                              }
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            {
                              item.competitionName
                            }
                          </td>

                          <td className="px-5 py-4 font-mono text-xs text-slate-400">
                            {
                              item.registrationNumber
                            }
                          </td>

                          <td className="px-5 py-4 font-mono text-xs text-slate-400">
                            {item.ticketNumber}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {item.college}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            {formatDate(
                              item.checkedInAt
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                              Checked In
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function AttendanceDetail({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-200">
        {value || "—"}
      </span>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}