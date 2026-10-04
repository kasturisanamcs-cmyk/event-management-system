"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MyRegistrationsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [registrations, setRegistrations] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    setLoading(true);
    setError("");

    try {
      // --------------------------------------------------
      // 1. Get logged-in user
      // --------------------------------------------------

      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(authError.message);
      }

      if (!currentUser) {
        throw new Error("Please log in to view your registrations.");
      }

      setUser(currentUser);

      // --------------------------------------------------
      // 2. Get participant registrations
      // --------------------------------------------------

      const {
        data: registrationData,
        error: registrationError,
      } = await supabase
        .from("registrations")
        .select(
          `
            id,
            user_id,
            competition_id,
            registration_number,
            status,
            registered_at,
            session_id,
            participant_name,
            participant_email,
            phone,
            college,
            student_id,
            participation_type,
            participation_mode
          `
        )
        .eq("user_id", currentUser.id)
        .order("registered_at", {
          ascending: false,
        });

      if (registrationError) {
        throw new Error(
          registrationError.message ||
            "Unable to load your registrations."
        );
      }

      const safeRegistrations = registrationData || [];

      // --------------------------------------------------
      // 3. Nothing registered
      // --------------------------------------------------

      if (safeRegistrations.length === 0) {
        setRegistrations([]);
        return;
      }

      // --------------------------------------------------
      // 4. Collect IDs
      // --------------------------------------------------

      const competitionIds = [
        ...new Set(
          safeRegistrations
            .map((item) => item.competition_id)
            .filter(Boolean)
        ),
      ];

      const sessionIds = [
        ...new Set(
          safeRegistrations
            .map((item) => item.session_id)
            .filter(Boolean)
        ),
      ];

      const registrationIds = safeRegistrations.map(
        (item) => item.id
      );

      // --------------------------------------------------
      // 5. Load competitions
      // --------------------------------------------------

      let competitionData = [];

      if (competitionIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from("competitions")
          .select(
            `
              id,
              event_id,
              name,
              description,
              registration_fee,
              capacity,
              competition_date,
              start_time,
              end_time,
              venue,
              status,
              poster_url
            `
          )
          .in("id", competitionIds);

        if (error) {
          console.warn(
            "Competition loading warning:",
            error.message
          );
        } else {
          competitionData = data || [];
        }
      }

      // --------------------------------------------------
      // 6. Load sessions
      // --------------------------------------------------

      let sessionData = [];

      if (sessionIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from("competition_sessions")
          .select(
            `
              id,
              competition_id,
              session_name,
              session_date,
              start_time,
              end_time,
              venue
            `
          )
          .in("id", sessionIds);

        if (error) {
          console.warn(
            "Session loading warning:",
            error.message
          );
        } else {
          sessionData = data || [];
        }
      }

      // --------------------------------------------------
      // 7. Load events
      // --------------------------------------------------

      const eventIds = [
        ...new Set(
          competitionData
            .map((competition) => competition.event_id)
            .filter(Boolean)
        ),
      ];

      let eventData = [];

      if (eventIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from("events")
          .select(
            `
              id,
              name,
              description,
              start_date,
              end_date,
              venue,
              event_image
            `
          )
          .in("id", eventIds);

        if (error) {
          console.warn(
            "Event loading warning:",
            error.message
          );
        } else {
          eventData = data || [];
        }
      }

      // --------------------------------------------------
      // 8. Load payments
      // --------------------------------------------------

      let paymentData = [];

      if (registrationIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from("payments")
          .select(
            `
              id,
              registration_id,
              amount,
              payment_method,
              payment_status,
              gateway_payment_id,
              paid_at,
              verified_at,
              created_at
            `
          )
          .in("registration_id", registrationIds);

        if (error) {
          console.warn(
            "Payment loading warning:",
            error.message
          );
        } else {
          paymentData = data || [];
        }
      }

      // --------------------------------------------------
      // 9. Load tickets
      // --------------------------------------------------

      let ticketData = [];

      if (registrationIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from("tickets")
          .select(
            `
              id,
              registration_id,
              ticket_number,
              qr_token,
              status,
              issued_at,
              used_at
            `
          )
          .in("registration_id", registrationIds);

        if (error) {
          console.warn(
            "Ticket loading warning:",
            error.message
          );
        } else {
          ticketData = data || [];
        }
      }

      // --------------------------------------------------
      // 10. Create lookup maps
      // --------------------------------------------------

      const competitionMap = new Map(
        competitionData.map((item) => [
          item.id,
          item,
        ])
      );

      const sessionMap = new Map(
        sessionData.map((item) => [
          item.id,
          item,
        ])
      );

      const eventMap = new Map(
        eventData.map((item) => [
          item.id,
          item,
        ])
      );

      const paymentMap = new Map();

      paymentData.forEach((payment) => {
        paymentMap.set(
          payment.registration_id,
          payment
        );
      });

      const ticketMap = new Map();

      ticketData.forEach((ticket) => {
        ticketMap.set(
          ticket.registration_id,
          ticket
        );
      });

      // --------------------------------------------------
      // 11. Build complete registration objects
      // --------------------------------------------------

      const completeRegistrations = safeRegistrations.map(
        (registration) => {
          const competition =
            competitionMap.get(
              registration.competition_id
            ) || null;

          const session =
            sessionMap.get(
              registration.session_id
            ) || null;

          const event =
            competition?.event_id
              ? eventMap.get(competition.event_id) || null
              : null;

          const payment =
            paymentMap.get(registration.id) || null;

          const ticket =
            ticketMap.get(registration.id) || null;

          const effectiveEndDate =
            event?.end_date ||
            competition?.competition_date ||
            null;

          const isEventCompleted =
            effectiveEndDate &&
            new Date(effectiveEndDate).getTime() <
              new Date().setHours(0, 0, 0, 0);

          let displayStatus = normalizeStatus(
            registration.status
          );

          // A confirmed registration becomes "Completed"
          // only after the event date has passed.
          if (
            displayStatus === "Confirmed" &&
            isEventCompleted
          ) {
            displayStatus = "Completed";
          }

          const paymentStatus =
            getPaymentStatus({
              registration,
              payment,
              competition,
            });

          return {
            ...registration,

            competition,
            session,
            event,
            payment,
            ticket,

            displayStatus,
            paymentStatus,

            participationMode:
              registration.participation_mode ||
              "OFFLINE",

            participationType:
              registration.participation_type ||
              "Individual",
          };
        }
      );

      setRegistrations(completeRegistrations);
    } catch (err) {
      console.error(
        "My registrations error:",
        err
      );

      setError(
        err.message ||
          "Unable to load your registrations."
      );
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------------
  // Statistics
  // ------------------------------------------------------

  const statistics = useMemo(() => {
    return {
      total: registrations.length,

      confirmed: registrations.filter(
        (registration) =>
          registration.displayStatus ===
          "Confirmed"
      ).length,

      pending: registrations.filter(
        (registration) =>
          registration.displayStatus ===
          "Pending"
      ).length,

      completed: registrations.filter(
        (registration) =>
          registration.displayStatus ===
          "Completed"
      ).length,
    };
  }, [registrations]);

  // ------------------------------------------------------
  // Search + Filter
  // ------------------------------------------------------

  const filteredRegistrations = useMemo(() => {
    const cleanSearch =
      search.trim().toLowerCase();

    return registrations.filter(
      (registration) => {
        const competitionName =
          registration.competition?.name ||
          "";

        const eventName =
          registration.event?.name ||
          "";

        const registrationNumber =
          registration.registration_number ||
          "";

        const participationMode =
          registration.participationMode ||
          "";

        const participationType =
          registration.participationType ||
          "";

        const matchesSearch =
          !cleanSearch ||
          competitionName
            .toLowerCase()
            .includes(cleanSearch) ||
          eventName
            .toLowerCase()
            .includes(cleanSearch) ||
          registrationNumber
            .toLowerCase()
            .includes(cleanSearch) ||
          participationMode
            .toLowerCase()
            .includes(cleanSearch) ||
          participationType
            .toLowerCase()
            .includes(cleanSearch);

        const matchesFilter =
          filter === "All" ||
          registration.displayStatus ===
            filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );
  }, [
    registrations,
    search,
    filter,
  ]);

  // ------------------------------------------------------
  // Loading
  // ------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071225] text-white">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

            <p className="mt-5 text-sm text-gray-400">
              Loading your registrations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------
  // Main page
  // ------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#071225] text-white">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-[#08152b] p-5 lg:block">

        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold">
            E
          </div>

          <div>
            <h1 className="text-lg font-bold">
              EventHub AI
            </h1>

            <p className="text-xs text-gray-400">
              Smart Event Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <NavItem
            icon="⌂"
            title="Dashboard"
            href="/participant/dashboard"
          />

          <NavItem
            icon="◈"
            title="Browse Events"
            href="/participant/events"
          />

          <NavItem
            icon="✓"
            title="My Registrations"
            active
          />

          <NavItem
            icon="▣"
            title="My Tickets"
            href="/participant/tickets"
          />

          <NavItem
            icon="◷"
            title="Schedule"
            href="/participant/schedule"
          />

          <NavItem
            icon="🔔"
            title="Announcements"
            href="/participant/announcements"
          />
        </nav>

        {/* Logout */}
        <div className="absolute bottom-5 left-5 right-5">
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="w-full rounded-xl border border-white/10 px-4 py-3 text-left text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">

        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#08152b]/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">

          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              My Registrations
            </h2>

            <p className="mt-1 hidden text-sm text-gray-400 sm:block">
              Track your event registrations and payment status.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 transition hover:bg-white/10"
            >
              🔔
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-2 py-2 pr-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold">
                {getInitial(
                  user?.user_metadata?.full_name ||
                    user?.user_metadata?.name ||
                    user?.email
                )}
              </div>

              <div className="hidden sm:block">
                <p className="max-w-[140px] truncate text-sm font-semibold">
                  {user?.user_metadata?.full_name ||
                    user?.user_metadata?.name ||
                    "Participant"}
                </p>

                <p className="text-xs text-gray-400">
                  Participant
                </p>
              </div>

            </div>
          </div>
        </header>

        {/* Content */}
        <section className="p-4 sm:p-6 lg:p-8">

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
              {error}

              <button
                type="button"
                onClick={loadRegistrations}
                className="ml-3 font-semibold text-white underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Intro */}
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-blue-400">
              Registration Center
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Track Your Registrations
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
              Keep track of the competitions you joined,
              payment status, participation mode, and
              registration progress.
            </p>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              number={statistics.total}
              label="Total Registrations"
              icon="📋"
            />

            <StatCard
              number={statistics.confirmed}
              label="Confirmed"
              icon="✓"
            />

            <StatCard
              number={statistics.pending}
              label="Pending"
              icon="◷"
            />

            <StatCard
              number={statistics.completed}
              label="Completed"
              icon="🏆"
            />

          </div>

          {/* Search */}
          <div className="mb-5">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                🔎
              </span>

              <input
                type="text"
                placeholder="Search competition, event, registration ID, mode..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              "All",
              "Confirmed",
              "Pending",
              "Completed",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                  filter === item
                    ? "bg-blue-600 text-white"
                    : "border border-white/10 bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Result Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="text-gray-300">
                {filteredRegistrations.length}
              </span>{" "}
              registration
              {filteredRegistrations.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          {/* Registration List */}
          {filteredRegistrations.length > 0 ? (
            <div className="space-y-5">

              {filteredRegistrations.map(
                (registration) => (
                  <RegistrationCard
                    key={registration.id}
                    registration={registration}
                  />
                )
              )}

            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-20 text-center">

              <div className="text-5xl">
                📋
              </div>

              <h3 className="mt-4 text-xl font-bold">
                {registrations.length === 0
                  ? "No registrations yet"
                  : "No registrations found"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                {registrations.length === 0
                  ? "You have not registered for any competition yet. Browse events to find a competition."
                  : "Try another search term or filter."}
              </p>

              <Link
                href="/participant/events"
                className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
              >
                Browse Events
              </Link>

            </div>
          )}

        </section>
      </main>
    </div>
  );
}


/* ============================================================
   REGISTRATION CARD
============================================================ */

function RegistrationCard({ registration }) {
  const {
    competition,
    event,
    session,
    payment,
    ticket,
  } = registration;

  const status =
    registration.displayStatus;

  const mode =
    registration.participationMode;

  const type =
    registration.participationType;

  const isConfirmed =
    status === "Confirmed";

  const isPending =
    status === "Pending";

  const isCompleted =
    status === "Completed";

  const isOnline =
    mode === "ONLINE";

  const isOffline =
    mode === "OFFLINE";

  const fee = Number(
    competition?.registration_fee || 0
  );

  const eventDate =
    event?.start_date ||
    competition?.competition_date;

  const venue =
    session?.venue ||
    competition?.venue ||
    event?.venue ||
    "Not specified";

  const paymentStatus =
    registration.paymentStatus;

  const paymentPending =
    paymentStatus === "Pending";

  const paymentConfirmed =
    paymentStatus === "Paid" ||
    paymentStatus === "Verified";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-blue-500/30">

      <div className="p-5 sm:p-6">

        {/* Top */}
        <div className="flex flex-col justify-between gap-5 xl:flex-row">

          <div className="flex gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
              {getCompetitionIcon(
                competition?.name
              )}
            </div>

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="text-lg font-bold sm:text-xl">
                  {competition?.name ||
                    "Competition"}
                </h2>

                <StatusBadge
                  status={status}
                />

              </div>

              <p className="mt-1 text-sm text-gray-500">
                {event?.name ||
                  "Event"}
              </p>

            </div>
          </div>

          {/* Registration ID */}
          <div className="xl:text-right">

            <p className="text-xs text-gray-500">
              Registration ID
            </p>

            <p className="mt-1 break-all font-mono text-sm text-gray-300">
              {registration.registration_number ||
                registration.id}
            </p>

          </div>

        </div>

        {/* Badges */}
        <div className="mt-5 flex flex-wrap gap-2">

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              isOnline
                ? "bg-blue-500/10 text-blue-300"
                : "bg-orange-500/10 text-orange-300"
            }`}
          >
            {isOnline
              ? "🌐 Online"
              : "📍 Offline"}
          </span>

          <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300">
            {type === "Team"
              ? "👥 Team"
              : "👤 Individual"}
          </span>

          {session?.session_name && (
            <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300">
              🗓️ {session.session_name}
            </span>
          )}

        </div>

        {/* Information */}
        <div className="mt-6 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2 xl:grid-cols-4">

          <Info
            icon="📅"
            label="Event Date"
            value={formatDate(eventDate)}
          />

          <Info
            icon="📍"
            label="Venue"
            value={venue}
          />

          <Info
            icon="🗓️"
            label="Registered On"
            value={formatDateTime(
              registration.registered_at
            )}
          />

          <Info
            icon="💰"
            label="Registration Fee"
            value={
              fee > 0
                ? `₹${fee.toLocaleString(
                    "en-IN"
                  )}`
                : "Free"
            }
          />

        </div>

        {/* Session */}
        {session && (
          <div className="mt-5 rounded-2xl border border-blue-400/10 bg-blue-500/5 p-4">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs text-gray-500">
                  Selected Session
                </p>

                <p className="mt-1 font-semibold">
                  {session.session_name ||
                    "Session"}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {formatDate(
                    session.session_date
                  )}

                  {" • "}

                  {formatTime(
                    session.start_time
                  )}

                  {session.end_time
                    ? ` - ${formatTime(
                        session.end_time
                      )}`
                    : ""}
                </p>
              </div>

              <div className="text-left sm:text-right">

                <p className="text-xs text-gray-500">
                  Participation
                </p>

                <p className="mt-1 text-sm font-semibold text-blue-300">
                  {isOnline
                    ? "Online"
                    : "Offline"}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* Payment information */}
        <div className="mt-5 grid gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 sm:grid-cols-2">

          <div>
            <p className="text-xs text-gray-500">
              Payment Status
            </p>

            <div className="mt-1 flex items-center gap-2">
              <PaymentBadge
                status={paymentStatus}
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Payment Method
            </p>

            <p className="mt-1 text-sm font-medium text-gray-300">
              {payment?.payment_method ||
                (isOnline
                  ? "Online Payment"
                  : "Offline Payment")}
            </p>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-6 flex flex-col justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center">

          {/* Status message */}
          <div className="max-w-xl">

            {isConfirmed && (
              <p className="text-sm text-emerald-400">
                ✓ Registration confirmed
                {ticket
                  ? " • Your ticket is ready."
                  : ""}
              </p>
            )}

            {isCompleted && (
              <p className="text-sm text-gray-400">
                ✓ Event completed
              </p>
            )}

            {isPending && isOffline && (
              <div>
                <p className="text-sm font-medium text-orange-300">
                  ◷ Waiting for offline payment approval
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Your registration has been submitted.
                  The organizer or competition member
                  must verify your offline payment before
                  your registration is confirmed.
                </p>
              </div>
            )}

            {isPending && isOnline && (
              <div>
                <p className="text-sm font-medium text-yellow-300">
                  ◷ Online payment pending
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Complete the online payment to confirm
                  your registration.
                </p>
              </div>
            )}

          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">

            {/* Confirmed / Completed -> Ticket */}
            {(isConfirmed ||
              isCompleted) &&
              ticket && (
                <Link
                  href={`/participant/tickets?registrationId=${registration.id}`}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
                >
                  View Ticket
                </Link>
              )}

            {/* Confirmed but no ticket */}
            {(isConfirmed ||
              isCompleted) &&
              !ticket && (
                <Link
                  href="/participant/tickets"
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
                >
                  My Tickets
                </Link>
              )}

            {/* Online + Pending */}
            {isPending &&
              isOnline && (
                <Link
                  href={`/participant/payments?registrationId=${registration.id}`}
                  className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400"
                >
                  Complete Payment
                </Link>
              )}

            {/* Offline + Pending */}
            {isPending &&
              isOffline && (
                <span className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-5 py-3 text-sm font-semibold text-orange-300">
                  Waiting for Approval
                </span>
              )}

            {/* View competition */}
            {competition?.id && (
              <Link
                href={`/participant/events/details/competition/${competition.id}`}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.08]"
              >
                View Details
              </Link>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}


/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  const styles = {
    Confirmed:
      "bg-emerald-500/10 text-emerald-400",
    Pending:
      "bg-yellow-500/10 text-yellow-400",
    Completed:
      "bg-gray-500/10 text-gray-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] ||
        "bg-white/10 text-gray-300"
      }`}
    >
      {status === "Confirmed" && "✓ "}
      {status === "Pending" && "◷ "}
      {status === "Completed" && "✓ "}
      {status}
    </span>
  );
}


/* ============================================================
   PAYMENT BADGE
============================================================ */

function PaymentBadge({ status }) {
  const normalized =
    String(status || "")
      .trim()
      .toLowerCase();

  if (
    normalized === "paid" ||
    normalized === "verified" ||
    normalized === "completed" ||
    normalized === "success" ||
    normalized === "successful"
  ) {
    return (
      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
        ✓ Paid
      </span>
    );
  }

  if (
    normalized === "pending" ||
    normalized === "created"
  ) {
    return (
      <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
        ◷ Pending
      </span>
    );
  }

  if (
    normalized === "failed" ||
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return (
      <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
        ✕ {capitalize(status)}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-gray-400">
      {status || "Not required"}
    </span>
  );
}


/* ============================================================
   INFO
============================================================ */

function Info({ icon, label, value }) {
  return (
    <div className="min-w-0">

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{icon}</span>
        <span>{label}</span>
      </div>

      <p className="mt-1 break-words text-sm font-medium text-gray-300">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  number,
  label,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

      <div className="flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
          {icon}
        </div>

        <span className="text-3xl font-bold text-blue-400">
          {number}
        </span>

      </div>

      <p className="mt-4 text-sm text-gray-400">
        {label}
      </p>

    </div>
  );
}


/* ============================================================
   NAVIGATION
============================================================ */

function NavItem({
  icon,
  title,
  href,
  active,
}) {
  return (
    <Link
      href={href || "#"}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="text-lg">
        {icon}
      </span>

      <span>{title}</span>
    </Link>
  );
}


/* ============================================================
   HELPERS
============================================================ */

function normalizeStatus(status) {
  const value =
    String(status || "")
      .trim()
      .toUpperCase();

  if (
    value === "CONFIRMED" ||
    value === "APPROVED" ||
    value === "SUCCESS" ||
    value === "COMPLETED"
  ) {
    return "Confirmed";
  }

  if (
    value === "PENDING" ||
    value === "AWAITING_PAYMENT" ||
    value === "AWAITING_APPROVAL"
  ) {
    return "Pending";
  }

  return "Pending";
}


function getPaymentStatus({
  registration,
  payment,
  competition,
}) {
  const fee = Number(
    competition?.registration_fee || 0
  );

  // Free competition
  if (fee <= 0) {
    return "Not required";
  }

  // Existing payment record
  if (payment?.payment_status) {
    const value =
      String(payment.payment_status)
        .trim()
        .toUpperCase();

    if (
      value === "PAID" ||
      value === "VERIFIED" ||
      value === "SUCCESS" ||
      value === "SUCCESSFUL" ||
      value === "COMPLETED"
    ) {
      return "Paid";
    }

    if (
      value === "FAILED" ||
      value === "CANCELLED" ||
      value === "CANCELED"
    ) {
      return "Failed";
    }

    return "Pending";
  }

  // Confirmed paid registration without
  // a payment row
  if (
    String(registration.status)
      .toUpperCase() === "CONFIRMED"
  ) {
    return "Paid";
  }

  return "Pending";
}


function formatDate(dateValue) {
  if (!dateValue) {
    return "Not specified";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}


function formatDateTime(dateValue) {
  if (!dateValue) {
    return "Not specified";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


function formatTime(timeValue) {
  if (!timeValue) {
    return "";
  }

  const parts =
    String(timeValue).split(":");

  if (parts.length < 2) {
    return String(timeValue);
  }

  const hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) {
    return String(timeValue);
  }

  const suffix =
    hours >= 12 ? "PM" : "AM";

  const displayHour =
    hours % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
}


function getInitial(value) {
  if (!value) {
    return "U";
  }

  return String(value)
    .trim()
    .charAt(0)
    .toUpperCase();
}


function getCompetitionIcon(name) {
  const value =
    String(name || "").toLowerCase();

  if (
    value.includes("hack") ||
    value.includes("code") ||
    value.includes("program")
  ) {
    return "💻";
  }

  if (
    value.includes("ai") ||
    value.includes("machine")
  ) {
    return "🤖";
  }

  if (
    value.includes("design") ||
    value.includes("ui") ||
    value.includes("web")
  ) {
    return "🎨";
  }

  if (
    value.includes("photo") ||
    value.includes("photography")
  ) {
    return "📸";
  }

  if (
    value.includes("music") ||
    value.includes("sing")
  ) {
    return "🎵";
  }

  if (
    value.includes("dance")
  ) {
    return "💃";
  }

  if (
    value.includes("quiz")
  ) {
    return "🧠";
  }

  if (
    value.includes("sport") ||
    value.includes("cricket") ||
    value.includes("football")
  ) {
    return "🏆";
  }

  return "🏆";
}


function capitalize(value) {
  if (!value) {
    return "";
  }

  const text = String(value);

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1).toLowerCase()
  );
}