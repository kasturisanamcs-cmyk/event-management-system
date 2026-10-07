"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function CompetitionMemberAnnouncementsPage() {
  const supabase = createClient();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const {
        data,
        error: rpcError,
      } = await supabase.rpc(
        "get_eventnest_competition_member_announcements"
      );

      if (rpcError) {
        throw rpcError;
      }

      setAnnouncements(data || []);
    } catch (err) {
      console.error(
        "Competition Member announcements error:",
        err
      );

      setError(
        err?.message ||
          "Failed to load announcements."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl space-y-6">

        {/* =================================================
            HEADER
        ================================================== */}

        <div>
          <p className="text-sm font-medium text-blue-400">
            Competition Member
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Announcements
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Stay updated with important announcements
            for your assigned competitions.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* =================================================
            REFRESH
        ================================================== */}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={loadAnnouncements}
            disabled={loading}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* =================================================
            LOADING
        ================================================== */}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#050b18] px-6 py-16 text-center">
            <p className="text-sm text-slate-500">
              Loading announcements...
            </p>
          </div>
        ) : announcements.length === 0 ? (

          /* =================================================
              EMPTY
          ================================================== */

          <div className="rounded-2xl border border-dashed border-white/10 bg-[#050b18] px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xl text-slate-500">
              ◇
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              No announcements yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are no published announcements
              for your assigned competitions yet.
            </p>

          </div>

        ) : (

          /* =================================================
              ANNOUNCEMENTS
          ================================================== */

          <div className="space-y-4">

            {announcements.map(
              (announcement) => (
                <article
                  key={announcement.announcement_id}
                  className="rounded-2xl border border-white/10 bg-[#050b18] p-5 shadow-lg transition hover:border-white/20 sm:p-6"
                >

                  {/* TOP */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-400">
                          Announcement
                        </span>

                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                          Published
                        </span>

                      </div>

                      <h2 className="mt-3 break-words text-lg font-semibold text-white sm:text-xl">
                        {announcement.title}
                      </h2>

                      <p className="mt-2 text-xs font-medium text-slate-500">
                        Event:{" "}
                        {announcement.event_name}
                      </p>

                    </div>

                    <div className="shrink-0 text-xs text-slate-600 sm:text-right">
                      {formatDate(
                        announcement.created_at
                      )}
                    </div>

                  </div>

                  {/* MESSAGE */}

                  <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:p-5">
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                      {announcement.message}
                    </p>
                  </div>

                </article>
              )
            )}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}