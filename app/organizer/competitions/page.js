"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/client";

export default function CompetitionsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [event, setEvent] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Invitation state
  const [inviteCompetitionId, setInviteCompetitionId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    loadOrganizerEventAndCompetitions();
  }, []);

  async function loadOrganizerEventAndCompetitions() {
    setLoading(true);
    setError("");

    try {
      // ---------------------------------------------------------
      // Get logged-in user/session
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
      // 1. Find the ONE event assigned to this organizer
      // ---------------------------------------------------------
      const { data: assignment, error: assignmentError } =
        await supabase
          .from("event_organizers")
          .select(`
            event_id,
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
          .eq("organizer_id", user.id)
          .maybeSingle();

      if (assignmentError) {
        throw assignmentError;
      }

      if (!assignment || !assignment.events) {
        setEvent(null);
        setCompetitions([]);
        return;
      }

      const assignedEvent = assignment.events;

      setEvent(assignedEvent);

      // ---------------------------------------------------------
      // 2. Load competitions belonging to that event
      // ---------------------------------------------------------
      const { data: competitionData, error: competitionError } =
        await supabase
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
            created_at
          `)
          .eq("event_id", assignedEvent.id)
          .order("competition_date", { ascending: true })
          .order("start_time", { ascending: true });

      if (competitionError) {
        throw competitionError;
      }

      setCompetitions(competitionData || []);
    } catch (err) {
      console.error(
        "Error loading organizer competitions:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while loading competitions."
      );
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // Invite Competition Member
  // ---------------------------------------------------------
  async function sendCompetitionMemberInvitation(competitionId) {
    setInviteError("");
    setInviteMessage("");

    const email = inviteEmail.trim().toLowerCase();

    if (!email) {
      setInviteError("Please enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setInviteError("Please enter a valid email address.");
      return;
    }

    setInviteLoading(true);

    try {
      const response = await fetch(
        "/api/competition-member-invitations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            competitionId,
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to send invitation."
        );
      }

      setInviteMessage(
        "Invitation sent successfully."
      );

      setInviteEmail("");
    } catch (err) {
      console.error(
        "Competition member invitation error:",
        err
      );

      setInviteError(
        err.message ||
          "Something went wrong while sending the invitation."
      );
    } finally {
      setInviteLoading(false);
    }
  }

  function openInviteForm(competitionId) {
    setInviteCompetitionId(competitionId);
    setInviteEmail("");
    setInviteMessage("");
    setInviteError("");
  }

  function closeInviteForm() {
    if (inviteLoading) return;

    setInviteCompetitionId(null);
    setInviteEmail("");
    setInviteMessage("");
    setInviteError("");
  }

  // ---------------------------------------------------------
  // Search
  // ---------------------------------------------------------
  const filteredCompetitions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return competitions;
    }

    return competitions.filter((competition) => {
      return (
        competition.name?.toLowerCase().includes(query) ||
        competition.description?.toLowerCase().includes(query) ||
        competition.venue?.toLowerCase().includes(query) ||
        competition.status?.toLowerCase().includes(query)
      );
    });
  }, [competitions, search]);

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
    if (!time) return "";

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

  // ---------------------------------------------------------
  // Dark EventNest status styles
  // ---------------------------------------------------------
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

  return (
    <DashboardLayout
      title="Competition Management"
      description={
        event
          ? `Manage competitions for ${event.name}.`
          : "Manage competitions for your assigned event."
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            EVENT INFORMATION
        ====================================================== */}
        {event && (
          <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-5 shadow-xl shadow-black/10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div className="min-w-0">

                <p className="text-sm font-medium text-indigo-400">
                  Your Assigned Event
                </p>

                <h2 className="mt-1 truncate text-2xl font-bold text-white">
                  {event.name}
                </h2>

                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">

                  <span>
                    📅 {formatDate(event.start_date)} –{" "}
                    {formatDate(event.end_date)}
                  </span>

                  {event.venue && (
                    <span>
                      📍 {event.venue}
                    </span>
                  )}

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>

                </div>
              </div>

              <button
                onClick={() =>
                  router.push("/organizer/events")
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-white md:w-auto"
              >
                View Event
              </button>

            </div>
          </div>
        )}

        {/* =====================================================
            TOP BAR
        ====================================================== */}
        <div className="flex flex-col justify-between gap-4 md:flex-row">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="🔍 Search competition..."
            className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 md:w-96"
          />

          <button
            disabled={!event}
            onClick={() => {
              if (event) {
                router.push(
                  `/organizer/events/${event.id}/competitions/create`
                );
              }
            }}
            className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none md:w-auto"
          >
            + Create Competition
          </button>

        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}
        {error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5">

            <h3 className="font-semibold text-red-300">
              Unable to load competitions
            </h3>

            <p className="mt-1 text-sm text-red-400">
              {error}
            </p>

            <button
              onClick={
                loadOrganizerEventAndCompetitions
              }
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
            >
              Try Again
            </button>

          </div>
        )}

        {/* =====================================================
            LOADING
        ====================================================== */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220]"
              >
                <div className="h-48 bg-white/[0.05]" />

                <div className="space-y-4 p-6">

                  <div className="h-6 w-2/3 rounded bg-white/[0.06]" />

                  <div className="h-4 w-1/2 rounded bg-white/[0.06]" />

                  <div className="h-4 w-3/4 rounded bg-white/[0.06]" />

                  <div className="h-10 rounded bg-white/[0.06]" />

                </div>
              </div>
            ))}

          </div>
        )}

        {/* =====================================================
            NO ASSIGNED EVENT
        ====================================================== */}
        {!loading && !error && !event && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#0B1220] p-10 text-center">

            <div className="mb-4 text-5xl">
              📅
            </div>

            <h2 className="text-xl font-bold text-white">
              No event assigned
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-400">
              You are currently not assigned to an event.
              Please contact the administrator if you
              believe this is incorrect.
            </p>

          </div>
        )}

        {/* =====================================================
            NO COMPETITIONS
        ====================================================== */}
        {!loading &&
          !error &&
          event &&
          competitions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#0B1220] p-10 text-center">

              <div className="mb-4 text-5xl">
                🏆
              </div>

              <h2 className="text-xl font-bold text-white">
                No competitions yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-slate-400">
                No competitions have been created for your
                event yet.
              </p>

              <button
                onClick={() =>
                  router.push(
                    `/organizer/events/${event.id}/competitions/create`
                  )
                }
                className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
              >
                Create First Competition
              </button>

            </div>
          )}

        {/* =====================================================
            NO SEARCH RESULTS
        ====================================================== */}
        {!loading &&
          !error &&
          competitions.length > 0 &&
          filteredCompetitions.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-10 text-center">

              <div className="mb-4 text-4xl">
                🔎
              </div>

              <h2 className="text-xl font-bold text-white">
                No matching competitions
              </h2>

              <p className="mt-2 text-slate-400">
                Try searching with another competition
                name, venue, or status.
              </p>

            </div>
          )}

        {/* =====================================================
            COMPETITION CARDS
        ====================================================== */}
        {!loading &&
          filteredCompetitions.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">

              {filteredCompetitions.map(
                (competition) => {
                  const isCompetitionOwner =
                    currentUser?.id ===
                    competition.organizer_id;

                  const isInviteOpen =
                    inviteCompetitionId ===
                    competition.id;

                  return (
                    <div
                      key={competition.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] shadow-xl shadow-black/10 transition duration-200 hover:border-indigo-400/20 hover:shadow-indigo-950/20"
                    >

                      {/* Poster */}
                      {competition.poster_url ? (
                        <div className="h-48 overflow-hidden bg-[#070D18]">

                          <img
                            src={competition.poster_url}
                            alt={competition.name}
                            className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                          />

                        </div>
                      ) : (
                        <div className="flex h-32 items-center justify-center bg-gradient-to-br from-indigo-950/40 to-purple-950/30">

                          <span className="text-5xl">
                            🏆
                          </span>

                        </div>
                      )}

                      <div className="p-6">

                        {/* Title + Status */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                          <div className="min-w-0">

                            <h2 className="truncate text-xl font-bold text-white">
                              {competition.name}
                            </h2>

                            <p className="mt-1 text-sm font-medium text-indigo-400">
                              {event?.name}
                            </p>

                          </div>

                          <span
                            className={`self-start whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              competition.status
                            )}`}
                          >
                            {competition.status || "DRAFT"}
                          </span>

                        </div>

                        {/* Description */}
                        {competition.description && (
                          <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
                            {competition.description}
                          </p>
                        )}

                        {/* Competition Details */}
                        <div className="mt-5 space-y-3 text-sm text-slate-400">

                          <div className="flex items-center gap-3">
                            <span className="w-5 text-center">
                              📅
                            </span>

                            <span>
                              {formatDate(
                                competition.competition_date
                              )}
                            </span>
                          </div>

                          {competition.start_time &&
                            competition.end_time && (
                              <div className="flex items-center gap-3">

                                <span className="w-5 text-center">
                                  ⏰
                                </span>

                                <span>
                                  {formatTime(
                                    competition.start_time
                                  )}
                                  {" – "}
                                  {formatTime(
                                    competition.end_time
                                  )}
                                </span>

                              </div>
                            )}

                          {competition.venue && (
                            <div className="flex items-center gap-3">

                              <span className="w-5 text-center">
                                📍
                              </span>

                              <span className="truncate">
                                {competition.venue}
                              </span>

                            </div>
                          )}

                          <div className="flex items-center gap-3">

                            <span className="w-5 text-center">
                              💰
                            </span>

                            <span>
                              Registration Fee:{" "}
                              <strong className="font-semibold text-slate-200">
                                {formatFee(
                                  competition.registration_fee
                                )}
                              </strong>
                            </span>

                          </div>

                          {competition.capacity !== null &&
                            competition.capacity !==
                              undefined && (
                              <div className="flex items-center gap-3">

                                <span className="w-5 text-center">
                                  👥
                                </span>

                                <span>
                                  Capacity:{" "}
                                  {competition.capacity}
                                </span>

                              </div>
                            )}

                        </div>

                        {/* =================================================
                            ACTIONS
                        ================================================== */}
                        <div className="mt-6 space-y-3">

                          <div className="grid gap-3 sm:grid-cols-2">

                            {/* Manage / View */}
                            {isCompetitionOwner ? (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/organizer/competitions/${competition.id}`
                                  )
                                }
                                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
                              >
                                Manage Competition
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/organizer/competitions/${competition.id}`
                                  )
                                }
                                className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                              >
                                View Competition
                              </button>
                            )}

                            {/* Invite Member */}
                            {isCompetitionOwner && (
                              <button
                                onClick={() => {
                                  if (isInviteOpen) {
                                    closeInviteForm();
                                  } else {
                                    openInviteForm(
                                      competition.id
                                    );
                                  }
                                }}
                                className="w-full rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:text-white"
                              >
                                {isInviteOpen
                                  ? "Close Invitation"
                                  : "✉ Invite Competition Member"}
                              </button>
                            )}

                          </div>

                          {/* =================================================
                              INVITATION FORM
                          ================================================== */}
                          {isCompetitionOwner &&
                            isInviteOpen && (
                              <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.05] p-4">

                                <div className="mb-4">

                                  <h3 className="text-sm font-semibold text-white">
                                    Invite Competition Member
                                  </h3>

                                  <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Enter the email address of the
                                    person you want to invite.
                                  </p>

                                </div>

                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();

                                    sendCompetitionMemberInvitation(
                                      competition.id
                                    );
                                  }}
                                  className="space-y-3"
                                >

                                  <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) =>
                                      setInviteEmail(
                                        e.target.value
                                      )
                                    }
                                    placeholder="member@example.com"
                                    disabled={inviteLoading}
                                    className="w-full rounded-xl border border-white/10 bg-[#070D18] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                                  />

                                  <button
                                    type="submit"
                                    disabled={inviteLoading}
                                    className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                                  >
                                    {inviteLoading
                                      ? "Sending Invitation..."
                                      : "Send Invitation"}
                                  </button>

                                </form>

                                {inviteMessage && (
                                  <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300">
                                    {inviteMessage}
                                  </div>
                                )}

                                {inviteError && (
                                  <div className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                                    {inviteError}
                                  </div>
                                )}

                              </div>
                            )}

                        </div>

                      </div>
                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>
    </DashboardLayout>
  );
}