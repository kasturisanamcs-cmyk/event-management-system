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

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");

      // PUBLIC PAGE:
      // Do not require authentication here.
      const { data, error: eventError } = await supabase
        .from("events")
        .select(
          `
            id,
            name,
            description,
            start_date,
            end_date,
            registration_deadline,
            venue,
            event_image,
            status
          `
        )
        .eq("status", "PUBLISHED")
        .order("start_date", { ascending: true });

      if (eventError) {
        console.error("Event loading error:", eventError);
        setError(eventError.message);
        return;
      }

      setEvents(data || []);
    } catch (err) {
      console.error("Load events error:", err);
      setError("Something went wrong while loading events.");
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = events.filter((event) => {
    const text = search.toLowerCase().trim();

    if (!text) return true;

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

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#020617]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-bold">
            Event<span className="text-blue-400">Nest</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">
            EventNest
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Browse Events
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Discover upcoming Tech Fest events and explore their
            competitions. You can browse freely without creating an account.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events by name, description or venue..."
              className="w-full rounded-2xl border border-white/10 bg-[#0f172a] py-4 pl-11 pr-4 text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500"
            />
          </div>
        </div>

        {/* Result count */}
        {!loading && !error && (
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Available Events
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "event" : "events"} found
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-12 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

            <p className="mt-4 text-sm text-slate-400">
              Loading events...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <h3 className="text-lg font-semibold text-red-400">
              Unable to load events
            </h3>

            <p className="mt-2 text-sm text-slate-300">
              {error}
            </p>

            <button
              onClick={loadEvents}
              className="mt-5 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Events */}
        {!loading && !error && (
          <>
            {filteredEvents.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-12 text-center">
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
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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

                    {/* Content */}
                    <div className="p-5">
                      <div className="mb-3 inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                        Published
                      </div>

                      <h3 className="text-xl font-semibold">
                        {event.name}
                      </h3>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                        {event.description ||
                          "No description available."}
                      </p>

                      {/* Event details */}
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

                      {/* View details */}
                      <Link
                        href={`/participant/events/details?eventId=${event.id}`}
                        className="mt-6 flex w-full items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-400 transition hover:bg-blue-500 hover:text-white"
                      >
                        View Event & Competitions →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}