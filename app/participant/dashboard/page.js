"use client";

import { useState } from "react";

export default function ParticipantDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Browse Events", icon: "◈" },
    { name: "My Registrations", icon: "✓" },
    { name: "My Tickets", icon: "▣" },
    { name: "Schedule", icon: "◷" },
    { name: "Announcements", icon: "🔔" },
  ];

  return (
    <div className="min-h-screen bg-[#071225] text-white">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-[#08152b] p-5">

        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold">
            E
          </div>

          <div>
            <h1 className="text-lg font-bold">EventHub AI</h1>
            <p className="text-xs text-gray-400">Smart Event Management</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActivePage(item.name)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                activePage === item.name
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-5 left-5 right-5">
          <button className="w-full rounded-xl border border-white/10 px-4 py-3 text-left text-gray-400 transition hover:bg-red-500/10 hover:text-red-400">
            ↪ Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 bg-[#08152b]/80 px-8 py-5 backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-bold">
              {activePage}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Manage your event activities from here.
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* Notification */}
            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10">
              🔔
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold">
                U
              </div>

              <div>
                <p className="text-sm font-semibold">Participant</p>
                <p className="text-xs text-gray-400">Student</p>
              </div>
            </div>

          </div>
        </header>

        {/* Dashboard */}
        <section className="p-8">

          {/* Welcome */}
          <div className="mb-8">
            <p className="mb-2 text-blue-400">Welcome back 👋</p>

            <h1 className="text-4xl font-bold">
              Ready for your next event?
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              Discover competitions, register for events, manage your tickets
              and stay updated with announcements.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Registered Events"
              value="3"
              icon="🎟️"
            />

            <StatCard
              title="Upcoming Events"
              value="2"
              icon="📅"
            />

            <StatCard
              title="Active Tickets"
              value="2"
              icon="▣"
            />

            <StatCard
              title="Completed Events"
              value="5"
              icon="🏆"
            />

          </div>

          {/* Main Grid */}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">

            {/* Upcoming Events */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-6">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Upcoming Events</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Your registered upcoming events
                  </p>
                </div>

                <button className="text-sm text-blue-400 hover:text-blue-300">
                  View all →
                </button>
              </div>

              <EventCard
                title="Tech Hackathon 2026"
                date="20 August 2026"
                time="10:00 AM"
                location="Main Auditorium"
                status="Registered"
              />

              <EventCard
                title="AI Innovation Challenge"
                date="25 August 2026"
                time="11:30 AM"
                location="Computer Lab"
                status="Registered"
              />

            </div>

            {/* Announcements */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

              <h3 className="text-xl font-bold">
                Announcements
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                Latest event updates
              </p>

              <div className="mt-6 space-y-4">

                <Announcement
                  title="Hackathon registration closes soon"
                  time="2 hours ago"
                />

                <Announcement
                  title="Venue updated for AI Challenge"
                  time="Yesterday"
                />

                <Announcement
                  title="New competition added"
                  time="2 days ago"
                />

              </div>

            </div>

          </div>

          {/* Quick Actions */}
          <div className="mt-8">

            <h3 className="mb-4 text-xl font-bold">
              Quick Actions
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <QuickAction
                icon="🔎"
                title="Browse Events"
                description="Find new competitions"
              />

              <QuickAction
                icon="🎟️"
                title="My Tickets"
                description="View your QR tickets"
              />

              <QuickAction
                icon="📅"
                title="View Schedule"
                description="Check event timings"
              />

              <QuickAction
                icon="👤"
                title="My Profile"
                description="Update your information"
              />

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}


/* ---------- Components ---------- */

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:bg-white/[0.07]">

      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
          {icon}
        </div>

        <span className="text-3xl font-bold text-blue-400">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm text-gray-400">
        {title}
      </p>
    </div>
  );
}


function EventCard({
  title,
  date,
  time,
  location,
  status,
}) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-[#0b1b35] p-5 sm:flex-row sm:items-center">

      <div>
        <h4 className="font-semibold">
          {title}
        </h4>

        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-400">
          <span>📅 {date}</span>
          <span>◷ {time}</span>
          <span>📍 {location}</span>
        </div>
      </div>

      <span className="w-fit rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
        {status}
      </span>

    </div>
  );
}


function Announcement({ title, time }) {
  return (
    <div className="border-b border-white/10 pb-4 last:border-0">

      <p className="text-sm font-medium">
        {title}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {time}
      </p>

    </div>
  );
}


function QuickAction({ icon, title, description }) {
  return (
    <button className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-blue-500/5">

      <div className="text-2xl">
        {icon}
      </div>

      <h4 className="mt-4 font-semibold">
        {title}
      </h4>

      <p className="mt-1 text-sm text-gray-400">
        {description}
      </p>

    </button>
  );
}