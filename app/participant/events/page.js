"use client";

import Link from "next/link";
import { useState } from "react";

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const events = [
    {
      title: "Tech Hackathon 2026",
      category: "Technology",
      date: "20 August 2026",
      time: "10:00 AM",
      venue: "Main Auditorium",
      participants: "120 / 150",
      icon: "💻",
      description:
        "Build innovative solutions and compete with talented students.",
    },
    {
      title: "AI Innovation Challenge",
      category: "Technology",
      date: "25 August 2026",
      time: "11:30 AM",
      venue: "Computer Lab",
      participants: "75 / 100",
      icon: "🤖",
      description:
        "Create an AI-powered solution for a real-world problem.",
    },
    {
      title: "Web Design Competition",
      category: "Design",
      date: "28 August 2026",
      time: "09:30 AM",
      venue: "Design Studio",
      participants: "42 / 80",
      icon: "🎨",
      description:
        "Show your creativity by designing a modern and responsive website.",
    },
    {
      title: "Coding Challenge",
      category: "Coding",
      date: "02 September 2026",
      time: "02:00 PM",
      venue: "Programming Lab",
      participants: "95 / 120",
      icon: "⌨️",
      description:
        "Test your programming skills through exciting coding problems.",
    },
    {
      title: "Robo Wars",
      category: "Robotics",
      date: "05 September 2026",
      time: "10:30 AM",
      venue: "College Ground",
      participants: "30 / 50",
      icon: "🤖",
      description:
        "Build, control and battle your robot in an exciting competition.",
    },
    {
      title: "Photography Contest",
      category: "Creative",
      date: "08 September 2026",
      time: "01:00 PM",
      venue: "Seminar Hall",
      participants: "35 / 60",
      icon: "📸",
      description:
        "Capture unique moments and showcase your photography skills.",
    },
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || event.category === category;

    return matchesSearch && matchesCategory;
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
            <h1 className="text-lg font-bold">EventHub AI</h1>
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
            active
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
              Browse Events
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Discover events and competitions happening around you.
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

          {/* Page intro */}
          <div className="mb-8">

            <p className="mb-2 text-blue-400">
              Explore & Participate
            </p>

            <h1 className="text-3xl font-bold lg:text-4xl">
              Find Your Next Event
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              Browse upcoming college events, competitions and
              activities. Register for the ones you don't want to miss.
            </p>

          </div>

          {/* Search + Filter */}
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 lg:flex-row">

            {/* Search */}
            <div className="relative flex-1">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                🔎
              </span>

              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#08152b] py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
              />

            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#08152b] px-5 py-3 text-gray-300 outline-none focus:border-blue-500"
            >
              <option>All</option>
              <option>Technology</option>
              <option>Design</option>
              <option>Coding</option>
              <option>Robotics</option>
              <option>Creative</option>
            </select>

          </div>

          {/* Results */}
          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Upcoming Events
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredEvents.length} events available
              </p>
            </div>

          </div>

          {/* Event Grid */}
          {filteredEvents.length > 0 ? (

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              {filteredEvents.map((event) => (
                <EventCard
                  key={event.title}
                  event={event}
                />
              ))}

            </div>

          ) : (

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] py-20 text-center">

              <div className="text-5xl">
                🔎
              </div>

              <h3 className="mt-4 text-xl font-bold">
                No events found
              </h3>

              <p className="mt-2 text-gray-500">
                Try another search or category.
              </p>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}


/* ---------------- Navigation Item ---------------- */

function NavItem({ icon, title, href, active }) {
  return (
    <a
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
    </a>
  );
}


/* ---------------- Event Card ---------------- */

function EventCard({ event }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition duration-200 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.06]">

      {/* Event Banner */}
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-blue-600/20 via-cyan-500/10 to-purple-600/20">

        <div className="text-6xl transition duration-200 group-hover:scale-110">
          {event.icon}
        </div>

        {/* Category */}
        <span className="absolute right-4 top-4 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
          {event.category}
        </span>

      </div>

      {/* Card Content */}
      <div className="p-5">

        <h3 className="text-xl font-bold">
          {event.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-400">
          {event.description}
        </p>

        {/* Details */}
        <div className="mt-5 space-y-3 text-sm">

          <div className="flex items-center gap-3 text-gray-400">
            <span>📅</span>
            <span>{event.date}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-400">
            <span>◷</span>
            <span>{event.time}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-400">
            <span>📍</span>
            <span>{event.venue}</span>
          </div>

        </div>

        {/* Participants */}
        <div className="mt-5">

          <div className="mb-2 flex justify-between text-xs">

            <span className="text-gray-500">
              Participants
            </span>

            <span className="text-gray-400">
              {event.participants}
            </span>

          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
              style={{
                width: getProgress(event.participants),
              }}
            />

          </div>

        </div>

        {/* Button */}
        <Link
  href="/participant/events/details"
  className="mt-6 block w-full rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold transition hover:bg-blue-500"
>
  View Details →
</Link>

      </div>

    </div>
  );
}


/* ---------------- Progress ---------------- */

function getProgress(value) {
  const [current, total] = value.split("/").map(Number);

  return `${(current / total) * 100}%`;
}