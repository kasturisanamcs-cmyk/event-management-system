
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const supabase = createClient();

    setLoadingEvents(true);
    setError("");

    const { data, error: eventsError } = await supabase
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

    if (eventsError) {
      console.error("Events error:", eventsError);
      setError("Unable to load events right now.");
      setEvents([]);
    } else {
      setEvents(data || []);
    }

    setLoadingEvents(false);
  }

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return events;

    return events.filter((event) => {
      const name = event.name?.toLowerCase() || "";
      const description = event.description?.toLowerCase() || "";
      const venue = event.venue?.toLowerCase() || "";

      return (
        name.includes(query) ||
        description.includes(query) ||
        venue.includes(query)
      );
    });
  }, [events, search]);

  function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white">

      {/* ================= NAVBAR ================= */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020817]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* Logo */}

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-bold shadow-lg shadow-blue-500/20">
              E
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                EventNest
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Discover. Register. Experience.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}

          <nav className="hidden items-center gap-7 md:flex">

            <Link
              href="/events"
              className="text-sm font-medium text-slate-300 transition hover:text-blue-400"
            >
              Events
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              About
            </Link>

            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Register
            </Link>

          </nav>

          {/* Mobile menu button */}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xl md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Navigation */}

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#020817] px-5 py-5 md:hidden">
            <nav className="flex flex-col gap-2">

              <Link
                href="/events"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Events
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                About
              </Link>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold"
              >
                Register
              </Link>

            </nav>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden">

        <div className="pointer-events-none absolute left-[-180px] top-[-150px] h-[450px] w-[450px] rounded-full bg-blue-600/20 blur-[140px]" />

        <div className="pointer-events-none absolute right-[-180px] top-[100px] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 text-center sm:px-8 sm:pt-24 lg:pb-28 lg:pt-28">

          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
            <span>✨</span>
            Discover events. Join experiences.
          </div>

          <h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Find your next
            <br />

            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              great event.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Discover competitions, workshops, hackathons and other events.
            Explore event details, choose a competition and register through
            EventNest.
          </p>

          {/* Search */}

          <div className="mx-auto mt-9 flex max-w-2xl flex-col gap-3 sm:flex-row">

            <div className="flex flex-1 items-center rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5 backdrop-blur-xl">

              <span className="mr-3 text-lg text-slate-500">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500 sm:text-base"
              />

            </div>

            <Link
              href="/events"
              className="rounded-xl bg-blue-600 px-7 py-3.5 font-semibold shadow-xl shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Explore Events
            </Link>

          </div>

          {/* Categories */}

          <div className="mt-7 flex flex-wrap justify-center gap-2">

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">
              Hackathons
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">
              Competitions
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">
              Workshops
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">
              Tech Events
            </span>

          </div>
        </div>
      </section>

      {/* ================= UPCOMING EVENTS ================= */}

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Discover
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Upcoming Events
            </h2>

            <p className="mt-3 max-w-xl text-slate-500">
              Explore published events and find competitions that interest you.
            </p>
          </div>

          <Link
            href="/events"
            className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
          >
            View all events →
          </Link>

        </div>

        {/* Loading */}

        {loadingEvents && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />

            <p className="mt-4 text-sm text-slate-500">
              Loading events...
            </p>

          </div>
        )}

        {/* Error */}

        {!loadingEvents && error && (
          <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">

            <p className="text-sm text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={loadEvents}
              className="mt-4 rounded-lg border border-red-400/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Empty */}

        {!loadingEvents &&
          !error &&
          filteredEvents.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
                📅
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                {search
                  ? "No matching events"
                  : "No published events yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search
                  ? "Try another search term."
                  : "Published EventNest events will appear here."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  Clear Search
                </button>
              )}

            </div>
          )}

        {/* Event Cards */}

        {!loadingEvents &&
          !error &&
          filteredEvents.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {filteredEvents.slice(0, 6).map((event) => (

                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition duration-200 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.06]"
                >

                  <div className="relative h-48 overflow-hidden bg-[#0b1224]">

                    {event.event_image ? (
                      <img
                        src={event.event_image}
                        alt={event.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500/10 to-cyan-500/5 text-4xl">
                        🎫
                      </div>
                    )}

                    <div className="absolute right-3 top-3 rounded-full border border-green-400/20 bg-[#020817]/80 px-3 py-1 text-xs font-semibold text-green-400 backdrop-blur">
                      Published
                    </div>

                  </div>

                  <div className="p-5">

                    <h3 className="line-clamp-1 text-lg font-semibold text-white group-hover:text-blue-400">
                      {event.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {event.description}
                    </p>

                    <div className="mt-5 space-y-2 text-sm text-slate-500">

                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>
                          {formatDate(event.start_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span className="line-clamp-1">
                          {event.venue}
                        </span>
                      </div>

                    </div>

                    <div className="mt-5 border-t border-white/10 pt-4 text-sm font-semibold text-blue-400">
                      View Event →
                    </div>

                  </div>

                </Link>

              ))}

            </div>
          )}

      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section className="border-y border-white/10 bg-white/[0.02]">

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Simple process
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              How EventNest works
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-500">
              Discover an event, choose a competition and participate.
            </p>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">

            {[
              [
                "01",
                "Discover",
                "Browse published events available on EventNest.",
              ],
              [
                "02",
                "Explore",
                "View competitions, event details, venue and schedule.",
              ],
              [
                "03",
                "Register",
                "Choose a competition and register to participate.",
              ],
              [
                "04",
                "Get Your Ticket",
                "Receive your digital ticket and QR code.",
              ],
            ].map(([number, title, description]) => (

              <div
                key={number}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >

                <span className="text-4xl font-black text-blue-500/20">
                  {number}
                </span>

                <h3 className="mt-4 text-lg font-bold">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ================= CREATE EVENT CTA ================= */}

      <section className="px-5 py-20 sm:px-8">

        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent px-6 py-14 text-center sm:px-12">

          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Event Management
          </p>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Want to create an event?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Create your event, organize competitions, manage participants,
            coordinate volunteers and manage your event through EventNest.
          </p>

          <Link
            href="/dashboard/events/create-event"
            className="mt-7 inline-flex rounded-xl bg-blue-600 px-7 py-3.5 font-semibold shadow-xl shadow-blue-600/20 transition hover:bg-blue-500"
          >
            Create an Event →
          </Link>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-white/10 bg-[#010612]">

        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold">
              E
            </div>

            <div>
              <p className="font-bold">
                EventNest
              </p>

              <p className="text-xs text-slate-600">
                Discover. Register. Experience.
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-6 text-sm text-slate-500">

            <Link href="/" className="hover:text-white">
              Home
            </Link>

            <Link href="/events" className="hover:text-white">
              Events
            </Link>

            <Link href="/about" className="hover:text-white">
              About
            </Link>

            <Link href="/login" className="hover:text-white">
              Login
            </Link>

            <Link href="/register" className="hover:text-white">
              Register
            </Link>

          </div>

        </div>

        <div className="border-t border-white/5 py-5 text-center text-xs text-slate-600">
          © 2026 EventNest. Smart Event Management System.
        </div>

      </footer>

    </main>
  );
}
