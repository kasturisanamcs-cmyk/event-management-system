"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    events: 0,
    competitions: 0,
    participants: 0,
    volunteers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    const supabase = createClient();

    setLoading(true);
    setError("");

    const [
      eventsResult,
      competitionsResult,
      participantsResult,
      volunteersResult,
    ] = await Promise.all([
      supabase
        .from("events")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("competitions")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("registrations")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("volunteer_assignments")
        .select("id", { count: "exact", head: true }),
    ]);

    const firstError =
      eventsResult.error ||
      competitionsResult.error ||
      participantsResult.error ||
      volunteersResult.error;

    if (firstError) {
      console.error("Dashboard statistics error:", firstError);
      setError("Could not load dashboard statistics.");
      setLoading(false);
      return;
    }

    setStats({
      events: eventsResult.count ?? 0,
      competitions: competitionsResult.count ?? 0,
      participants: participantsResult.count ?? 0,
      volunteers: volunteersResult.count ?? 0,
    });

    setLoading(false);
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
          EventNest
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          Admin Dashboard
        </h2>

        <p className="mt-3 text-slate-400">
          Manage events, competitions, participants and volunteers.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Events"
          value={loading ? "..." : stats.events}
          description="Total events"
        />

        <DashboardCard
          title="Competitions"
          value={loading ? "..." : stats.competitions}
          description="Total competitions"
        />

        <DashboardCard
          title="Participants"
          value={loading ? "..." : stats.participants}
          description="Total registrations"
        />

        <DashboardCard
          title="Volunteers"
          value={loading ? "..." : stats.volunteers}
          description="Volunteer assignments"
        />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h3 className="text-lg font-semibold text-white">
          EventNest Administration
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Use the dashboard to manage your events, competitions,
          participants and volunteer operations.
        </p>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-3 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {description}
      </p>
    </div>
  );
}