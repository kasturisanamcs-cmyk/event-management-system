"use client";

import Link from "next/link";
import { useState } from "react";

export default function AnnouncementsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const announcements = [
    {
      id: 1,
      title: "Tech Hackathon 2026 Registration Confirmed",
      message:
        "Your registration has been successfully confirmed. Please keep your QR ticket and college ID ready for entry.",
      category: "Registration",
      date: "15 Aug 2026",
      time: "10:30 AM",
      priority: "Important",
      icon: "🎫",
      unread: true,
    },
    {
      id: 2,
      title: "Hackathon Venue Updated",
      message:
        "The Tech Hackathon 2026 will be conducted at the Main Auditorium. Please report at least 15 minutes before the event.",
      category: "Venue",
      date: "16 Aug 2026",
      time: "09:15 AM",
      priority: "Important",
      icon: "📍",
      unread: true,
    },
    {
      id: 3,
      title: "AI Innovation Challenge Schedule",
      message:
        "The AI Innovation Challenge will begin at 10:00 AM. Participants should be present in the Computer Lab before the reporting time.",
      category: "Schedule",
      date: "16 Aug 2026",
      time: "08:00 AM",
      priority: "Normal",
      icon: "🤖",
      unread: false,
    },
    {
      id: 4,
      title: "Bring Your College ID",
      message:
        "All participants are required to carry a valid college ID card during event check-in and QR verification.",
      category: "Important",
      date: "17 Aug 2026",
      time: "11:45 AM",
      priority: "Important",
      icon: "⚠️",
      unread: false,
    },
    {
      id: 5,
      title: "Lunch Break Information",
      message:
        "Lunch will be available at the College Cafeteria between 1:00 PM and 2:00 PM for registered participants.",
      category: "General",
      date: "18 Aug 2026",
      time: "01:00 PM",
      priority: "Normal",
      icon: "🍱",
      unread: false,
    },
  ];

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(search.toLowerCase()) ||
      announcement.message.toLowerCase().includes(search.toLowerCase()) ||
      announcement.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Unread" && announcement.unread) ||
      announcement.category === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#071225] text-white">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-[#08152b] p-5 lg:block">

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
            active
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
              Announcements
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Stay updated with the latest event information.
            </p>

          </div>


          <div className="hidden items-center gap-3 sm:flex">

            <div className="relative">

              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                🔔
              </span>

              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />

            </div>

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
              Event Updates
            </p>

            <h1 className="text-3xl font-bold lg:text-4xl">
              Important Announcements
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              Get the latest updates about your registered events,
              schedules, venues and important instructions.
            </p>

          </div>


          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">

            <StatCard
              number="5"
              label="Total Announcements"
              icon="📢"
            />

            <StatCard
              number="2"
              label="Unread"
              icon="🔵"
            />

            <StatCard
              number="2"
              label="Important"
              icon="⚠️"
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search announcements..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
              />

            </div>

          </div>


          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">

            {[
              "All",
              "Unread",
              "Important",
              "Registration",
              "Schedule",
              "Venue",
            ].map((item) => (

              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  filter === item
                    ? "bg-blue-600 text-white"
                    : "border border-white/10 bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {item}
              </button>

            ))}

          </div>


          {/* Result */}
          <div className="mb-4">

            <p className="text-sm text-gray-500">
              {filteredAnnouncements.length} announcement
              {filteredAnnouncements.length !== 1 ? "s" : ""}
            </p>

          </div>


          {/* Announcements */}
          {filteredAnnouncements.length > 0 ? (

            <div className="space-y-4">

              {filteredAnnouncements.map((announcement) => (

                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                />

              ))}

            </div>

          ) : (

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] py-20 text-center">

              <div className="text-5xl">
                📢
              </div>

              <h3 className="mt-4 text-xl font-bold">
                No announcements found
              </h3>

              <p className="mt-2 text-gray-500">
                Try another search or filter.
              </p>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}


/* ================= ANNOUNCEMENT CARD ================= */

function AnnouncementCard({ announcement }) {

  return (
    <div
      className={`rounded-2xl border p-5 transition sm:p-6 ${
        announcement.unread
          ? "border-blue-500/20 bg-blue-500/[0.04]"
          : "border-white/10 bg-white/[0.04]"
      } hover:border-blue-500/30`}
    >

      <div className="flex gap-4">

        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
          {announcement.icon}
        </div>


        {/* Content */}
        <div className="min-w-0 flex-1">

          <div className="flex flex-col justify-between gap-3 sm:flex-row">

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="font-bold">
                  {announcement.title}
                </h2>

                {announcement.unread && (
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-400">
                    New
                  </span>
                )}

              </div>

              <div className="mt-2 flex flex-wrap gap-2">

                <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-gray-400">
                  {announcement.category}
                </span>

                {announcement.priority === "Important" && (
                  <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs text-yellow-400">
                    Important
                  </span>
                )}

              </div>

            </div>


            {/* Date */}
            <div className="shrink-0 text-left sm:text-right">

              <p className="text-xs text-gray-500">
                {announcement.date}
              </p>

              <p className="mt-1 text-xs text-gray-600">
                {announcement.time}
              </p>

            </div>

          </div>


          {/* Message */}
          <p className="mt-4 max-w-4xl text-sm leading-6 text-gray-400">
            {announcement.message}
          </p>


          {/* Action */}
          <div className="mt-5">

            <button
              type="button"
              onClick={() =>
                alert("Announcement details will be connected later.")
              }
              className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              Read More →
            </button>

          </div>

        </div>

      </div>

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


/* ================= NAV ITEM ================= */

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