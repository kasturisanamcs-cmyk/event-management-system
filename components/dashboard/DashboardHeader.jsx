"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardHeader({
  title = "Dashboard",
  onMenuClick,
}) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    loadUser();
  }, []);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "EventNest User";

  const email = user?.email || "Loading...";

  const initial =
    displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#020817]/95 backdrop-blur-xl">
      <div className="flex min-h-16 w-full items-center justify-between gap-3 px-4 sm:min-h-20 sm:px-6 lg:px-8">

        {/* LEFT SIDE */}
        <div className="flex min-w-0 items-center gap-3">

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.08] hover:text-white lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* TITLE */}
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-white sm:text-xl">
              {title}
            </h1>

            <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
              Manage your EventNest activities
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* USER INFORMATION */}
          <div className="hidden text-right md:block">
            <p className="max-w-[220px] truncate text-sm font-medium text-white">
              {displayName}
            </p>

            <p className="max-w-[220px] truncate text-xs text-slate-500">
              {email}
            </p>
          </div>

          {/* AVATAR */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-600/20 text-sm font-semibold text-blue-400 sm:h-10 sm:w-10">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}