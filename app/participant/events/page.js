"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ParticipantEventsPage() {
  const supabase = createClient();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("Participant");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");

      // Check logged-in user
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

      // Get participant profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }

      // Get published events
      const { data, error: eventError } = await supabase
        .from("events")
        .select(
          "id, name, description, start_date, end_date, registration_deadline, venue, event_image, status"
        )
        .eq("status", "PUBLISHED")
        .order("start_date", { ascending: true });

      if (eventError) {
        console.error("Event error:", eventError);
        setError(eventError.message);
        setLoading(false);
        return;
      }

      setEvents(data || []);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while loading events.");
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter((event) => {
    const text = search.toLowerCase();

    return (
      event.name?.toLowerCase().includes(text) ||
      event.description?.toLowerCase().includes(text) ||
      event.venue?.toLowerCase().includes(text)
    );
  });

  function formatDate(date) {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDates(start, end) {
    if (!start) return "Date not available";

    if (!end || start === end) {
      return formatDate(start);
    }

    return `${formatDate(start)} - ${formatDate(end)}`;
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-[#0f172a] lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-6 py-5">
            <Link href="/" className="text-2xl font-bold">
              Event<span className="text-blue-400">Nest</span>
            </Link>

            <p className="mt-1 text-xs text-slate-400">
              Participant Portal
            </p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            <Link
              href="/participant/dashboard"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              🏠 Dashboard
            </Link>

            <Link
              href="/participant/events"
              className="flex items-center gap-3 rounded-xl bg-blue-500/10 px-4 py-3 text-blue-400"
            >
              📅 Events
            </Link>

            <Link
              href="/participant/registrations"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              📝 My Registrations
            </Link>

            <Link
              href="/participant/tickets"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              🎟️ My Tickets
            </Link>

            <Link
              href="/participant/schedule"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              🗓️ Schedule
            </Link>

            <Link
              href="/participant/announcements"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              📢 Announcements
            </Link>

            <Link
              href="/participant/participant/profile"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              👤 Profile
            </Link>
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={logout}
              className="w-full rounded-xl px-4 py-3 text-left text-slate-300 hover:bg-red-500/10 hover:text-red-400"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen lg:ml-64">
        {/* Header */}
        <header className="border-b border-white/10 px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm text-blue-400">Participant</p>

          <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold">Browse Events</h1>

              <p className="mt-1 text-sm text-slate-400">
                Discover published events and competitions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-slate-400">Participant</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                👤
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by name, description or venue..."
                className="w-full rounded-xl border border-white/10 bg-[#0f172a] py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold">Available Events</h2>

          <p className="mt-1 text-sm text-slate-400">
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1 ? "event" : "events"} found
          </p>

          {/* Loading */}
          {loading && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-[#0f172a] p-12 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

              <p className="mt-4 text-slate-400">
                Loading events...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
              <h3 className="text-lg font-semibold text-red-400">
                Unable to load events
              </h3>

              <p className="mt-2 text-sm text-slate-300">
                {error}
              </p>

              <button
                onClick={loadEvents}
                className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Events */}
          {!loading && !error && (
            <>
              {filteredEvents.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-white/10 bg-[#0f172a] p-12 text-center">
                  <div className="text-5xl">📅</div>

                  <h3 className="mt-5 text-xl font-semibold">
                    No events found
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    {search
                      ? "No published events match your search."
                      : "There are currently no published events available."}
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredEvents.map((event) => (
                    <article
                      key={event.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] transition hover:-translate-y-1 hover:border-blue-500/40"
                    >
                      {/* Image */}
                      <div className="h-48 bg-slate-900">
                        {event.event_image ? (
                          <img
                            src={event.event_image}
                            alt={event.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-6xl">
                            🎫
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-5">
                        <div className="mb-3 inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                          Published
                        </div>

                        <h3 className="text-xl font-semibold">
                          {event.name}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                          {event.description ||
                            "No description available."}
                        </p>

                        <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                          <div className="flex gap-3">
                            <span>📅</span>

                            <div>
                              <p className="text-xs text-slate-500">
                                Event Dates
                              </p>

                              <p className="text-sm text-slate-200">
                                {formatDates(
                                  event.start_date,
                                  event.end_date
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <span>📍</span>

                            <div>
                              <p className="text-xs text-slate-500">
                                Venue
                              </p>

                              <p className="text-sm text-slate-200">
                                {event.venue || "Not specified"}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <span>⏰</span>

                            <div>
                              <p className="text-xs text-slate-500">
                                Registration Deadline
                              </p>

                              <p className="text-sm text-slate-200">
                                {formatDate(
                                  event.registration_deadline
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`/participant/events/details?eventId=${event.id}`}
                          className="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold hover:bg-blue-600"
                        >
                          View Event Details →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}