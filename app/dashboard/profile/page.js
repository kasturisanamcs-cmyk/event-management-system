"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const supabase = createClient();

    setLoading(true);
    setError("");
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    setEmail(user.email || "");

    const {
      data,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(
        "id, full_name, role, created_at"
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(profileError);
      setError("Could not load your profile.");
      setLoading(false);
      return;
    }

    setProfile(data);
    setFullName(data.full_name || "");
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setError("Full name cannot be empty.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Full name must contain at least 2 characters.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You are not logged in.");
      }

      /*
       * =====================================================
       * 1. UPDATE PROFILES TABLE
       * =====================================================
       */

      const {
        data: updatedProfile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .update({
          full_name: trimmedName,
        })
        .eq("id", user.id)
        .select(
          "id, full_name, role, created_at"
        )
        .single();

      if (profileError) {
        throw profileError;
      }

      /*
       * =====================================================
       * 2. UPDATE SUPABASE AUTH USER METADATA
       *
       * DashboardHeader may use user_metadata.full_name.
       * Updating this keeps both sources synchronized.
       * =====================================================
       */

      const {
        data: updatedAuth,
        error: metadataError,
      } = await supabase.auth.updateUser({
        data: {
          full_name: trimmedName,
          name: trimmedName,
        },
      });

      if (metadataError) {
        console.error(
          "Auth metadata update error:",
          metadataError
        );

        /*
         * The database profile has already been updated.
         * We don't fail the entire operation because of
         * metadata synchronization.
         */
      }

      /*
       * =====================================================
       * UPDATE LOCAL STATE
       * =====================================================
       */

      setProfile(updatedProfile);
      setFullName(updatedProfile.full_name || "");

      /*
       * Refresh the current auth session so components
       * using Supabase user metadata receive the new name.
       */

      if (updatedAuth?.user) {
        setEmail(
          updatedAuth.user.email || ""
        );
      }

      setMessage(
        "Profile updated successfully."
      );

      /*
       * Refresh the page after a short delay.
       * This ensures DashboardHeader gets the latest
       * user information.
       */

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err?.message ||
          "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-400">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">

      {/* HEADER */}

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          My Profile
        </h1>

        <p className="mt-3 text-slate-400">
          View and manage your EventNest account
          information.
        </p>
      </div>

      {/* PROFILE CARD */}

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">

        {/* AVATAR */}

        <div className="mb-8 flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20 text-2xl font-bold text-blue-400">
            {fullName?.charAt(0)?.toUpperCase() ||
              "U"}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              {fullName || "EventNest User"}
            </h2>

            <p className="text-sm text-slate-500">
              {profile?.role ||
                "PARTICIPANT"}
            </p>
          </div>

        </div>

        <form
          onSubmit={handleSave}
          className="space-y-6"
        >

          {/* FULL NAME */}

          <div>
            <label
              htmlFor="full_name"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Full Name
            </label>

            <input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your full name"
              maxLength={100}
            />
          </div>

          {/* EMAIL */}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-slate-500 outline-none"
            />

            <p className="mt-2 text-xs text-slate-600">
              Email is managed by your authentication
              account.
            </p>
          </div>

          {/* ROLE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Role
            </label>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">

              <span className="text-slate-400">
                Your EventNest role
              </span>

              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                {profile?.role ||
                  "PARTICIPANT"}
              </span>

            </div>

            <p className="mt-2 text-xs text-slate-600">
              Your role cannot be changed from your
              profile.
            </p>
          </div>

          {/* ACCOUNT CREATED */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Account Created
            </label>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-500">
              {profile?.created_at
                ? new Date(
                    profile.created_at
                  ).toLocaleDateString()
                : "Not available"}
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {message && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          )}

          {/* SAVE */}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </form>
      </div>
    </div>
  );
}