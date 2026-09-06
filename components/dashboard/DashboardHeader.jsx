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

  return (
    <header className="flex min-h-20 items-center justify-between border-b border-white/10 bg-[#020817] px-4 sm:px-6">

      {/* Left Side */}
      <div className="flex min-w-0 items-center gap-3">

        {/* Mobile Menu Button */}
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

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-white sm:text-xl">
            {title}
          </h1>

          <p className="mt-1 hidden text-xs text-slate-500 sm:block">
            Manage your EventNest activities
          </p>
        </div>

      </div>


      {/* Right Side */}
      <div className="flex shrink-0 items-center gap-3">

        {/* User Information */}
        <div className="hidden text-right md:block">
          <p className="text-sm font-medium text-white">
            {user?.user_metadata?.full_name || "EventNest User"}
          </p>

          <p className="max-w-[220px] truncate text-xs text-slate-500">
            {user?.email || "Loading..."}
          </p>
        </div>

        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 font-semibold text-blue-400">
          {(
            user?.user_metadata?.full_name ||
            user?.email ||
            "U"
          )
            .charAt(0)
            .toUpperCase()}
        </div>

      </div>

    </header>
  );
}