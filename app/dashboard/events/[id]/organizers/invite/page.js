"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function InviteOrganizerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [email, setEmail] = useState("");

  const [loadingEvent, setLoadingEvent] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  async function loadEvent() {
    const supabase = createClient();

    setLoadingEvent(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error: eventError } = await supabase
        .from("events")
        .select("id, name, created_by")
        .eq("id", id)
        .eq("created_by", user.id)
        .single();

      if (eventError) {
        throw eventError;
      }

      setEvent(data);
    } catch (err) {
      console.error("Load event error:", err);
      setError("Could not load this event.");
    } finally {
      setLoadingEvent(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter the organizer's email address.");
      return;
    }
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSending(true);

    try {
      // --------------------------------
      // CALL OUR API
      // --------------------------------

      const response = await fetch("/api/organizer-invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: id,
          email: cleanEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Failed to send invitation."
        );
      }

      setSuccess(
        `Invitation sent successfully to ${cleanEmail}.`
      );

      setEmail("");

      // Give user time to see success message
      setTimeout(() => {
        router.push(
          `/dashboard/events/${id}/organizers`
        );
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error("Invitation error:", err);

      setError(
        err?.message ||
          "Something went wrong while sending the invitation."
      );
    } finally {
      setSending(false);
    }
  }

  if (loadingEvent) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center text-slate-400">
        Loading event...
      </div>
    );
  }

  if (error && !event) {
    return (
      <div>
        <Link
          href={`/dashboard/events/${id}/organizers`}
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Organizers
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
          href={`/dashboard/events/${id}/organizers`}
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Organizers
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
          Organizer Management
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Invite Organizer
        </h1>

        <p className="mt-3 text-slate-400">
          Invite someone to help manage competitions and
          operations for this event.
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-8"
        >
          {/* Event */}
          <div>
            <p className="text-sm font-medium text-slate-400">
              Event
            </p>

            <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="font-semibold text-white">
                {event?.name}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="mt-6">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Organizer Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="organizer@example.com"
              disabled={sending}
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-[#0b1224] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-xs text-slate-500">
              The invitation will remain valid for 48 hours.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {success}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`/dashboard/events/${id}/organizers`}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending
                ? "Sending Invitation..."
                : "Send Invitation →"}
            </button>
          </div>
        </form>

        {/* Information */}
        <div className="mt-5 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
          <p className="text-xs leading-5 text-slate-500">
            The invitation will be saved in EventNest and
            sent to the organizer's email address.
          </p>
        </div>
      </div>
    </div>
  );
}