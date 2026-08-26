"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function OrganizersPage() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadOrganizers();
    }
  }, [id]);

  async function loadOrganizers() {
    const supabase = createClient();

    setLoading(true);
    setError("");

    try {
      // -----------------------------
      // GET LOGGED-IN USER
      // -----------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setError("You must be logged in.");
        return;
      }

      // -----------------------------
      // GET EVENT
      // -----------------------------

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("id, name, created_by")
        .eq("id", id)
        .single();

      if (eventError) {
        throw eventError;
      }

      // -----------------------------
      // SECURITY CHECK
      // -----------------------------

      if (eventData.created_by !== user.id) {
        setError(
          "You do not have permission to manage organizers for this event."
        );
        return;
      }

      setEvent(eventData);

      // -----------------------------
      // GET ORGANIZERS
      // -----------------------------

      const {
        data: organizerData,
        error: organizerError,
      } = await supabase
        .from("event_organizers")
        .select(
          `
          id,
          organizer_id,
          assigned_at,
          profiles (
            id,
            full_name,
            role
          )
        `
        )
        .eq("event_id", id)
        .order("assigned_at", { ascending: false });

      if (organizerError) {
        throw organizerError;
      }

      setOrganizers(organizerData || []);

      // -----------------------------
      // GET INVITATIONS
      // -----------------------------

      const {
        data: invitationData,
        error: invitationError,
      } = await supabase
        .from("organizer_invitations")
        .select(
          "id, email, status, expires_at, created_at, accepted_at"
        )
        .eq("event_id", id)
        .order("created_at", { ascending: false });

      if (invitationError) {
        throw invitationError;
      }

      setInvitations(invitationData || []);
    } catch (err) {
      console.error("Organizer page error:", err);

      setError(
        err?.message || "Could not load organizer information."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center text-slate-400">
        Loading organizers...
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Link
          href={`/dashboard/events/${id}`}
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Event
        </Link>

        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back */}
      <div className="mb-6">
        <Link
          href={`/dashboard/events/${id}`}
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Event
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Organizer Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Organizers
          </h1>

          <p className="mt-3 text-slate-400">
            Manage organizers for{" "}
            <span className="font-medium text-slate-200">
              {event?.name}
            </span>
          </p>
        </div>

        {/* Invite button */}
        <Link
          href={`/dashboard/events/${id}/organizers/invite`}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
        >
          + Invite Organizer
        </Link>
      </div>

      {/* Current Organizers */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            Current Organizers
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Organizers currently assigned to this event.
          </p>
        </div>

        {organizers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
              👥
            </div>

            <h3 className="mt-4 font-semibold text-white">
              No organizers assigned
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              You haven't assigned any organizers to this event yet.
            </p>

            <Link
              href={`/dashboard/events/${id}/organizers/invite`}
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Invite First Organizer
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {organizers.map((organizer) => (
              <div
                key={organizer.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white">
                      {organizer.profiles?.full_name ||
                        "Unknown Organizer"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {organizer.profiles?.role || "ORGANIZER"}
                    </p>
                  </div>

                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                    ACTIVE
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Invitations */}
      <section className="mt-10">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            Organizer Invitations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Invitations sent for this event.
          </p>
        </div>

        {invitations.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-slate-500">
            No organizer invitations yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-medium text-slate-200">
                      {invitation.email}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Sent{" "}
                      {new Date(
                        invitation.created_at
                      ).toLocaleDateString()}
                    </p>

                    {invitation.expires_at && (
                      <p className="mt-1 text-xs text-slate-500">
                        Expires{" "}
                        {new Date(
                          invitation.expires_at
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <InvitationStatus
                    status={invitation.status}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InvitationStatus({ status }) {
  const normalized = status?.toUpperCase();

  let className =
    "bg-slate-500/10 text-slate-400";

  if (normalized === "PENDING") {
    className = "bg-yellow-500/10 text-yellow-400";
  }

  if (normalized === "ACCEPTED") {
    className = "bg-green-500/10 text-green-400";
  }

  if (normalized === "EXPIRED") {
    className = "bg-red-500/10 text-red-400";
  }

  if (normalized === "CANCELLED") {
    className = "bg-slate-500/10 text-slate-400";
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {normalized || "UNKNOWN"}
    </span>
  );
}