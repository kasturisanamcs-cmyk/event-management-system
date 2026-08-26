"use client";

import Link from "next/link";
import { useState } from "react";

export default function MyRegistrationsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const registrations = [
    {
      id: "EVT-2026-00124",
      event: "Tech Hackathon 2026",
      category: "Technology",
      registeredOn: "15 August 2026",
      eventDate: "20 August 2026",
      venue: "Main Auditorium",
      payment: "Paid",
      status: "Confirmed",
      icon: "💻",
    },
    {
      id: "EVT-2026-00131",
      event: "AI Innovation Challenge",
      category: "Technology",
      registeredOn: "14 August 2026",
      eventDate: "25 August 2026",
      venue: "Computer Lab",
      payment: "Paid",
      status: "Confirmed",
      icon: "🤖",
    },
    {
      id: "EVT-2026-00089",
      event: "Web Design Competition",
      category: "Design",
      registeredOn: "02 July 2026",
      eventDate: "10 July 2026",
      venue: "Design Studio",
      payment: "Paid",
      status: "Completed",
      icon: "🎨",
    },
    {
      id: "EVT-2026-00072",
      event: "Photography Contest",
      category: "Creative",
      registeredOn: "28 June 2026",
      eventDate: "08 September 2026",
      venue: "Seminar Hall",
      payment: "Pending",
      status: "Pending",
      icon: "📸",
    },
  ];

  const filteredRegistrations = registrations.filter((registration) => {
    const matchesSearch =
      registration.event.toLowerCase().includes(search.toLowerCase()) ||
      registration.id.toLowerCase().includes(search.toLowerCase()) ||
      registration.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || registration.status === filter;

    return matchesSearch && matchesFilter;
  });

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

          <button className="w-full rounded-xl border border-white/10 px-4 py-3 text-left text-gray-400 transition hover:bg-red-500/10 hover:text-red-400">
            ↪ Logout
          </button>

        </div>

      </aside>


      {/* Main */}
      <main className="lg:ml-64">

        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#08152b]/90 px-6 py-5 backdrop-blur-xl lg:px-8">

          <div>

            <h2 className="text-2xl font-bold">
              My Registrations
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Track all your event registrations and payment status.
            </p>

          </div>

          <div className="hidden items-center gap-3 sm:flex">

            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10">
              🔔
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-2 py-2 pr-4">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold">
                U
              </div>

              <div>

                <p className="text-sm font-semibold">
                  Participant
                </p>

                <p className="text-xs text-gray-400">
                  Student
                </p>

              </div>

            </div>

          </div>

        </header>


        {/* Content */}
        <section className="p-6 lg:p-8">

          {/* Intro */}
          <div className="mb-8">

            <p className="mb-2 text-blue-400">
              Registration Center
            </p>

            <h1 className="text-3xl font-bold lg:text-4xl">
              Track Your Registrations
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              Keep track of the events you've joined, payment status,
              and registration progress.
            </p>

          </div>


          {/* Statistics */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              number="4"
              label="Total Registrations"
              icon="📋"
            />

            <StatCard
              number="2"
              label="Confirmed"
              icon="✓"
            />

            <StatCard
              number="1"
              label="Pending"
              icon="◷"
            />

            <StatCard
              number="1"
              label="Completed"
              icon="🏆"
            />

          </div>


          {/* Search + Filter */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row">

            {/* Search */}
            <div className="relative flex-1">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                🔎
              </span>

              <input
                type="text"
                placeholder="Search by event, category or registration ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
              />

            </div>

          </div>


          {/* Filter Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">

            {["All", "Confirmed", "Pending", "Completed"].map(
              (item) => (

                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                    filter === item
                      ? "bg-blue-600 text-white"
                      : "border border-white/10 bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {item}
                </button>

              )
            )}

          </div>


          {/* Result Count */}
          <div className="mb-4">

            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="text-gray-300">
                {filteredRegistrations.length}
              </span>{" "}
              registration
              {filteredRegistrations.length !== 1 ? "s" : ""}
            </p>

          </div>


          {/* Registration List */}
          {filteredRegistrations.length > 0 ? (

            <div className="space-y-5">

              {filteredRegistrations.map((registration) => (

                <RegistrationCard
                  key={registration.id}
                  registration={registration}
                />

              ))}

            </div>

          ) : (

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] py-20 text-center">

              <div className="text-5xl">
                📋
              </div>

              <h3 className="mt-4 text-xl font-bold">
                No registrations found
              </h3>

              <p className="mt-2 text-gray-500">
                Try another search or filter.
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


/* ================= REGISTRATION CARD ================= */

function RegistrationCard({ registration }) {
  const isConfirmed = registration.status === "Confirmed";
  const isPending = registration.status === "Pending";
  const isCompleted = registration.status === "Completed";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-blue-500/30">

      <div className="p-6">

        {/* Top */}
        <div className="flex flex-col justify-between gap-5 lg:flex-row">

          <div className="flex gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-3xl">
              {registration.icon}
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h2 className="text-xl font-bold">
                  {registration.event}
                </h2>

                <StatusBadge
                  status={registration.status}
                />

              </div>

              <p className="mt-1 text-sm text-gray-500">
                {registration.category}
              </p>

            </div>

          </div>


          {/* Registration ID */}
          <div className="lg:text-right">

            <p className="text-xs text-gray-500">
              Registration ID
            </p>

            <p className="mt-1 font-mono text-sm text-gray-300">
              {registration.id}
            </p>

          </div>

        </div>


        {/* Information */}
        <div className="mt-6 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2 xl:grid-cols-4">

          <Info
            icon="📅"
            label="Event Date"
            value={registration.eventDate}
          />

          <Info
            icon="📍"
            label="Venue"
            value={registration.venue}
          />

          <Info
            icon="🗓️"
            label="Registered On"
            value={registration.registeredOn}
          />

          <Info
            icon="💳"
            label="Payment"
            value={registration.payment}
          />

        </div>


        {/* Bottom */}
        <div className="mt-6 flex flex-col justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center">

          <div>

            {isConfirmed && (
              <p className="text-sm text-green-400">
                ✓ Registration confirmed
              </p>
            )}

            {isPending && (
              <p className="text-sm text-yellow-400">
                ◷ Payment/registration pending
              </p>
            )}

            {isCompleted && (
              <p className="text-sm text-gray-400">
                ✓ Event completed
              </p>
            )}

          </div>


          <div className="flex flex-wrap gap-3">

            {isConfirmed && (
              <Link
                href="/participant/tickets"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
              >
                View Ticket
              </Link>
            )}

            {isPending && (
              <button
                type="button"
                onClick={() =>
                  alert("Payment continuation will be connected later.")
                }
                className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-yellow-400"
              >
                Complete Payment
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                alert("Registration details will be connected later.")
              }
              className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.08]"
            >
              View Details
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


/* ================= STATUS ================= */

function StatusBadge({ status }) {
  const styles = {
    Confirmed: "bg-green-500/10 text-green-400",
    Pending: "bg-yellow-500/10 text-yellow-400",
    Completed: "bg-gray-500/10 text-gray-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status]
      }`}
    >
      {status === "Confirmed" && "✓ "}
      {status === "Pending" && "◷ "}
      {status === "Completed" && "✓ "}
      {status}
    </span>
  );
}


/* ================= INFO ================= */

function Info({ icon, label, value }) {
  return (
    <div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{icon}</span>
        <span>{label}</span>
      </div>

      <p className="mt-1 text-sm font-medium text-gray-300">
        {value}
      </p>

    </div>
  );
}


/* ================= STAT CARD ================= */

function StatCard({ number, label, icon }) {
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


/* ================= NAVIGATION ================= */

function NavItem({ icon, title, href, active }) {
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

      <span>
        {title}
      </span>

    </Link>
  );
}