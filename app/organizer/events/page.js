"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/client";

export default function OrganizerEventsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error: eventsError } = await supabase
          .from("event_organizers")
          .select(`
            id,
            assigned_at,
            events (
              id,
              name,
              description,
              start_date,
              end_date,
              registration_deadline,
              venue,
              event_image,
              status
            )
          `)
          .eq("organizer_id", user.id)
          .order("assigned_at", { ascending: false });

        if (eventsError) throw eventsError;

        const assignedEvents = (data || [])
          .filter((item) => item.events)
          .map((item) => ({
            ...item.events,
            assigned_at: item.assigned_at,
          }));

        setEvents(assignedEvents);
      } catch (err) {
        console.error("Error loading organizer events:", err);
        setError("Unable to load your assigned events.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

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
            View and manage events assigned to you by the administrator.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center sm:p-12">
            <div className="text-3xl">⏳</div>
            <h2 className="mt-4 text-xl font-semibold text-white">
              Loading your events...
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Please wait while we fetch your assigned events.
            </p>
          </section>
        ) : events.length === 0 ? (
          /* Empty State */
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
        ) : (
          /* Event Cards */
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {events.map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
              >
                {event.event_image && (
                  <img
                    src={event.event_image}
                    alt={event.name}
                    className="h-48 w-full object-cover"
                  />
                )}

                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {event.name}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {event.description || "No description available."}
                      </p>
                    </div>

                    <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase text-blue-300">
                      {event.status}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-xl bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Start Date
                      </p>
                      <p className="mt-1 text-slate-200">
                        {event.start_date}
                      </p>
                    </div>

                    <div className="rounded-xl bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        End Date
                      </p>
                      <p className="mt-1 text-slate-200">
                        {event.end_date}
                      </p>
                    </div>

                    <div className="rounded-xl bg-black/20 p-3 sm:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Venue
                      </p>
                      <p className="mt-1 text-slate-200">
                        {event.venue || "Venue not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Link
                      href={`/organizer/events/${event.id}`}
                      className="block w-full rounded-xl bg-blue-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-600"
                    >
                      Manage Event
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}