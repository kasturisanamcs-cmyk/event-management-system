"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EventDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />
            <p className="mt-4 text-sm text-slate-400">
              Loading event details...
            </p>
          </div>
        </div>
      }
    >
      <EventDetailsContent />
    </Suspense>
  );
}

function EventDetailsContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const eventId = searchParams.get("eventId");

  const [event, setEvent] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [userName, setUserName] = useState("Participant");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [competitionError, setCompetitionError] = useState("");

  useEffect(() => {
    if (!eventId) {
      setError("Event ID is missing.");
      setLoading(false);
      return;
    }

    loadEvent();
  }, [eventId]);

  async function loadEvent() {
    try {
      setLoading(true);
      setError("");
      setCompetitionError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("User error:", userError);
      }

      if (!user) {
        setError("You are not logged in. Please login first.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile error:", profileError);
      }

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(`
          id,
          name,
          description,
          start_date,
          end_date,
          registration_deadline,
          venue,
          event_image,
          status,
          created_at
        `)
        .eq("id", eventId)
        .eq("status", "PUBLISHED")
        .maybeSingle();

      if (eventError) {
        console.error("Event loading error:", eventError);
        setError(eventError.message);
        return;
      }

      if (!eventData) {
        setError(
          "This event was not found or is not currently published."
        );
        return;
      }

      setEvent(eventData);

      const { data: competitionData, error: competitionsError } =
        await supabase
          .from("competitions")
          .select(`
            id,
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
            poster_url
          `)
          .eq("event_id", eventId)
          .eq("status", "PUBLISHED")
          .order("competition_date", { ascending: true });

      if (competitionsError) {
        console.error(
          "Competition loading error:",
          competitionsError
        );
        setCompetitionError(competitionsError.message);
        setCompetitions([]);
      } else {
        setCompetitions(competitionData || []);
      }
    } catch (err) {
      console.error("Unexpected event error:", err);
      setError("Something went wrong while loading the event.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function formatDate(date) {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatShortDate(date) {
    if (!date) return "Date not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateRange(startDate, endDate) {
    if (!startDate) {
      return "Date not available";
    }

    if (!endDate || startDate === endDate) {
      return formatDate(startDate);
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  function formatTime(time) {
    if (!time) return "Not available";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    date.setSeconds(0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatCompetitionSchedule(competition) {
    const date = formatShortDate(competition.competition_date);

    if (competition.start_time && competition.end_time) {
      return `${date} • ${formatTime(
        competition.start_time
      )} - ${formatTime(competition.end_time)}`;
    }

    return date;
  }

  function formatFee(fee) {
    if (fee === null || fee === undefined) {
      return "Not specified";
    }

    const amount = Number(fee);

    if (amount === 0) {
      return "Free";
    }

    return `₹${amount}`;
  }

  function getCompetitionRules(rules) {
    if (!rules) return [];

    return rules
      .split(/\r?\n/)
      .map((rule) => rule.trim())
      .filter(Boolean);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <ParticipantSidebar
          active="events"
          userName={userName}
          logout={logout}
        />

        <main className="min-h-screen lg:ml-64">
          <header className="border-b border-white/10 px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-sm text-blue-400">Participant</p>

            <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold">
                  Event Details
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Loading event information...
                </p>
              </div>

              <UserBadge userName={userName} />
            </div>
          </header>

          <section className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex min-h-[500px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

                <p className="mt-4 text-sm text-slate-400">
                  Loading event details...
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <ParticipantSidebar
          active="events"
          userName={userName}
          logout={logout}
        />

        <main className="min-h-screen lg:ml-64">
          <header className="border-b border-white/10 px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-sm text-blue-400">Participant</p>

            <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold">
                  Event Details
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  View event information and competitions.
                </p>
              </div>

              <UserBadge userName={userName} />
            </div>
          </header>

          <section className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
              <h2 className="text-xl font-bold text-red-400">
                Unable to load event
              </h2>

              <p className="mt-2 text-sm text-slate-300">
                {error}
              </p>

              <Link
                href="/participant/events"
                className="mt-5 inline-flex rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold transition hover:bg-blue-600"
              >
                ← Back to Events
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <ParticipantSidebar
        active="events"
        userName={userName}
        logout={logout}
      />

      <main className="min-h-screen lg:ml-64">
        <header className="border-b border-white/10 px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm text-blue-400">Participant</p>

          <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold">
                Event Details
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Explore this event and its competitions.
              </p>
            </div>

            <UserBadge userName={userName} />
          </div>
        </header>

        <section className="px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/participant/events"
            className="mb-6 inline-flex items-center text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to Events
          </Link>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a]">
            <div className="relative h-64 bg-slate-900 sm:h-80 lg:h-96">
              {event.event_image ? (
                <img
                  src={event.event_image}
                  alt={event.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-purple-500/20">
                  <div className="text-center">
                    <div className="text-7xl">🎫</div>

                    <p className="mt-4 text-sm text-slate-400">
                      Event Image
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute left-4 top-4 rounded-full bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-300 backdrop-blur sm:left-6 sm:top-6">
                Published
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <p className="text-sm font-medium text-blue-400">
                EVENT
              </p>

              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                {event.name}
              </h2>

              <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-400 sm:text-base">
                {event.description ||
                  "No description has been provided for this event."}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InfoCard
                  icon="📅"
                  title="Event Dates"
                  value={formatDateRange(
                    event.start_date,
                    event.end_date
                  )}
                />

                <InfoCard
                  icon="📍"
                  title="Venue"
                  value={event.venue || "Venue not specified"}
                />

                <InfoCard
                  icon="⏰"
                  title="Registration Deadline"
                  value={formatDate(event.registration_deadline)}
                />

                <InfoCard
                  icon="🏆"
                  title="Competitions"
                  value={`${competitions.length} ${
                    competitions.length === 1
                      ? "competition"
                      : "competitions"
                  }`}
                />
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-5">
              <p className="text-sm font-medium text-blue-400">
                EVENT COMPETITIONS
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Available Competitions
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Registration and payment are handled separately for
                each competition.
              </p>
            </div>

            {competitionError && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                <h3 className="font-semibold text-red-400">
                  Unable to load competitions
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  {competitionError}
                </p>
              </div>
            )}

            {!competitionError && competitions.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-10 text-center">
                <div className="text-5xl">🏆</div>

                <h3 className="mt-4 text-xl font-semibold">
                  No competitions available
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  There are currently no published competitions
                  available for this event.
                </p>
              </div>
            )}

            {!competitionError && competitions.length > 0 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {competitions.map((competition) => {
                  const rules = getCompetitionRules(
                    competition.rules
                  );

                  return (
                    <article
                      key={competition.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] transition hover:-translate-y-1 hover:border-blue-500/40"
                    >
                      <div className="h-44 bg-slate-900">
                        {competition.poster_url ? (
                          <img
                            src={competition.poster_url}
                            alt={competition.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-purple-500/10">
                            <div className="text-center">
                              <div className="text-5xl">
                                🏆
                              </div>

                              <p className="mt-2 text-xs text-slate-500">
                                Competition
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="mb-3 inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                          Published
                        </div>

                        <h3 className="text-xl font-semibold">
                          {competition.name}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                          {competition.description ||
                            "No description available."}
                        </p>

                        <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                          <div className="flex gap-3">
                            <span>📅</span>

                            <div className="min-w-0">
                              <p className="text-xs text-slate-500">
                                Schedule
                              </p>

                              <p className="mt-1 break-words text-sm text-slate-200">
                                {formatCompetitionSchedule(
                                  competition
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <span>📍</span>

                            <div className="min-w-0">
                              <p className="text-xs text-slate-500">
                                Venue
                              </p>

                              <p className="mt-1 break-words text-sm text-slate-200">
                                {competition.venue ||
                                  event.venue ||
                                  "Not specified"}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <span>💰</span>

                            <div>
                              <p className="text-xs text-slate-500">
                                Registration Fee
                              </p>

                              <p className="mt-1 text-sm font-medium text-cyan-400">
                                {formatFee(
                                  competition.registration_fee
                                )}
                              </p>
                            </div>
                          </div>

                          {competition.capacity !== null &&
                            competition.capacity !== undefined && (
                              <div className="flex gap-3">
                                <span>👥</span>

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Capacity
                                  </p>

                                  <p className="mt-1 text-sm text-slate-200">
                                    {competition.capacity}{" "}
                                    participants
                                  </p>
                                </div>
                              </div>
                            )}
                        </div>

                        {rules.length > 0 && (
                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-xs text-slate-500">
                              Rules
                            </p>

                            <div className="mt-2 space-y-2">
                              {rules.slice(0, 3).map((rule, index) => (
                                <div
                                  key={`${competition.id}-rule-${index}`}
                                  className="flex gap-2 text-xs leading-5 text-slate-400"
                                >
                                  <span className="text-cyan-400">
                                    ✓
                                  </span>

                                  <span>{rule}</span>
                                </div>
                              ))}
                            </div>

                            {rules.length > 3 && (
                              <p className="mt-2 text-xs text-slate-500">
                                + {rules.length - 3} more rule
                                {rules.length - 3 === 1
                                  ? ""
                                  : "s"}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-5">
                          <Link
                            href={`/participant/events/details/competition/${competition.id}`}
                            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-[#0f172a] p-5 sm:p-6">
            <h2 className="text-xl font-bold">
              About This Event
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-400 sm:text-base">
              {event.description ||
                "No additional information is available."}
            </p>
          </section>
        </section>
      </main>
    </div>
  );
}

function ParticipantSidebar({
  active,
  userName,
  logout,
}) {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-[#0f172a] lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold"
          >
            Event<span className="text-blue-400">Nest</span>
          </Link>

          <p className="mt-1 text-xs text-slate-400">
            Participant Portal
          </p>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <SidebarLink
            href="/participant/dashboard"
            icon="🏠"
            label="Dashboard"
            active={active === "dashboard"}
          />

          <SidebarLink
            href="/participant/events"
            icon="📅"
            label="Events"
            active={active === "events"}
          />

          <SidebarLink
            href="/participant/registrations"
            icon="📝"
            label="My Registrations"
            active={active === "registrations"}
          />

          <SidebarLink
            href="/participant/tickets"
            icon="🎟️"
            label="My Tickets"
            active={active === "tickets"}
          />

          <SidebarLink
            href="/participant/schedule"
            icon="🗓️"
            label="Schedule"
            active={active === "schedule"}
          />

          <SidebarLink
            href="/participant/announcements"
            icon="📢"
            label="Announcements"
            active={active === "announcements"}
          />

          <SidebarLink
            href="/participant/participant/profile"
            icon="👤"
            label="Profile"
            active={active === "profile"}
          />
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="w-full rounded-xl px-4 py-3 text-left text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
        active
          ? "bg-blue-500/10 text-blue-400"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function UserBadge({ userName }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium">
          {userName}
        </p>

        <p className="text-xs text-slate-400">
          Participant
        </p>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
        👤
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="mt-1 break-words text-sm font-medium text-slate-200">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}