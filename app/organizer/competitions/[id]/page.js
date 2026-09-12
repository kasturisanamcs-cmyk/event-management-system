"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/client";

export default function ManageCompetitionPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const competitionId = params?.id;

  const [competition, setCompetition] = useState(null);
  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!competitionId) return;

    loadCompetition();
  }, [competitionId]);

  async function loadCompetition() {
    setLoading(true);
    setError("");
    setSessions([]);

    try {
      // ---------------------------------------------------------
      // 1. Get logged-in user
      // ---------------------------------------------------------

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        router.push("/login");
        return;
      }

      const user = session.user;

      setCurrentUser(user);

      // ---------------------------------------------------------
      // 2. Load competition
      // ---------------------------------------------------------

      const {
        data: competitionData,
        error: competitionError,
      } = await supabase
        .from("competitions")
        .select(`
          id,
          event_id,
          organizer_id,
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
          created_at,
          events (
            id,
            name,
            description,
            start_date,
            end_date,
            registration_deadline,
            venue,
            status
          )
        `)
        .eq("id", competitionId)
        .single();

      if (competitionError) {
        throw competitionError;
      }

      if (!competitionData) {
        setError("Competition not found.");
        return;
      }

      setCompetition(competitionData);
      setEvent(competitionData.events || null);

      // ---------------------------------------------------------
      // 3. Load competition sessions
      // ---------------------------------------------------------

      const {
        data: sessionData,
        error: competitionSessionsError,
      } = await supabase
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
        .order("session_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (competitionSessionsError) {
        throw competitionSessionsError;
      }

      setSessions(sessionData || []);
    } catch (err) {
      console.error("Error loading competition:", err);

      setError(
        err?.message ||
          "Something went wrong while loading the competition."
      );
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // Delete competition
  // ---------------------------------------------------------

  async function handleDeleteCompetition() {
    if (!competition || !isCreator) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${competition.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError("");

      const { error: deleteError } = await supabase
        .from("competitions")
        .delete()
        .eq("id", competition.id)
        .eq("organizer_id", currentUser.id);

      if (deleteError) {
        throw deleteError;
      }

      router.push("/organizer/competitions");
    } catch (err) {
      console.error("Error deleting competition:", err);

      setError(
        err?.message ||
          "Something went wrong while deleting the competition."
      );

      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // Formatting helpers
  // ---------------------------------------------------------

  function formatDate(date) {
    if (!date) return "Date not available";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
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

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatFee(fee) {
    if (fee === null || fee === undefined) {
      return "Free";
    }

    const amount = Number(fee);

    if (amount === 0) {
      return "Free";
    }

    return `₹${amount.toLocaleString("en-IN")}`;
  }

  function getStatusClasses(status) {
    switch (status) {
      case "PUBLISHED":
        return "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

      case "ONGOING":
        return "border border-indigo-400/20 bg-indigo-400/10 text-indigo-300";

      case "COMPLETED":
        return "border border-purple-400/20 bg-purple-400/10 text-purple-300";

      case "CANCELLED":
        return "border border-red-400/20 bg-red-400/10 text-red-300";

      case "DRAFT":
      default:
        return "border border-amber-400/20 bg-amber-400/10 text-amber-300";
    }
  }

  // ---------------------------------------------------------
  // Creator check
  // ---------------------------------------------------------

  const isCreator =
    currentUser?.id &&
    competition?.organizer_id &&
    currentUser.id === competition.organizer_id;

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (loading) {
    return (
      <DashboardLayout
        title="Manage Competition"
        description="Loading competition details..."
      >
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">

            <div className="h-64 rounded-2xl border border-white/10 bg-[#0B1220]" />

            <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-6">
              <div className="h-6 w-1/3 rounded bg-white/[0.06]" />

              <div className="mt-4 h-4 w-2/3 rounded bg-white/[0.06]" />

              <div className="mt-3 h-4 w-1/2 rounded bg-white/[0.06]" />
            </div>

          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ---------------------------------------------------------
  // Error
  // ---------------------------------------------------------

  if (error || !competition) {
    return (
      <DashboardLayout
        title="Manage Competition"
        description="Competition details"
      >
        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-8 text-center">

            <div className="text-5xl">
              ⚠️
            </div>

            <h2 className="mt-4 text-xl font-bold text-white">
              Unable to load competition
            </h2>

            <p className="mt-2 text-sm text-red-300">
              {error || "Competition not found."}
            </p>

            <button
              onClick={() =>
                router.push("/organizer/competitions")
              }
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Back to Competitions
            </button>

          </div>

        </div>
      </DashboardLayout>
    );
  }

  // ---------------------------------------------------------
  // Main page
  // ---------------------------------------------------------

  return (
    <DashboardLayout
      title="Manage Competition"
      description={`Manage ${competition.name}`}
    >
      <div className="mx-auto max-w-6xl space-y-6">

        {/* =====================================================
            BACK BUTTON
        ====================================================== */}

        <button
          onClick={() =>
            router.push("/organizer/competitions")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          ← Back to Competitions
        </button>

        {/* =====================================================
            COMPETITION HERO
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] shadow-xl shadow-black/10">

          {/* Poster */}

          {competition.poster_url ? (
            <div className="h-56 w-full overflow-hidden bg-[#070D18] sm:h-72 md:h-80">
              <img
                src={competition.poster_url}
                alt={competition.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center bg-gradient-to-br from-indigo-950/40 to-purple-950/30 sm:h-56 md:h-64">
              <span className="text-7xl">
                🏆
              </span>
            </div>
          )}

          {/* Competition header */}

          <div className="p-5 sm:p-6 md:p-8">

            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

              {/* LEFT */}

              <div className="min-w-0">

                <p className="text-sm font-medium text-indigo-400">
                  Competition
                </p>

                <h1 className="mt-1 break-words text-3xl font-bold text-white md:text-4xl">
                  {competition.name}
                </h1>

                {event && (
                  <p className="mt-2 text-sm text-slate-400">
                    Part of{" "}
                    <span className="font-medium text-indigo-300">
                      {event.name}
                    </span>
                  </p>
                )}

              </div>

              {/* RIGHT */}

              <div className="flex flex-wrap items-center gap-3">

                {/* EDIT BUTTON */}

                {isCreator && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/organizer/competitions/${competitionId}/edit`
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/20 transition hover:bg-indigo-500"
                  >
                    ✏️ Edit Competition
                  </button>
                )}

                {/* STATUS */}

                <span
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                    competition.status
                  )}`}
                >
                  {competition.status || "DRAFT"}
                </span>

              </div>

            </div>

            {competition.description && (
              <p className="mt-6 max-w-4xl text-sm leading-7 text-slate-400 md:text-base">
                {competition.description}
              </p>
            )}

          </div>

        </div>

        {/* =====================================================
            CREATOR INFORMATION
        ====================================================== */}

        {isCreator && (
          <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.05] p-5">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-semibold text-indigo-300">
                  Competition Owner
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  You created this competition. You can edit its
                  details and manage its sessions.
                </p>

              </div>

              <span className="inline-flex w-fit rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                Creator
              </span>

            </div>

          </div>
        )}

        {/* =====================================================
            BASIC INFORMATION
        ====================================================== */}

        <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-5 shadow-xl shadow-black/10 sm:p-6 md:p-8">

          <div className="mb-6">

            <p className="text-sm font-medium text-indigo-400">
              Competition Information
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              Basic Details
            </h2>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* Registration Fee */}

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Registration Fee
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                {formatFee(
                  competition.registration_fee
                )}
              </p>

            </div>

            {/* Capacity */}

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Capacity
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                {competition.capacity !== null &&
                competition.capacity !== undefined
                  ? competition.capacity
                  : "Unlimited"}
              </p>

            </div>

            {/* Venue */}

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Venue
              </p>

              <p className="mt-2 truncate text-lg font-semibold text-white">
                {competition.venue || "Not set"}
              </p>

            </div>

            {/* Competition Date */}

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Competition Date
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                {formatDate(
                  competition.competition_date
                )}
              </p>

            </div>

            {/* Start Time */}

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Start Time
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                {formatTime(
                  competition.start_time
                )}
              </p>

            </div>

            {/* End Time */}

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                End Time
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                {formatTime(
                  competition.end_time
                )}
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            COMPETITION SESSIONS
        ====================================================== */}

        <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-5 shadow-xl shadow-black/10 sm:p-6 md:p-8">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-sm font-medium text-indigo-400">
                Competition Schedule
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Competition Sessions
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                This competition can have multiple sessions on
                the same day or different days.
              </p>

            </div>

            <span className="w-fit whitespace-nowrap rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
              {sessions.length}{" "}
              {sessions.length === 1 ? "Session" : "Sessions"}
            </span>

          </div>

          {sessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">

              <div className="text-4xl">
                🗓️
              </div>

              <h3 className="mt-3 text-lg font-semibold text-white">
                No sessions found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                No competition sessions have been added yet.
                Edit the competition to add sessions.
              </p>

              {isCreator && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/organizer/competitions/${competitionId}/edit`
                    )
                  }
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Add Sessions
                </button>
              )}

            </div>
          ) : (
            <div className="space-y-4">

              {sessions.map((session, index) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-indigo-400/20 hover:bg-white/[0.03] sm:p-6"
                >

                  {/* Session Header */}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                          Session {index + 1}
                        </span>

                        <h3 className="break-words text-lg font-bold text-white">
                          {session.session_name}
                        </h3>

                      </div>

                    </div>

                    {session.late_entry_allowed ? (
                      <span className="w-fit whitespace-nowrap rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                        Late Entry Allowed
                      </span>
                    ) : (
                      <span className="w-fit whitespace-nowrap rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-xs font-semibold text-red-300">
                        Late Entry Not Allowed
                      </span>
                    )}

                  </div>

                  {/* Session Details */}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                    {/* Date */}

                    <div className="rounded-xl border border-white/10 bg-[#070D18] p-4">

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Date
                      </p>

                      <p className="mt-2 text-sm font-semibold text-white">
                        📅 {formatDate(session.session_date)}
                      </p>

                    </div>

                    {/* Time */}

                    <div className="rounded-xl border border-white/10 bg-[#070D18] p-4">

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Time
                      </p>

                      <p className="mt-2 text-sm font-semibold text-white">
                        ⏰ {formatTime(session.start_time)}
                        {" – "}
                        {formatTime(session.end_time)}
                      </p>

                    </div>

                    {/* Venue */}

                    <div className="rounded-xl border border-white/10 bg-[#070D18] p-4">

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Venue
                      </p>

                      <p className="mt-2 break-words text-sm font-semibold text-white">
                        📍 {session.venue}
                      </p>

                    </div>

                  </div>

                  {/* Check-in */}

                  <div className="mt-4 rounded-xl border border-white/10 bg-[#070D18] p-4">

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Check-in Window
                    </p>

                    {session.check_in_start &&
                    session.check_in_end ? (
                      <p className="mt-2 text-sm font-semibold text-white">
                        🎟️ {formatTime(session.check_in_start)}
                        {" – "}
                        {formatTime(session.check_in_end)}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">
                        Not configured
                      </p>
                    )}

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* =====================================================
            CHECK-IN INFORMATION
        ====================================================== */}

        <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-5 shadow-xl shadow-black/10 sm:p-6 md:p-8">

          <div className="mb-6">

            <p className="text-sm font-medium text-indigo-400">
              Entry Settings
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              Check-in & Late Entry
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              These are the legacy competition-level values
              stored for compatibility with the existing database.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* Check-in Opens */}

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Check-in Opens
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                {competition.check_in_start
                  ? formatTime(
                      competition.check_in_start
                    )
                  : "Not configured"}
              </p>

            </div>

            {/* Check-in Closes */}

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Check-in Closes
              </p>

              <p className="mt-2 text-lg font-semibold text-white">
                {competition.check_in_end
                  ? formatTime(
                      competition.check_in_end
                    )
                  : "Not configured"}
              </p>

            </div>

          </div>

          {/* Late Entry */}

          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-medium text-white">
                  Late Entry
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Whether participants can enter after
                  the scheduled start time.
                </p>

              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  competition.late_entry_allowed
                    ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border border-red-400/20 bg-red-400/10 text-red-300"
                }`}
              >
                {competition.late_entry_allowed
                  ? "Allowed"
                  : "Not Allowed"}
              </span>

            </div>

          </div>

        </section>

        {/* =====================================================
            RULES
        ====================================================== */}

        {competition.rules && (
          <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-5 shadow-xl shadow-black/10 sm:p-6 md:p-8">

            <div className="mb-5">

              <p className="text-sm font-medium text-indigo-400">
                Competition Rules
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Rules & Guidelines
              </h2>

            </div>

            <div className="whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm leading-7 text-slate-400">
              {competition.rules}
            </div>

          </section>
        )}

        {/* =====================================================
            EVENT INFORMATION
        ====================================================== */}

        {event && (
          <section className="rounded-2xl border border-white/10 bg-[#0B1220] p-5 shadow-xl shadow-black/10 sm:p-6 md:p-8">

            <div className="mb-6">

              <p className="text-sm font-medium text-indigo-400">
                Parent Event
              </p>

              <h2 className="mt-1 break-words text-xl font-bold text-white">
                {event.name}
              </h2>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* Event Dates */}

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Event Dates
                </p>

                <p className="mt-2 text-sm font-semibold text-white">
                  {formatDate(event.start_date)}
                  {" – "}
                  {formatDate(event.end_date)}
                </p>

              </div>

              {/* Registration Deadline */}

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Registration Deadline
                </p>

                <p className="mt-2 text-sm font-semibold text-white">
                  {formatDate(
                    event.registration_deadline
                  )}
                </p>

              </div>

            </div>

          </section>
        )}

        {/* =====================================================
            MANAGEMENT ACTIONS
        ====================================================== */}

        <section className="rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.04] p-5 sm:p-6 md:p-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-medium text-indigo-400">
                Competition Management
              </p>

              <h2 className="mt-1 text-lg font-bold text-white">
                Manage your competition
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {isCreator
                  ? "Update competition information, poster, sessions and other settings."
                  : "You can view this competition because you are assigned to its event. Only the competition creator can make changes."}
              </p>

            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">

              {/* CREATOR ONLY */}

              {isCreator && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/organizer/competitions/${competitionId}/edit`
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/20 transition hover:bg-indigo-500"
                  >
                    ✏️ Edit Competition
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteCompetition}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:border-red-400/30 hover:bg-red-500/20 hover:text-red-200"
                  >
                    🗑️ Delete
                  </button>
                </>
              )}

              {/* BACK */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/organizer/competitions"
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white sm:w-auto"
              >
                Back to Competitions
              </button>

            </div>

          </div>

        </section>

      </div>
    </DashboardLayout>
  );
}