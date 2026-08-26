"use client";

import Link from "next/link";
import { useState } from "react";

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState("20 Aug");

  const schedule = {
    "20 Aug": [
      {
        time: "09:00 AM",
        end: "09:45 AM",
        title: "Participant Check-in",
        venue: "Main Auditorium",
        type: "Registration",
        icon: "🎫",
      },
      {
        time: "10:00 AM",
        end: "01:00 PM",
        title: "Tech Hackathon 2026",
        venue: "Main Auditorium",
        type: "Competition",
        icon: "💻",
      },
      {
        time: "01:00 PM",
        end: "02:00 PM",
        title: "Lunch Break",
        venue: "College Cafeteria",
        type: "Break",
        icon: "🍱",
      },
      {
        time: "02:00 PM",
        end: "04:30 PM",
        title: "Hackathon Project Development",
        venue: "Computer Lab",
        type: "Competition",
        icon: "⚙️",
      },
    ],

    "21 Aug": [
      {
        time: "10:00 AM",
        end: "11:30 AM",
        title: "AI Innovation Challenge",
        venue: "Computer Lab",
        type: "Competition",
        icon: "🤖",
      },
      {
        time: "12:00 PM",
        end: "01:00 PM",
        title: "Expert Talk: Future of AI",
        venue: "Seminar Hall",
        type: "Talk",
        icon: "🎤",
      },
      {
        time: "02:00 PM",
        end: "04:00 PM",
        title: "AI Project Showcase",
        venue: "Innovation Center",
        type: "Showcase",
        icon: "🚀",
      },
    ],

    "25 Aug": [
      {
        time: "10:30 AM",
        end: "12:30 PM",
        title: "AI Innovation Challenge",
        venue: "Computer Lab",
        type: "Competition",
        icon: "🤖",
      },
      {
        time: "02:00 PM",
        end: "03:30 PM",
        title: "Final Evaluation",
        venue: "Main Auditorium",
        type: "Evaluation",
        icon: "🏆",
      },
    ],
  };

  const selectedSchedule = schedule[selectedDay] || [];

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
            active
          />

          <NavItem
            icon="🔔"
            title="Announcements"
            href="/participant/announcements"
          />

        </nav>

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
              My Schedule
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Keep track of your events, competitions and activities.
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
              Your Event Calendar
            </p>

            <h1 className="text-3xl font-bold lg:text-4xl">
              Plan Your Day
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              See your registered competitions and important activities
              in chronological order.
            </p>

          </div>


          {/* Date Selector */}
          <div className="mb-8 flex gap-3 overflow-x-auto pb-2">

            {Object.keys(schedule).map((day) => (

              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`min-w-[110px] rounded-2xl border px-5 py-4 text-left transition ${
                  selectedDay === day
                    ? "border-blue-500 bg-blue-600 shadow-lg shadow-blue-600/20"
                    : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                }`}
              >

                <p className="text-xs text-gray-400">
                  AUGUST
                </p>

                <p className="mt-1 text-lg font-bold">
                  {day}
                </p>

              </button>

            ))}

          </div>


          {/* Schedule */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">

            <div className="mb-7 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Schedule — {selectedDay}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedSchedule.length} activities planned
                </p>

              </div>

              <span className="hidden rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-400 sm:block">
                {selectedDay === "20 Aug" ? "Today" : "Upcoming"}
              </span>

            </div>


            {/* Timeline */}
            <div className="space-y-1">

              {selectedSchedule.map((item, index) => (

                <ScheduleItem
                  key={`${item.title}-${index}`}
                  item={item}
                  last={index === selectedSchedule.length - 1}
                />

              ))}

            </div>

          </div>


          {/* Reminder */}
          <div className="mt-6 rounded-2xl border border-blue-500/10 bg-blue-500/5 p-5">

            <div className="flex gap-3">

              <span className="text-xl">
                💡
              </span>

              <div>

                <h3 className="font-semibold text-blue-400">
                  Don't miss your events
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Arrive at least 15 minutes before your competition
                  starts. Keep your QR ticket and college ID ready.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


/* ================= SCHEDULE ITEM ================= */

function ScheduleItem({ item, last }) {
  return (
    <div className="flex gap-4">

      {/* Time */}
      <div className="w-20 shrink-0 pt-5 text-right sm:w-24">

        <p className="text-sm font-semibold">
          {item.time}
        </p>

        <p className="mt-1 text-xs text-gray-600">
          {item.end}
        </p>

      </div>


      {/* Timeline */}
      <div className="flex flex-col items-center">

        <div className="mt-5 flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-sm">
          {item.icon}
        </div>

        {!last && (
          <div className="my-1 h-full min-h-16 w-px bg-white/10" />
        )}

      </div>


      {/* Event */}
      <div className="mb-3 flex-1 rounded-2xl border border-white/10 bg-[#08152b] p-5 transition hover:border-blue-500/30">

        <div className="flex flex-col justify-between gap-3 sm:flex-row">

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="font-bold">
                {item.title}
              </h3>

              <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400">
                {item.type}
              </span>

            </div>

            <p className="mt-2 text-sm text-gray-500">
              📍 {item.venue}
            </p>

          </div>

          <button
            onClick={() => alert("Event details will be connected later.")}
            className="h-fit rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            Details
          </button>

        </div>

      </div>

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