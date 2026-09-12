"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CompetitionMemberInvitePage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvitation() {
      try {
        const token = params?.token;

        if (!token) {
          setError("Invalid invitation link.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/competition-member-invitations/accept?token=${token}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "This invitation is invalid or expired.");
          setLoading(false);
          return;
        }

        setInvitation(data.invitation);
      } catch (err) {
        console.error(err);
        setError("Unable to load the invitation.");
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, [params]);

  function handleAccept() {
    const token = params?.token;

    if (!token) return;

    router.push(
      `/register?invite=${token}&type=competition-member`
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-indigo-500" />

          <p className="text-slate-400">
            Loading invitation...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
            ✕
          </div>

          <h1 className="text-2xl font-bold">
            Invitation Unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error}
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500"
          >
            Go to EventNest
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            EventNest
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Competition Management
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-3xl">
              👥
            </div>

            <h2 className="text-2xl font-bold">
              You&apos;re Invited!
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              You have been invited to join a competition as a
              Competition Member.
            </p>
          </div>

          <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Competition
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {invitation?.competition?.name ||
                  "Competition"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Event
              </p>

              <p className="mt-1 font-medium text-slate-200">
                {invitation?.competition?.events?.name ||
                  "EventNest Event"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Invitation Email
              </p>

              <p className="mt-1 break-all text-sm text-slate-300">
                {invitation?.email}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Invitation Status
              </p>

              <span className="mt-2 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                PENDING
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <p className="text-sm leading-6 text-slate-300">
              As a Competition Member, you may help the organizer
              with competition-related activities such as participant
              management, check-in, payment verification, and other
              assigned tasks.
            </p>
          </div>

          <button
            onClick={handleAccept}
            className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.99]"
          >
            Accept Invitation
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-slate-500">
            You will be taken to registration/login to continue.
          </p>
        </div>
      </div>
    </main>
  );
}