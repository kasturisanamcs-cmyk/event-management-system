"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // =====================================================
  // AUTH
  // =====================================================

  useEffect(() => {
    const supabase = createClient();

    async function initializeAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentUser = session?.user || null;

        setUser(currentUser);

        if (currentUser) {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (!error) {
            setUserRole(data?.role || null);
          }
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
        setUserRole(null);
      } finally {
        setAuthLoading(false);
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;

      // IMPORTANT:
      // Do not await another Supabase request inside this callback.
      setUser(currentUser);

      if (!currentUser) {
        setUserRole(null);
      }

      setAuthLoading(false);

      // Load role separately after auth event.
      if (currentUser) {
        setTimeout(async () => {
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", currentUser.id)
              .maybeSingle();

            if (!error) {
              setUserRole(data?.role || null);
            }
          } catch (error) {
            console.error("Role loading error:", error);
          }
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =====================================================
  // DASHBOARD ROUTE
  // =====================================================

  function getDashboardPath() {
    switch (userRole) {
      case "ADMIN":
        return "/dashboard";

      case "ORGANIZER":
        return "/dashboard";

      case "COMPETITION_MEMBER":
        return "/competition-member/dashboard";

      case "PARTICIPANT":
        return "/participant/dashboard";

      default:
        return "/dashboard";
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleLogout() {
    const supabase = createClient();

    setLoggingOut(true);

    try {
      await supabase.auth.signOut();

      setUser(null);
      setUserRole(null);
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  // =====================================================
  // LOAD EVENTS
  // =====================================================

  useEffect(() => {
    async function loadEvents() {
      const supabase = createClient();

      try {
        const { data, error } = await supabase
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
            status
          `)
          .eq("status", "PUBLISHED")
          .order("start_date", { ascending: true })
          .limit(6);

        if (error) {
          console.error("Events loading error:", error);
          setEvents([]);
        } else {
          setEvents(data || []);
        }
      } catch (error) {
        console.error("Events loading error:", error);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    }

    loadEvents();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020617] text-white">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* LOGO */}

          <Link href="/" className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-black shadow-lg shadow-blue-500/20">
              E
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">
                EventNest
              </p>

              <p className="hidden text-[11px] text-slate-500 sm:block">
                Discover. Register. Experience.
              </p>
            </div>

          </Link>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-7 md:flex">

            <Link
              href="/events"
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Events
            </Link>

            <Link
              href="/about"
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              About
            </Link>

            {authLoading ? (
              <div className="h-10 w-28 rounded-xl bg-white/5" />
            ) : user ? (
              <>
                <Link
                  href={getDashboardPath()}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-blue-400/30 hover:bg-white/[0.08]"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
                >
                  Register
                </Link>
              </>
            )}

          </nav>

          {/* MOBILE BUTTON */}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

        </div>

        {/* MOBILE NAV */}

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#020617] px-4 py-4 md:hidden">

            <nav className="flex flex-col gap-1">

              <Link
                href="/events"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Events
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
              >
                About
              </Link>

              {authLoading ? (
                <div className="mx-4 my-2 h-10 rounded-xl bg-white/5" />
              ) : user ? (
                <>
                  <Link
                    href={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold"
                  >
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="mt-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200"
                  >
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-slate-200"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-1 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold"
                  >
                    Register
                  </Link>
                </>
              )}

            </nav>

          </div>
        )}

      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden">

        <div className="pointer-events-none absolute left-[-180px] top-[-180px] h-[480px] w-[480px] rounded-full bg-blue-600/20 blur-[150px]" />

        <div className="pointer-events-none absolute right-[-180px] top-[80px] h-[480px] w-[480px] rounded-full bg-cyan-500/10 blur-[150px]" />

        <div className="pointer-events-none absolute bottom-[-250px] left-1/2 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[160px]" />

        <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 text-center sm:px-8 sm:pb-28 sm:pt-24 lg:pb-32 lg:pt-32">

          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 sm:text-sm">
            <span className="text-cyan-300">✦</span>
            Discover events that matter
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-8xl">

            Find your next

            <span className="mt-2 block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              great event.
            </span>

          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Discover hackathons, competitions, workshops and
            experiences worth attending. Explore, register and
            experience everything through EventNest.
          </p>

          {/* HERO BUTTONS */}

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link
              href="/events"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500 sm:w-auto"
            >
              Explore Events
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>

            {user ? (
              <Link
                href={getDashboardPath()}
                className="inline-flex w-full items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 px-7 py-3.5 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 sm:w-auto"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:w-auto"
              >
                Join EventNest
              </Link>
            )}

          </div>

          {/* CATEGORIES */}

          <div className="mt-9 flex flex-wrap justify-center gap-2">

            {[
              "Hackathons",
              "Competitions",
              "Workshops",
              "Tech Events",
            ].map((category) => (
              <Link
                key={category}
                href="/events"
                className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-medium text-slate-400 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300"
              >
                {category}
              </Link>
            ))}

          </div>

          {/* STATS */}

          <div className="mx-auto mt-14 grid max-w-xl grid-cols-3 border-y border-white/10 py-5">

            <div className="px-3">
              <p className="text-lg font-bold sm:text-xl">
                Events
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600 sm:text-xs">
                Discover
              </p>
            </div>

            <div className="border-x border-white/10 px-3">
              <p className="text-lg font-bold sm:text-xl">
                Competitions
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600 sm:text-xs">
                Participate
              </p>
            </div>

            <div className="px-3">
              <p className="text-lg font-bold sm:text-xl">
                Digital
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600 sm:text-xs">
                Tickets
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          UPCOMING EVENTS
      ====================================================== */}

      <section className="border-t border-white/[0.06]">

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                Discover
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Upcoming Events
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Find events, competitions and experiences
                happening through EventNest.
              </p>
            </div>

            <Link
              href="/events"
              className="group text-sm font-semibold text-blue-400 transition hover:text-blue-300"
            >
              View all events
              <span className="ml-1 transition group-hover:ml-2">
                →
              </span>
            </Link>

          </div>

          {/* LOADING */}

          {loadingEvents && (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]"
                >
                  <div className="h-52 animate-pulse bg-white/5" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-white/5" />
                    <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
                  </div>
                </div>
              ))}

            </div>
          )}

          {/* EVENTS */}

          {!loadingEvents && events.length > 0 && (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.045]"
                >

                  <div className="relative h-52 overflow-hidden bg-[#0b1224]">

                    {event.event_image ? (
                      <img
                        src={event.event_image}
                        alt={event.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-cyan-500/10">
                        <span className="text-5xl opacity-60">
                          🎫
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute left-4 top-4 rounded-full border border-emerald-400/20 bg-[#020817]/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur">
                      Published
                    </div>

                  </div>

                  <div className="p-5">

                    <h3 className="line-clamp-1 text-lg font-bold text-white transition group-hover:text-blue-400">
                      {event.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {event.description ||
                        "Explore this EventNest event and discover what awaits."}
                    </p>

                    <div className="mt-5 space-y-2.5 text-sm text-slate-500">

                      <div className="flex items-center gap-2">
                        <span className="text-blue-400">
                          ◷
                        </span>

                        <span>
                          {formatDate(event.start_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-blue-400">
                          ◉
                        </span>

                        <span className="line-clamp-1">
                          {event.venue || "Venue to be announced"}
                        </span>
                      </div>

                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">

                      <span className="text-xs font-medium text-slate-600">
                        EventNest
                      </span>

                      <span className="text-sm font-bold text-blue-400 transition group-hover:translate-x-1">
                        View Event →
                      </span>

                    </div>

                  </div>

                </Link>
              ))}

            </div>
          )}

          {/* EMPTY */}

          {!loadingEvents && events.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
                📅
              </div>

              <h3 className="mt-5 text-xl font-bold">
                No published events yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Published EventNest events will appear here
                when they are available.
              </p>

              <Link
                href="/events"
                className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Browse Events
              </Link>

            </div>
          )}

        </div>

      </section>

      {/* =====================================================
          HOW EVENTNEST WORKS
      ====================================================== */}

      <section className="border-y border-white/[0.06] bg-white/[0.018]">

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">

          <div className="text-center">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              Simple process
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              From discovery to check-in
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              EventNest keeps the participant journey simple,
              from finding an event to entering it with a
              digital ticket.
            </p>

          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-4">

            {[
              {
                number: "01",
                icon: "✦",
                title: "Discover",
                description:
                  "Browse published events and find something interesting.",
              },
              {
                number: "02",
                icon: "◎",
                title: "Explore",
                description:
                  "View event details, competitions, venues and schedules.",
              },
              {
                number: "03",
                icon: "✓",
                title: "Register",
                description:
                  "Choose a competition and complete your registration.",
              },
              {
                number: "04",
                icon: "▣",
                title: "Check In",
                description:
                  "Get your digital ticket and use your QR code at the event.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-blue-500/20"
              >

                <div className="flex items-center justify-between">

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    {step.icon}
                  </span>

                  <span className="text-3xl font-black text-white/[0.06]">
                    {step.number}
                  </span>

                </div>

                <h3 className="mt-6 text-lg font-bold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          ORGANIZER
      ====================================================== */}

      <section className="px-5 py-20 sm:px-8 lg:px-10">

        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/15 via-indigo-500/10 to-transparent px-6 py-14 text-center sm:px-12 sm:py-16">

          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[100px]" />

          <div className="relative">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              For event organizers
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Your event. One platform.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Create events, organize competitions, manage
              registrations, coordinate your team and handle
              participant check-ins from EventNest.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                href={user ? getDashboardPath() : "/login"}
                className="rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-500"
              >
                {user ? "Open Dashboard →" : "Get Started →"}
              </Link>

              <Link
                href="/about"
                className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Learn More
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-white/10 bg-[#010612]">

        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 font-black">
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

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">

            <Link
              href="/"
              className="transition hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/events"
              className="transition hover:text-white"
            >
              Events
            </Link>

            <Link
              href="/about"
              className="transition hover:text-white"
            >
              About
            </Link>

            {user ? (
              <>
                <Link
                  href={getDashboardPath()}
                  className="transition hover:text-white"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="transition hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="transition hover:text-white"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="transition hover:text-white"
                >
                  Register
                </Link>
              </>
            )}

          </div>

        </div>

        <div className="border-t border-white/5 py-5 text-center text-xs text-slate-600">
          © 2026 EventNest. Smart Event Management System.
        </div>

      </footer>

    </main>
  );
}