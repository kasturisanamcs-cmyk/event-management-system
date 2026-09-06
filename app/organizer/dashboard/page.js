"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function OrganizerDashboard() {
  return (
    <DashboardLayout title="Organizer Dashboard">
      {/* Page Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
          EventNest
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Organizer Dashboard
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Manage your assigned events, competitions, participants, and
          volunteers from one place.
        </p>
      </div>

      {/* Organizer Overview */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="My Events"
          description="Events assigned to you"
          icon="📅"
        />

        <DashboardCard
          title="Competitions"
          description="Competitions under your events"
          icon="🏆"
        />

        <DashboardCard
          title="Participants"
          description="Participants registered for competitions"
          icon="👥"
        />

        <DashboardCard
          title="Volunteers"
          description="Volunteers helping with your events"
          icon="🤝"
        />
      </div>

      {/* Main Content */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* My Events */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 lg:col-span-2">
          <div>
            <h2 className="text-xl font-bold text-white">
              My Events
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Events assigned to you by the administrator
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center">
            <div className="text-3xl">📅</div>

            <h3 className="mt-3 font-semibold text-white">
              No events assigned
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Once an administrator assigns an event to you, it will appear
              here.
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Common organizer tasks
          </p>

          <div className="mt-6 space-y-3">
            <QuickAction
              icon="🏆"
              title="Create Competition"
              href="/organizer/competitions/create"
            />

            <QuickAction
              icon="📋"
              title="Manage Competitions"
              href="/organizer/competitions"
            />

            <QuickAction
              icon="👤"
              title="Invite Competition Member"
              href="/organizer/competitions"
            />

            <QuickAction
              icon="👥"
              title="Manage Participants"
              href="/organizer/competitions"
            />

            <QuickAction
              icon="🤝"
              title="Manage Volunteers"
              href="/organizer/competitions"
            />
          </div>
        </section>
      </div>

      {/* Competitions */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            My Competitions
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Competitions created under your assigned events
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center">
          <div className="text-3xl">🏆</div>

          <h3 className="mt-3 font-semibold text-white">
            No competitions yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your competitions will appear here after you create them inside
            an assigned event.
          </p>
        </div>
      </section>

      {/* Organizer Workflow */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <h2 className="text-xl font-bold text-white">
          Organizer Workflow
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Follow this process to manage your assigned events
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <WorkflowStep
            number="01"
            title="Receive Event"
            description="The administrator assigns an event to you."
          />

          <WorkflowStep
            number="02"
            title="Create Competitions"
            description="Create competitions inside your assigned event."
          />

          <WorkflowStep
            number="03"
            title="Invite Members"
            description="Invite competition members to help manage competitions."
          />

          <WorkflowStep
            number="04"
            title="Manage Event"
            description="Manage participants, volunteers, schedules, and event activities."
          />
        </div>
      </section>
    </DashboardLayout>
  );
}

function DashboardCard({ title, description, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold text-white">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
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