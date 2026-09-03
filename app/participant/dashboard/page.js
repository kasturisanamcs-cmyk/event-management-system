"use client";

import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout title="Admin Dashboard">

      <div className="space-y-8">

        {/* Page Header */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            EventNest
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-slate-400">
            Manage EventNest events, organizers, competitions and platform operations.
          </p>
        </div>


        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon="▣"
            title="Total Events"
            value="4"
            description="Events created"
          />

          <StatCard
            icon="◉"
            title="Organizers"
            value="8"
            description="Active organizers"
          />

          <StatCard
            icon="●"
            title="Participants"
            value="248"
            description="Registered participants"
          />

          <StatCard
            icon="🏆"
            title="Competitions"
            value="12"
            description="Active competitions"
          />

        </div>


        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Recent Events */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 lg:col-span-2">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold text-white">
                  Recent Events
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Events currently available in EventNest
                </p>
              </div>

              <Link
                href="/dashboard/events"
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                View all →
              </Link>

            </div>


            <div className="mt-6 space-y-4">

              <EventCard
                title="Tech Hackathon 2026"
                date="20 August 2026"
                venue="Main Auditorium"
                status="ACTIVE"
              />

              <EventCard
                title="AI Innovation Challenge"
                date="25 August 2026"
                venue="Computer Lab"
                status="UPCOMING"
              />

              <EventCard
                title="Web Development Contest"
                date="30 August 2026"
                venue="Seminar Hall"
                status="UPCOMING"
              />

            </div>

          </section>


          {/* Quick Actions */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

            <h2 className="text-xl font-semibold text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Common administrator actions
            </p>

            <div className="mt-6 space-y-3">

              <QuickAction
                href="/dashboard/events"
                icon="▣"
                title="Manage Events"
                description="View and manage events"
              />

              <QuickAction
                href="/dashboard/organizers"
                icon="◉"
                title="Manage Organizers"
                description="Assign and manage organizers"
              />

              <QuickAction
                href="/dashboard/competitions"
                icon="🏆"
                title="Competitions"
                description="View all competitions"
              />

              <QuickAction
                href="/dashboard/participants"
                icon="●"
                title="Participants"
                description="View registered participants"
              />

            </div>

          </section>

        </div>


        {/* Platform Overview */}
        <section>

          <h2 className="mb-4 text-xl font-semibold text-white">
            Platform Overview
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <OverviewCard
              title="Pending Payments"
              value="14"
              description="Payments requiring attention"
              href="/dashboard/payments"
            />

            <OverviewCard
              title="Tickets Issued"
              value="231"
              description="Tickets generated"
              href="/dashboard/tickets"
            />

            <OverviewCard
              title="Announcements"
              value="6"
              description="Published announcements"
              href="/dashboard/announcements"
            />

            <OverviewCard
              title="Competition Members"
              value="18"
              description="Assigned members"
              href="/dashboard/competition-members"
            />

          </div>

        </section>

      </div>

    </DashboardLayout>
  );
}


/* =========================
   STAT CARD
========================= */

function StatCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:bg-white/[0.06]">

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-400">
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
   EVENT CARD
========================= */

function EventCard({
  title,
  date,
  venue,
  status,
}) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-[#08152b] p-5 sm:flex-row sm:items-center">

      <div>

        <div className="flex flex-wrap items-center gap-3">

          <h3 className="font-semibold text-white">
            {title}
          </h3>

          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
              status === "ACTIVE"
                ? "bg-green-500/10 text-green-400"
                : "bg-blue-500/10 text-blue-400"
            }`}
          >
            {status}
          </span>

        </div>

        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">

          <span>
            📅 {date}
          </span>

          <span>
            📍 {venue}
          </span>

        </div>

      </div>

      <Link
        href="/dashboard/events"
        className="w-fit rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        Manage
      </Link>

    </div>
  );
}


/* =========================
   QUICK ACTION
========================= */

function QuickAction({
  href,
  icon,
  title,
  description,
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#08152b] p-4 transition hover:border-blue-500/30 hover:bg-blue-500/[0.05]"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        {icon}
      </div>

      <div>

        <p className="text-sm font-medium text-white">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>

      </div>

    </Link>
  );
}


/* =========================
   OVERVIEW CARD
========================= */

function OverviewCard({
  title,
  value,
  description,
  href,
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.06]"
    >

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </Link>
  );
}