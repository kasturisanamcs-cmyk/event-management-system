"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function OrganizerEventsPage() {
  return (
    <DashboardLayout title="My Events">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            EventNest
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            My Events
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            View events assigned to you by the administrator.
          </p>
        </div>

        {/* Empty State */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center sm:p-12">
            <div className="text-4xl">📅</div>

            <h2 className="mt-4 text-xl font-semibold text-white">
              No events assigned
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Events assigned to you by the administrator will appear here.
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}