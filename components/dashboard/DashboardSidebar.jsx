"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const menus = {
  ADMIN: [
    {
      section: "MAIN",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: "⌂" },
        { name: "Events", href: "/dashboard/events", icon: "▣" },
        { name: "Competitions", href: "/dashboard/competitions", icon: "🏆" },
      ],
    },
    {
      section: "PEOPLE",
      items: [
        { name: "Organizers", href: "/dashboard/organizers", icon: "◉" },
        { name: "Volunteers", href: "/dashboard/volunteers", icon: "♙" },
        {
          name: "Competition Members",
          href: "/dashboard/competition-members",
          icon: "◎",
        },
        { name: "Participants", href: "/dashboard/participants", icon: "●" },
      ],
    },
    {
      section: "OPERATIONS",
      items: [
        { name: "Payments", href: "/dashboard/payments", icon: "₹" },
        { name: "Tickets & QR", href: "/dashboard/tickets", icon: "▤" },
        {
          name: "Announcements",
          href: "/dashboard/announcements",
          icon: "◈",
        },
        { name: "Reports", href: "/dashboard/reports", icon: "▥" },
      ],
    },
  ],

  ORGANIZER: [
    {
      section: "MAIN",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: "⌂" },
        { name: "My Events", href: "/dashboard/events", icon: "▣" },
        {
          name: "Competitions",
          href: "/dashboard/competitions",
          icon: "🏆",
        },
      ],
    },
    {
      section: "MANAGEMENT",
      items: [
        {
          name: "Participants",
          href: "/dashboard/participants",
          icon: "●",
        },
        {
          name: "Competition Members",
          href: "/dashboard/competition-members",
          icon: "◎",
        },
        { name: "Schedule", href: "/dashboard/schedule", icon: "◷" },
      ],
    },
    {
      section: "OPERATIONS",
      items: [
        { name: "Payments", href: "/dashboard/payments", icon: "₹" },
        { name: "Tickets & QR", href: "/dashboard/tickets", icon: "▤" },
        {
          name: "Announcements",
          href: "/dashboard/announcements",
          icon: "◈",
        },
        { name: "Results", href: "/dashboard/results", icon: "▥" },
      ],
    },
  ],

  VOLUNTEER: [
    {
      section: "MAIN",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: "⌂" },
        { name: "My Events", href: "/dashboard/events", icon: "▣" },
      ],
    },
    {
      section: "MY ASSIGNMENTS",
      items: [
        { name: "My Tasks", href: "/dashboard/tasks", icon: "✓" },
        { name: "Schedule", href: "/dashboard/schedule", icon: "◷" },
        {
          name: "Instructions",
          href: "/dashboard/instructions",
          icon: "◈",
        },
      ],
    },
  ],

  PARTICIPANT: [
    {
      section: "MAIN",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: "⌂" },
        { name: "Browse Events", href: "/events", icon: "▣" },
      ],
    },
    {
      section: "MY PARTICIPATION",
      items: [
        {
          name: "My Registrations",
          href: "/dashboard/registrations",
          icon: "◎",
        },
        {
          name: "My Competitions",
          href: "/dashboard/competitions",
          icon: "🏆",
        },
        {
          name: "My Tickets & QR",
          href: "/dashboard/tickets",
          icon: "▤",
        },
        {
          name: "Payment History",
          href: "/dashboard/payments",
          icon: "₹",
        },
        {
          name: "Announcements",
          href: "/dashboard/announcements",
          icon: "◈",
        },
      ],
    },
  ],
};

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRole() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        setLoading(false);
        return;
      }

      setRole(profile.role);
      setLoading(false);
    }

    loadRole();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  const currentMenu = menus[role] || menus.PARTICIPANT;

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-[#050b18] text-white">
      {/* Logo */}
      <div className="border-b border-white/10 px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold">
            E
          </div>

          <div>
            <p className="font-bold">EventNest</p>
            <p className="text-xs text-slate-500">
              Smart Event Management
            </p>
          </div>
        </Link>
      </div>

      {/* Role */}
      <div className="border-b border-white/10 px-6 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Current Role
        </p>

        <p className="mt-1 text-sm font-semibold text-blue-400">
          {loading ? "Loading..." : role || "PARTICIPANT"}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5">
        {currentMenu.map((section) => (
          <div key={section.section} className="mb-7">
            <p className="mb-3 px-3 text-[11px] font-semibold tracking-widest text-slate-600">
              {section.section}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                      active
                        ? "bg-blue-600/15 text-blue-400"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <span className="flex w-5 justify-center">
                      {item.icon}
                    </span>

                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Account */}
      <div className="border-t border-white/10 p-4">
        <Link
          href="/dashboard/profile"
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
        >
          <span className="w-5 text-center">◯</span>
          Profile
        </Link>

        <Link
          href="/dashboard/settings"
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
        >
          <span className="w-5 text-center">⚙</span>
          Settings
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
        >
          <span className="w-5 text-center">↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}