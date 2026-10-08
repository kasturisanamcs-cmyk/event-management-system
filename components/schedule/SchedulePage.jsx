"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SchedulePage({ title = "Schedule" }) {
  const supabase = createClient();

  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    loadSchedule();
  }, []);

  async function loadSchedule(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      // ==========================================
      // 1. GET CURRENT LOGGED-IN USER
      // ==========================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        window.location.href = "/login";
        return;
      }

      // Diagnostic information
      console.log("=================================");
      console.log("SCHEDULE USER ID:", user.id);
      console.log("SCHEDULE USER EMAIL:", user.email);
      console.log("=================================");

      // ==========================================
      // 2. GET PROFILE ROLE
      // ==========================================

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("SCHEDULE PROFILE ERROR:", profileError);
      }

      console.log("SCHEDULE PROFILE:", profile);
      console.log(
        "SCHEDULE ROLE:",
        profile?.role
      );
      console.log(
        "NORMALIZED ROLE:",
        profile?.role?.trim().toUpperCase()
      );

      // ==========================================
      // 3. CALL SCHEDULE RPC
      // ==========================================

      const { data, error: scheduleError } =
        await supabase.rpc("get_eventnest_schedule");

      if (scheduleError) {
        console.error(
          "SCHEDULE RPC ERROR:",
          scheduleError
        );

        throw scheduleError;
      }

      console.log(
        "SCHEDULE RPC DATA:",
        data
      );

      setSchedule(data || []);
    } catch (err) {
      console.error(
        "SCHEDULE LOADING ERROR:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while loading the schedule."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ==========================================
  // FILTER SCHEDULE
  // ==========================================

  const filteredSchedule = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    const now = new Date();

    return schedule.filter((item) => {
      const sessionDate = new Date(
        `${item.session_date}T${
          item.start_time || "00:00:00"
        }`
      );

      const isPast = sessionDate < now;

      if (filter === "UPCOMING" && isPast) {
        return false;
      }

      if (filter === "PAST" && !isPast) {
        return false;
      }

      if (!searchText) {
        return true;
      }

      return [
        item.event_name,
        item.competition_name,
        item.session_name,
        item.venue,
      ]
        .filter(Boolean)
        .some((value) =>
          value
            .toString()
            .toLowerCase()
            .includes(searchText)
        );
    });
  }, [schedule, search, filter]);

  // ==========================================
  // SUMMARY
  // ==========================================

  const upcomingCount = schedule.filter((item) => {
    const sessionDate = new Date(
      `${item.session_date}T${
        item.start_time || "00:00:00"
      }`
    );

    return sessionDate >= new Date();
  }).length;

  const pastCount =
    schedule.length - upcomingCount;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            EventNest
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            View your event and competition schedule,
            session timings, venues, and check-in
            information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadSchedule(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* SUMMARY */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total Sessions"
            value={schedule.length}
          />

          <SummaryCard
            label="Upcoming"
            value={upcomingCount}
          />

          <SummaryCard
            label="Completed"
            value={pastCount}
          />
        </div>
      )}

      {/* SEARCH / FILTER */}
      {!loading && !error && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                Search Schedule
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search event, competition, session or venue..."
                className="w-full rounded-xl border border-white/10 bg-[#050b18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
              />
            </div>

            <div className="w-full lg:w-52">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                Show
              </label>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-[#050b18] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
              >
                <option value="ALL">
                  All Sessions
                </option>

                <option value="UPCOMING">
                  Upcoming
                </option>

                <option value="PAST">
                  Completed
                </option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading schedule...
          </p>
        </div>
      ) : error ? null : filteredSchedule.length ===
        0 ? (
        /* EMPTY */
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center sm:p-14">
          <h2 className="text-xl font-semibold text-white">
            No schedule found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {search || filter !== "ALL"
              ? "No sessions match your current search or filter."
              : "There are no schedule sessions available for your account yet."}
          </p>

          {(search || filter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilter("ALL");
              }}
              className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        /* SCHEDULE LIST */
        <div className="space-y-4">
          {filteredSchedule.map((item) => (
            <ScheduleCard
              key={item.session_id}
              item={item}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ==========================================
   SUMMARY CARD
========================================== */

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

/* ==========================================
   SCHEDULE CARD
========================================== */

function ScheduleCard({ item }) {
  const sessionDate = new Date(
    `${item.session_date}T${
      item.start_time || "00:00:00"
    }`
  );

  const isPast = sessionDate < new Date();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white/15 hover:bg-white/[0.05]">
      {/* TOP */}
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              {item.event_name || "Event"}
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              {item.competition_name ||
                "Competition"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {item.session_name || "Session"}
            </p>
          </div>

          <span
            className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
              isPast
                ? "border-white/10 bg-white/[0.04] text-slate-500"
                : "border-green-500/20 bg-green-500/10 text-green-400"
            }`}
          >
            {isPast
              ? "Completed"
              : "Upcoming"}
          </span>
        </div>
      </div>

      {/* DETAILS */}
      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
        <Detail
          label="Date"
          value={formatDate(
            item.session_date
          )}
        />

        <Detail
          label="Time"
          value={`${formatTime(
            item.start_time
          )} – ${formatTime(
            item.end_time
          )}`}
        />

        <Detail
          label="Venue"
          value={
            item.venue || "Not specified"
          }
        />

        <Detail
          label="Check-in"
          value={formatCheckIn(
            item.check_in_start,
            item.check_in_end
          )}
        />
      </div>

      {/* FOOTER */}
      <div className="flex flex-col gap-2 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-slate-500">
          Session date:{" "}
          {formatDate(item.session_date)}
        </p>

        <p
          className={`text-xs font-medium ${
            item.late_entry_allowed
              ? "text-green-400"
              : "text-slate-500"
          }`}
        >
          {item.late_entry_allowed
            ? "Late entry allowed"
            : "Late entry not allowed"}
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   DETAIL
========================================== */

function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#050b18] p-4">
      <p className="text-xs uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold leading-5 text-white">
        {value}
      </p>
    </div>
  );
}

/* ==========================================
   DATE
========================================== */

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not specified";
  }

  const date = new Date(
    `${dateValue}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* ==========================================
   TIME
========================================== */

function formatTime(timeValue) {
  if (!timeValue) {
    return "Not specified";
  }

  const parts = timeValue.split(":");

  if (parts.length < 2) {
    return timeValue;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return timeValue;
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
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

/* ==========================================
   CHECK-IN
========================================== */

function formatCheckIn(start, end) {
  if (!start && !end) {
    return "Not specified";
  }

  if (start && end) {
    return `${formatTime(
      start
    )} – ${formatTime(end)}`;
  }

  if (start) {
    return `From ${formatTime(start)}`;
  }

  return `Until ${formatTime(end)}`;
}