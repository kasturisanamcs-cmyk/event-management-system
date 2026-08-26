"use client";

import Link from "next/link";

export default function EventDetailsPage() {
  return (
    <div className="min-h-screen bg-[#071225] text-white">

      {/* Header */}
      <header className="border-b border-white/10 bg-[#08152b]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/participant/events"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Events
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold">
              E
            </div>

            <div className="hidden sm:block">
              <h1 className="font-bold">EventHub AI</h1>
              <p className="text-xs text-gray-500">
                Smart Event Management
              </p>
            </div>
          </div>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Event Hero */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">

          <div className="relative flex min-h-[280px] items-center justify-center bg-gradient-to-br from-blue-600/30 via-cyan-500/10 to-purple-600/20">

            <div className="text-center">

              <div className="mb-4 text-7xl">
                💻
              </div>

              <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                Technology
              </span>

            </div>

          </div>

          <div className="p-6 lg:p-10">

            <div className="grid gap-10 lg:grid-cols-[1fr_320px]">

              {/* Left */}
              <div>

                <p className="mb-3 text-sm font-medium text-blue-400">
                  FEATURED EVENT
                </p>

                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                  Tech Hackathon 2026
                </h1>

                <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-400">
                  Build innovative solutions, solve real-world problems
                  and compete with talented students from across the
                  college. Bring your ideas to life with technology.
                </p>

                {/* Event Information */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2">

                  <InfoCard
                    icon="📅"
                    title="Date"
                    value="20 August 2026"
                  />

                  <InfoCard
                    icon="◷"
                    title="Time"
                    value="10:00 AM – 5:00 PM"
                  />

                  <InfoCard
                    icon="📍"
                    title="Venue"
                    value="Main Auditorium"
                  />

                  <InfoCard
                    icon="👥"
                    title="Participants"
                    value="120 / 150 registered"
                  />

                </div>

                {/* About */}
                <section className="mt-12">

                  <h2 className="text-2xl font-bold">
                    About the Event
                  </h2>

                  <p className="mt-4 leading-7 text-gray-400">
                    Tech Hackathon 2026 is a college-level technology
                    competition where participants work individually
                    or in teams to develop creative and practical
                    solutions.
                  </p>

                  <p className="mt-4 leading-7 text-gray-400">
                    Participants will have the opportunity to showcase
                    their programming, problem-solving and innovation
                    skills while competing for exciting prizes.
                  </p>

                </section>

                {/* Rules */}
                <section className="mt-12">

                  <h2 className="text-2xl font-bold">
                    Rules & Guidelines
                  </h2>

                  <div className="mt-5 space-y-3">

                    <Rule text="Participants must carry a valid college ID." />

                    <Rule text="Teams can have a maximum of 4 members." />

                    <Rule text="Projects must be created during the event." />

                    <Rule text="Participants must submit their project before the deadline." />

                    <Rule text="Any form of plagiarism may result in disqualification." />

                  </div>

                </section>

                {/* What to Bring */}
                <section className="mt-12">

                  <h2 className="text-2xl font-bold">
                    What You Should Bring
                  </h2>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">

                    <Checklist text="Laptop / Computer" />
                    <Checklist text="College ID Card" />
                    <Checklist text="Charger" />
                    <Checklist text="Required Software" />

                  </div>

                </section>

              </div>

              {/* Registration Card */}
              <aside>

                <div className="sticky top-8 rounded-2xl border border-white/10 bg-[#0b1a32] p-6 shadow-2xl">

                  <p className="text-sm text-gray-500">
                    Registration Fee
                  </p>

                  <div className="mt-2 text-4xl font-bold">
                    ₹100
                  </div>

                  <div className="my-6 h-px bg-white/10" />

                  {/* Capacity */}
                  <div>

                    <div className="flex justify-between text-sm">

                      <span className="text-gray-400">
                        Available Slots
                      </span>

                      <span className="font-medium text-cyan-400">
                        30 left
                      </span>

                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">

                      <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />

                    </div>

                  </div>

                  {/* Button */}
                  <Link
                    href="/participant/events/details/register"
                    className="mt-7 block w-full rounded-xl bg-blue-600 px-5 py-4 text-center font-bold transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20"
                  >
                    Register Now →
                  </Link>

                  <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                    Registration will require participant details
                    and payment confirmation.
                  </p>

                </div>

              </aside>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


/* Information Card */

function InfoCard({ icon, title, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
          {icon}
        </div>

        <div>
          <p className="text-xs text-gray-500">
            {title}
          </p>

          <p className="mt-1 font-medium">
            {value}
          </p>
        </div>

      </div>

    </div>
  );
}


/* Rule */

function Rule({ text }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">

      <span className="mt-0.5 text-cyan-400">
        ✓
      </span>

      <p className="text-sm leading-6 text-gray-400">
        {text}
      </p>

    </div>
  );
}


/* Checklist */

function Checklist({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">

      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-400">
        ✓
      </div>

      <span className="text-sm text-gray-300">
        {text}
      </span>

    </div>
  );
}