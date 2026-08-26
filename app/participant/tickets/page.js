"use client";

import Link from "next/link";
import { useState } from "react";

export default function MyTicketsPage() {
  const [filter, setFilter] = useState("All");

  const tickets = [
    {
      id: "EVT-2026-00124",
      event: "Tech Hackathon 2026",
      category: "Technology",
      date: "20 August 2026",
      time: "10:00 AM",
      venue: "Main Auditorium",
      status: "Confirmed",
      icon: "💻",
    },
    {
      id: "EVT-2026-00131",
      event: "AI Innovation Challenge",
      category: "Technology",
      date: "25 August 2026",
      time: "11:30 AM",
      venue: "Computer Lab",
      status: "Confirmed",
      icon: "🤖",
    },
    {
      id: "EVT-2026-00089",
      event: "Web Design Competition",
      category: "Design",
      date: "10 July 2026",
      time: "09:30 AM",
      venue: "Design Studio",
      status: "Used",
      icon: "🎨",
    },
  ];

  const filteredTickets =
    filter === "All"
      ? tickets
      : tickets.filter((ticket) => ticket.status === filter);

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
            href="/participant/registrations"
          />

          <NavItem
            icon="▣"
            title="My Tickets"
            active
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
              My Tickets
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Access all your event tickets in one place.
            </p>

          </div>


          <div className="hidden items-center gap-3 sm:flex">

            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10">
              🔔
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2">

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
              Your Event Passes
            </p>

            <h1 className="text-3xl font-bold lg:text-4xl">
              All Your Tickets
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              View, manage and access the QR tickets for your registered
              events.
            </p>

          </div>


          {/* Statistics */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">

            <StatCard
              number="3"
              label="Total Tickets"
              icon="🎫"
            />

            <StatCard
              number="2"
              label="Confirmed"
              icon="✓"
            />

            <StatCard
              number="1"
              label="Used"
              icon="✓"
            />

          </div>


          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">

            {["All", "Confirmed", "Used"].map((item) => (

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

            ))}

          </div>


          {/* Tickets */}
          {filteredTickets.length > 0 ? (

            <div className="space-y-5">

              {filteredTickets.map((ticket) => (

                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                />

              ))}

            </div>

          ) : (

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] py-20 text-center">

              <div className="text-5xl">
                🎫
              </div>

              <h3 className="mt-4 text-xl font-bold">
                No tickets found
              </h3>

              <p className="mt-2 text-gray-500">
                Your tickets will appear here after registration.
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


/* ================= TICKET CARD ================= */

function TicketCard({ ticket }) {
  const isConfirmed = ticket.status === "Confirmed";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-blue-500/30">

      <div className="grid lg:grid-cols-[1fr_220px]">

        {/* Ticket Information */}
        <div className="p-6">

          <div className="flex flex-col justify-between gap-5 sm:flex-row">

            <div className="flex gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-3xl">
                {ticket.icon}
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-xl font-bold">
                    {ticket.event}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isConfirmed
                        ? "bg-green-500/10 text-green-400"
                        : "bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {isConfirmed ? "✓ " : ""}
                    {ticket.status}
                  </span>

                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {ticket.category}
                </p>

              </div>

            </div>

          </div>


          {/* Details */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <Detail
              icon="📅"
              label="Date"
              value={ticket.date}
            />

            <Detail
              icon="◷"
              label="Time"
              value={ticket.time}
            />

            <Detail
              icon="📍"
              label="Venue"
              value={ticket.venue}
            />

            <Detail
              icon="🔢"
              label="Ticket ID"
              value={ticket.id}
            />

          </div>


          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">

            <Link
             href={`/participant/tickets/${ticket.id}`}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
            >
              View Ticket
            </Link>

            {isConfirmed && (
              <button
                onClick={() => alert("QR viewer will be connected later.")}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.08]"
              >
                ▣ View QR
              </button>
            )}

          </div>

        </div>


        {/* QR Preview */}
        <div className="flex flex-col items-center justify-center border-t border-white/10 bg-[#08152b]/60 p-6 lg:border-l lg:border-t-0">

          <div className="rounded-xl bg-white p-3">

            <div className="grid h-32 w-32 grid-cols-7 gap-0.5">

              {qrPattern.map((filled, index) => (

                <div
                  key={index}
                  className={filled ? "bg-black" : "bg-white"}
                />

              ))}

            </div>

          </div>

          <p className="mt-3 text-xs text-gray-500">
            {isConfirmed ? "Scan at entrance" : "Ticket used"}
          </p>

        </div>

      </div>

    </div>
  );
}


/* ================= DETAIL ================= */

function Detail({ icon, label, value }) {
  return (
    <div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{icon}</span>
        <span>{label}</span>
      </div>

      <p className="mt-1 truncate text-sm font-medium text-gray-300">
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


/* ================= DEMO QR ================= */

const qrPattern = [
  1, 1, 1, 1, 1, 0, 1,
  1, 0, 0, 0, 1, 1, 0,
  1, 0, 1, 0, 1, 0, 1,
  1, 0, 0, 0, 1, 1, 1,
  1, 1, 1, 1, 1, 0, 1,
  0, 1, 0, 1, 0, 1, 0,
  1, 0, 1, 1, 1, 0, 1,

  1, 0, 1, 0, 1, 1, 0,
  0, 1, 0, 1, 0, 0, 1,
  1, 1, 1, 0, 1, 1, 0,
  0, 0, 1, 1, 0, 1, 1,
  1, 0, 1, 0, 1, 0, 1,
  0, 1, 1, 1, 0, 1, 0,
  1, 0, 0, 1, 1, 0, 1,

  1, 1, 1, 1, 1, 0, 1,
  1, 0, 0, 0, 1, 1, 0,
  1, 0, 1, 0, 1, 0, 1,
  1, 0, 0, 0, 1, 1, 1,
  1, 1, 1, 1, 1, 0, 1,
  0, 1, 0, 1, 0, 1, 0,
  1, 1, 0, 0, 1, 0, 1,
];