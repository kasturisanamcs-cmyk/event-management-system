"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardHeader({ title = "Dashboard" }) {
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
    <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#020817] px-6">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage your EventNest activities
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-white">
            {user?.user_metadata?.full_name || "EventNest User"}
          </p>

          <p className="text-xs text-slate-500">
            {user?.email || "Loading..."}
          </p>
        </div>

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