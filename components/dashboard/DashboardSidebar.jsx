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
        {
          name: "Dashboard",
          href: "/admin/dashboard",
          icon: "▣",
        },
        {
          name: "Events",
          href: "/dashboard/events",
          icon: "◈",
        },
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
          name: "Organizers",
          href: "/dashboard/organizers",
          icon: "◎",
        },
        {
          name: "Participants",
          href: "/dashboard/participants",
          icon: "●",
        },
        {
          name: "Competition Members",
          href: "/dashboard/competition-members",
          icon: "○",
        },
      ],
    },

    {
      section: "OPERATIONS",
      items: [
        {
          name: "Payments",
          href: "/dashboard/payments",
          icon: "₹",
        },
        {
          name: "Tickets & QR",
          href: "/dashboard/tickets",
          icon: "▣",
        },
        {
          name: "Announcements",
          href: "/dashboard/announcements",
          icon: "◇",
        },
        {
          name: "Results",
          href: "/dashboard/results",
          icon: "◆",
        },
      ],
    },
  ],

  ORGANIZER: [
    {
      section: "MAIN",
      items: [
        {
          name: "Dashboard",
          href: "/organizer/dashboard",
          icon: "▣",
        },
        {
          name: "My Events",
          href: "/dashboard/events",
          icon: "◈",
        },
        {
          name: "Competitions",
          href: "/organizer/competitions",
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
          icon: "○",
        },
        {
          name: "Schedule",
          href: "/dashboard/schedule",
          icon: "◷",
        },
      ],
    },

    {
      section: "OPERATIONS",
      items: [
        {
          name: "Payments",
          href: "/dashboard/payments",
          icon: "₹",
        },
        {
          name: "Tickets & QR",
          href: "/dashboard/tickets",
          icon: "▣",
        },
        {
          name: "Announcements",
          href: "/dashboard/announcements",
          icon: "◇",
        },
        {
          name: "Results",
          href: "/dashboard/results",
          icon: "◆",
        },
      ],
    },
  ],

  COMPETITION_MEMBER: [
    {
      section: "MAIN",
      items: [
        {
          name: "Dashboard",
          href: "/competition-member/dashboard",
          icon: "▣",
        },
        {
          name: "My Competitions",
          href: "/competition-member/competitions",
          icon: "🏆",
        },
        {
          name: "Registrations",
          href: "/competition-member/registrations",
          icon: "✓",
        },
        {
          name: "Participants",
          href: "/competition-member/participants",
          icon: "●",
        },
      ],
    },

    {
      section: "OPERATIONS",
      items: [
        {
          name: "Schedule",
          href: "/competition-member/schedule",
          icon: "◷",
        },
        {
          name: "Offline Payments",
          href: "/competition-member/payments",
          icon: "₹",
        },
        {
          name: "Tickets & QR",
          href: "/competition-member/tickets",
          icon: "▣",
        },
        {
          name: "QR Check-In",
          href: "/competition-member/scan",
          icon: "⌾",
        },
        {
          name: "Attendance",
          href: "/competition-member/attendance",
          icon: "✓",
        },
        {
          name: "Announcements",
          href: "/competition-member/announcements",
          icon: "◇",
        },
      ],
    },
  ],

  PARTICIPANT: [
    {
      section: "MAIN",
      items: [
        {
          name: "Dashboard",
          href: "/participant/dashboard",
          icon: "▣",
        },
        {
          name: "Browse Events",
          href: "/participant/events",
          icon: "◇",
        },
      ],
    },

    {
      section: "MY PARTICIPATION",
      items: [
        {
          name: "My Registrations",
          href: "/participant/registrations",
          icon: "✓",
        },
        {
          name: "My Competitions",
          href: "/participant/events",
          icon: "🏆",
        },
        {
          name: "My Tickets & QR",
          href: "/participant/tickets",
          icon: "▣",
        },
        {
          name: "Payment History",
          href: "/participant/payments",
          icon: "₹",
        },
        {
          name: "Announcements",
          href: "/participant/announcements",
          icon: "🔔",
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
    let mounted = true;

    async function loadRole() {
      const supabase = createClient();

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (mounted) {
            router.replace("/login");
          }

          return;
        }

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile error:", profileError);

          if (mounted) {
            setRole(null);
            setLoading(false);
          }

          return;
        }

        if (mounted) {
          setRole(
            profile?.role
              ? profile.role.trim().toUpperCase()
              : null
          );

          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Dashboard sidebar error:",
          error
        );

        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRole();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout failed:",
        error
      );
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  /*
   * The pathname only controls which menu
   * should be visually displayed.
   *
   * It does NOT redirect the user.
   */

  let currentRole = role;

  if (pathname.startsWith("/participant")) {
    currentRole = "PARTICIPANT";
  } else if (
    pathname.startsWith("/organizer")
  ) {
    currentRole = "ORGANIZER";
  } else if (
    pathname.startsWith("/competition-member")
  ) {
    currentRole = "COMPETITION_MEMBER";
  }

  /*
   * IMPORTANT:
   *
   * /dashboard/* is shared by ADMIN and ORGANIZER.
   *
   * Therefore:
   * ADMIN + /dashboard/* → ADMIN menu
   * ORGANIZER + /dashboard/* → ORGANIZER menu
   */

  if (
    role === "ORGANIZER" &&
    pathname.startsWith("/dashboard")
  ) {
    currentRole = "ORGANIZER";
  }

  if (
    role === "ADMIN" &&
    pathname.startsWith("/dashboard")
  ) {
    currentRole = "ADMIN";
  }

  /*
   * If admin is specifically on /admin/*
   * keep ADMIN menu.
   */

  if (
    role === "ADMIN" &&
    pathname.startsWith("/admin")
  ) {
    currentRole = "ADMIN";
  }

  const currentMenu =
    menus[currentRole] || [];

  const displayRole = loading
    ? "Loading..."
    : currentRole || "USER";

  /*
   * CORRECT DASHBOARD ROUTES
   */

  const dashboardHref =
    currentRole === "ADMIN"
      ? "/admin/dashboard"
      : currentRole === "ORGANIZER"
      ? "/organizer/dashboard"
      : currentRole === "COMPETITION_MEMBER"
      ? "/competition-member/dashboard"
      : currentRole === "PARTICIPANT"
      ? "/participant/dashboard"
      : "/login";

  const profileHref =
    currentRole === "PARTICIPANT"
      ? "/participant/profile"
      : "/dashboard/profile";

  const settingsHref =
    currentRole === "PARTICIPANT"
      ? "/participant/settings"
      : "/dashboard/settings";

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-[#050b18] text-white">

      {/* =====================================================
          LOGO
      ====================================================== */}

      <div className="border-b border-white/10 px-6 py-5">

        <Link
          href={dashboardHref}
          className="flex items-center gap-3"
        >

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white">
            E
          </div>

          <div>
            <p className="font-bold text-white">
              EventNest
            </p>

            <p className="text-xs text-slate-500">
              Smart Event Management
            </p>
          </div>

        </Link>

      </div>

      {/* =====================================================
          CURRENT ROLE
      ====================================================== */}

      <div className="border-b border-white/10 px-6 py-4">

        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Current Role
        </p>

        <p className="mt-1 text-sm font-semibold text-blue-400">
          {displayRole}
        </p>

      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav className="flex-1 overflow-y-auto px-4 py-5">

        {currentMenu.map((section) => (

          <div
            key={section.section}
            className="mb-7"
          >

            <p className="mb-3 px-3 text-[11px] font-semibold tracking-widest text-slate-600">
              {section.section}
            </p>

            <div className="space-y-1">

              {section.items.map((item) => {

                const active =
                  pathname === item.href ||
                  (
                    item.href !== dashboardHref &&
                    pathname.startsWith(
                      item.href + "/"
                    )
                  );

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                      active
                        ? "bg-blue-600/15 text-blue-400"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >

                    <span className="flex w-5 shrink-0 justify-center text-sm">
                      {item.icon}
                    </span>

                    <span>
                      {item.name}
                    </span>

                  </Link>
                );

              })}

            </div>

          </div>

        ))}

      </nav>

      {/* =====================================================
          ACCOUNT
      ====================================================== */}

      <div className="border-t border-white/10 p-4">

        {/* Profile */}

        <Link
          href={profileHref}
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
        >

          <span className="flex w-5 justify-center">
            ◯
          </span>

          Profile

        </Link>

        {/* Settings */}

        <Link
          href={settingsHref}
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
        >

          <span className="flex w-5 justify-center">
            ⚙
          </span>

          Settings

        </Link>

        {/* Logout */}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
        >

          <span className="flex w-5 justify-center">
            ↪
          </span>

          Logout

        </button>

      </div>

    </aside>
  );
}