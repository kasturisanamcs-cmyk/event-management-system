


"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function OrganizerDashboard() {
  return (
    <DashboardLayout title="Organizer Dashboard">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
          EventNest
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Organizer Dashboard
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Create and manage events, competitions, participants, and volunteers
          from one place.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="My Events"
          value="0"
          description="Events you manage"
          icon="📅"
        />

        <DashboardCard
          title="Competitions"
          value="0"
          description="Active competitions"
          icon="🏆"
        />

        <DashboardCard
          title="Participants"
          value="0"
          description="Registered participants"
          icon="👥"
        />

        <DashboardCard
          title="Volunteers"
          value="0"
          description="Assigned volunteers"
          icon="🤝"
        />
      </div>

      {/* Main Sections */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Events */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                My Events
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Manage the events you organize
              </p>
            </div>

            <a
              href="/dashboard/events/create-event"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              + Create Event
            </a>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center">
            <div className="text-3xl">📅</div>

            <h3 className="mt-3 font-semibold text-white">
              No events yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create your first event to start managing registrations and
              competitions.
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-bold text-white">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Common organizer tasks
          </p>

          <div className="mt-6 space-y-3">
            <QuickAction
              icon="➕"
              title="Create Event"
              href="/dashboard/events/create-event"
            />

            <QuickAction
              icon="🏆"
              title="Manage Competitions"
              href="/dashboard/events"
            />

            <QuickAction
              icon="👥"
              title="Manage Participants"
              href="/dashboard/events"
            />

            <QuickAction
              icon="🤝"
              title="Manage Volunteers"
              href="/dashboard/events"
            />
          </div>
        </section>
      </div>

      {/* Organizer Workflow */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-bold text-white">
          Organizer Workflow
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Your main event management process
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <WorkflowStep
            number="01"
            title="Create Event"
            description="Set event details and venue."
          />

          <WorkflowStep
            number="02"
            title="Add Competitions"
            description="Create competitions under your event."
          />

          <WorkflowStep
            number="03"
            title="Manage People"
            description="Manage participants and volunteers."
          />

          <WorkflowStep
            number="04"
            title="Run Event"
            description="Manage tickets, schedules and announcements."
          />
        </div>
      </section>
    </DashboardLayout>
  );
}

function DashboardCard({ title, value, description, icon }) {
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

      <p className="mt-4 text-sm font-medium text-white">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function QuickAction({ icon, title, href }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-blue-500/30 hover:bg-blue-500/5"
    >
      <span className="text-xl">{icon}</span>

      <span className="text-sm font-medium text-slate-200">
        {title}
      </span>
    </a>
  );
}

function WorkflowStep({ number, title, description }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1b35] p-5">
      <p className="text-xs font-bold tracking-widest text-blue-400">
        {number}
      </p>

      <h3 className="mt-3 font-semibold text-white">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

