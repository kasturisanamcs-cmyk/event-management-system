"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CompetitionsPage() {
  const { id: eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [competitions, setCompetitions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId]);

  async function loadData() {
    const supabase = createClient();

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    // Load event
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("id, name")
      .eq("id", eventId)
      .eq("created_by", user.id)
      .single();

    if (eventError) {
      console.error("Event error:", eventError);
      setError("Could not load this event.");
      setLoading(false);
      return;
    }

    setEvent(eventData);

    // Load competitions
    const { data: competitionData, error: competitionError } =
      await supabase
        .from("competitions")
        .select(
          "id, name, description, registration_fee, capacity, competition_date, start_time, end_time, venue, status"
        )
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

    if (competitionError) {
      console.error("Competition error:", competitionError);
      setError("Could not load competitions.");
      setLoading(false);
      return;
    }

    setCompetitions(competitionData || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center text-slate-400">
        Loading competitions...
      </div>
    );
  }

  return (
    <div>
      {/* Back */}
      <Link
        href={`/dashboard/events/${eventId}`}
        className="text-sm text-slate-400 transition hover:text-white"
      >
        ← Back to Event
      </Link>

      {/* Header */}
      <div className="mt-6 mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            {event?.name}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Competitions
          </h1>

          <p className="mt-3 text-slate-400">
            Create and manage competitions for this event.
          </p>
        </div>

        <Link
          href={`/dashboard/events/${eventId}/competitions/create`}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
        >
          + Create Competition
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Empty */}
      {competitions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
            🏆
          </div>

          <h2 className="mt-5 text-xl font-semibold text-white">
            No competitions yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Create the first competition for this event.
          </p>

          <Link
            href={`/dashboard/events/${eventId}/competitions/create`}
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Create Competition
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {competitions.map((competition) => (
            <div
              key={competition.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex flex-col justify-between gap-5 sm:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">
                      {competition.name}
                    </h2>

                    <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                      {competition.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    {competition.description || "No description provided."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                    <span>
                      📅 {competition.competition_date}
                    </span>

                    <span>
                      ⏰ {competition.start_time} -{" "}
                      {competition.end_time}
                    </span>

                    <span>
                      📍 {competition.venue}
                    </span>

                    <span>
                      💰 ₹{competition.registration_fee}
                    </span>

                    <span>
                      👥 Capacity: {competition.capacity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}