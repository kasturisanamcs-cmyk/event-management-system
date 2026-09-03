"use client";

import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function AdminDashboardPage() {
  return (
    <DashboardLayout title="Admin Dashboard">

      <div className="space-y-8">

        {/* =========================
            HEADER
        ========================= */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              EventNest
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              Admin Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              Create events and manage organizers, competitions and volunteers
              from each event.
            </p>
          </div>

          {/* CREATE EVENT */}
          <Link
            href="/dashboard/events/create-event"
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl
              bg-blue-600
              px-5 py-3
              font-semibold text-white
              shadow-lg shadow-blue-600/20
              transition
              hover:-translate-y-0.5
              hover:bg-blue-500
            "
          >
            <span className="text-lg">+</span>
            Create Event
          </Link>

        </div>


        {/* =========================
            STATISTICS
        ========================= */}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <AdminStat
            icon="▣"
            title="Events"
            value="24"
            description="Events created on EventNest"
          />

          <AdminStat
            icon="♙"
            title="Organizers"
            value="8"
            description="Organizers managing events"
          />

          <AdminStat
            icon="◎"
            title="Competitions"
            value="31"
            description="Competitions across events"
          />

          <AdminStat
            icon="●"
            title="Volunteers"
            value="42"
            description="Volunteers across events"
          />

        </div>


        {/* =========================
            EVENT MANAGEMENT
        ========================= */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h2 className="text-xl font-semibold text-white">
                Event Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Create an event first, then manage everything related to it.
              </p>
            </div>

            <Link
              href="/dashboard/events"
              className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
            >
              View all events →
            </Link>

          </div>


          {/* EVENT FLOW */}

          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <ManagementCard
              number="01"
              icon="+"
              title="Create Event"
              description="Create a new EventNest event with its basic information."
              href="/dashboard/events/create-event"
              button="Create Event"
            />

            <ManagementCard
              number="02"
              icon="▣"
              title="My Events"
              description="Open an event to manage competitions, organizers and volunteers."
              href="/dashboard/events"
              button="View My Events"
            />

            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.05] p-5">

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  ✓
                </div>

                <span className="text-xs font-semibold text-blue-400">
                  EVENT LEVEL
                </span>

              </div>

              <h3 className="mt-5 text-base font-semibold text-white">
                Manage Event
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Inside each event you can invite organizers, invite
                volunteers and manage competitions.
              </p>

            </div>

          </div>

        </div>


        {/* =========================
            MY EVENTS
        ========================= */}

        <div>

          <div className="flex items-end justify-between">

            <div>
              <h2 className="text-xl font-semibold text-white">
                My Events
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recently created and managed events.
              </p>
            </div>

            <Link
              href="/dashboard/events"
              className="text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              View all →
            </Link>

          </div>


          <div className="mt-5 grid gap-5 lg:grid-cols-2">

            <EventCard
              title="Tech Fest 2026"
              date="20 September 2026"
              location="College Campus"
              competitions="12"
              organizers="4"
              volunteers="18"
              status="Upcoming"
            />

            <EventCard
              title="Innovation Challenge"
              date="5 October 2026"
              location="Main Auditorium"
              competitions="6"
              organizers="2"
              volunteers="11"
              status="Upcoming"
            />

          </div>

        </div>


        {/* =========================
            HOW EVENT MANAGEMENT WORKS
        ========================= */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

          <h2 className="text-xl font-semibold text-white">
            Event Management Structure
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Organizer and volunteer management belongs to an event.
          </p>


          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <StructureCard
              icon="♙"
              title="Organizers"
              description="Invite and manage organizers for a specific event."
            />

            <StructureCard
              icon="◎"
              title="Volunteers"
              description="Invite volunteers and later assign them to suitable tasks."
            />

            <StructureCard
              icon="◆"
              title="Competitions"
              description="Create and manage competitions belonging to the event."
            />

          </div>

        </div>


        {/* =========================
            RECENT ACTIVITY
        ========================= */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

          <h2 className="text-xl font-semibold text-white">
            Recent Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest activity across your events.
          </p>

          <div className="mt-6 space-y-3">

            <Activity
              title="Tech Fest 2026 created"
              description="A new event was added to EventNest."
            />

            <Activity
              title="Competition added"
              description="A competition was created inside an event."
            />

            <Activity
              title="Organizer management"
              description="Organizers can be invited from the selected event."
            />

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}


/* =========================
   ADMIN STAT
========================= */

function AdminStat({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-white/10
        bg-white/[0.04]
        p-5
      "
    >

      <div className="flex items-start justify-between">

        <div
          className="
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            bg-blue-500/10
            text-xl text-blue-400
          "
        >
          {icon}
        </div>

        <span className="text-3xl font-bold text-white">
          {value}
        </span>

      </div>

      <p className="mt-4 text-sm font-medium text-white">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* =========================
   MANAGEMENT CARD
========================= */

function ManagementCard({
  number,
  icon,
  title,
  description,
  href,
  button,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-white/10
        bg-[#08152b]
        p-5
        transition
        hover:border-blue-500/30
      "
    >

      <div className="flex items-center justify-between">

        <div
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            bg-blue-500/10
            text-blue-400
          "
        >
          {icon}
        </div>

        <span className="text-xs font-bold text-slate-600">
          {number}
        </span>

      </div>

      <h3 className="mt-5 text-base font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
        {description}
      </p>

      <Link
        href={href}
        className="
          mt-5
          inline-flex
          text-sm font-semibold
          text-blue-400
          transition
          hover:text-blue-300
        "
      >
        {button} →
      </Link>

    </div>
  );
}


/* =========================
   EVENT CARD
========================= */

function EventCard({
  title,
  date,
  location,
  competitions,
  organizers,
  volunteers,
  status,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-white/10
        bg-white/[0.04]
        p-6
        transition
        hover:border-blue-500/30
      "
    >

      <div className="flex items-start justify-between gap-4">

        <div>

          <span
            className="
              inline-flex
              rounded-full
              border border-emerald-400/20
              bg-emerald-500/10
              px-3 py-1
              text-xs font-semibold
              text-emerald-400
            "
          >
            {status}
          </span>

          <h3 className="mt-4 text-xl font-semibold text-white">
            {title}
          </h3>

        </div>

        <span className="text-2xl">
          ▣
        </span>

      </div>


      <div className="mt-5 space-y-2 text-sm text-slate-400">

        <p>
          <span className="text-slate-500">Date:</span>{" "}
          {date}
        </p>

        <p>
          <span className="text-slate-500">Location:</span>{" "}
          {location}
        </p>

      </div>


      <div className="mt-6 grid grid-cols-3 gap-3">

        <MiniStat
          label="Competitions"
          value={competitions}
        />

        <MiniStat
          label="Organizers"
          value={organizers}
        />

        <MiniStat
          label="Volunteers"
          value={volunteers}
        />

      </div>


      <Link
        href="/dashboard/events"
        className="
          mt-6
          flex w-full
          items-center justify-center
          rounded-xl
          border border-white/10
          bg-white/[0.04]
          px-4 py-3
          text-sm font-semibold
          text-white
          transition
          hover:border-blue-500/30
          hover:bg-blue-500/[0.05]
        "
      >
        Manage Event →
      </Link>

    </div>
  );
}


/* =========================
   MINI STAT
========================= */

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#08152b] p-3 text-center">

      <p className="text-lg font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-500">
        {label}
      </p>

    </div>
  );
}


/* =========================
   STRUCTURE CARD
========================= */

function StructureCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#08152b] p-5">

      <div
        className="
          flex h-10 w-10
          items-center justify-center
          rounded-xl
          bg-blue-500/10
          text-blue-400
        "
      >
        {icon}
      </div>

      <h3 className="mt-4 text-base font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* =========================
   ACTIVITY
========================= */

function Activity({
  title,
  description,
}) {
  return (
    <div
      className="
        rounded-xl
        border border-white/10
        bg-[#08152b]
        p-4
      "
    >

      <p className="text-sm font-medium text-white">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}