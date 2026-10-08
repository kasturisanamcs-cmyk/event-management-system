"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function AdminOrganizersPage() {
  const supabase = createClient();

  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrganizers();
  }, []);

  async function loadOrganizers() {
    setLoading(true);
    setError("");

    try {
      // Check logged-in user
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

      // Verify current user's role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      const currentRole = profile?.role?.trim().toUpperCase();

      if (currentRole !== "ADMIN") {
        setError("Admin access required.");
        setLoading(false);
        return;
      }

      /*
       * Get organizers through secure Admin RPC.
       *
       * This avoids exposing other profiles through
       * the normal browser-side profiles query.
       */
      const { data, error: rpcError } = await supabase.rpc(
        "get_eventnest_admin_organizers"
      );

      if (rpcError) {
        throw rpcError;
      }

      const formattedOrganizers = (data || []).map((organizer) => ({
        id: organizer.organizer_id,
        full_name: organizer.organizer_name,
        role: organizer.organizer_role,
        created_at: organizer.organizer_created_at,
        eventCount: Number(organizer.event_count || 0),
      }));

      setOrganizers(formattedOrganizers);
    } catch (err) {
      console.error("Load organizers error:", err);

      setError(
        err?.message ||
          "Something went wrong while loading organizers."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* PAGE HEADER */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            EventNest
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Organizers
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            View and manage organizers registered in the EventNest
            system.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

            <p className="mt-4 text-sm text-slate-400">
              Loading organizers...
            </p>
          </div>
        ) : (
          <>
            {/* SUMMARY */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <p className="text-sm text-slate-500">
                Total Organizers
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {organizers.length}
              </p>
            </div>

            {/* EMPTY STATE */}
            {organizers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center sm:p-12">
                <h2 className="text-xl font-semibold text-white">
                  No organizers found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  No user with the ORGANIZER role is currently
                  available.
                </p>
              </div>
            ) : (
              /* ORGANIZER LIST */
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    All Organizers
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {organizers.length} organizer
                    {organizers.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                <div className="grid gap-4">
                  {organizers.map((organizer) => (
                    <div
                      key={organizer.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-blue-500/20 hover:bg-white/[0.06] sm:p-6"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        {/* ORGANIZER INFO */}
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-lg font-bold text-blue-400">
                            {getInitials(organizer.full_name)}
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-semibold text-white">
                              {organizer.full_name ||
                                "Unnamed Organizer"}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              Role:{" "}
                              <span className="text-blue-400">
                                {organizer.role}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* ORGANIZER DETAILS */}
                        <div className="flex flex-wrap gap-3">
                          <div className="rounded-xl border border-white/10 bg-[#08152b] px-4 py-3">
                            <p className="text-xs text-slate-500">
                              Events
                            </p>

                            <p className="mt-1 text-lg font-semibold text-white">
                              {organizer.eventCount}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-[#08152b] px-4 py-3">
                            <p className="text-xs text-slate-500">
                              Status
                            </p>

                            <p className="mt-1 text-sm font-semibold text-green-400">
                              Active
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

/* =========================
   INITIALS
========================= */

function getInitials(name) {
  if (!name) return "O";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}