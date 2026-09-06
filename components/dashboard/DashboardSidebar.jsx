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
          href: "/dashboard",
          icon: "▣",
        },
        {
          name: "Events",
          href: "/dashboard/events",
          icon: "▤",
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
          icon: "◉",
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
          icon: "▤",
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
          icon: "▤",
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

export default function DashboardSidebar({
  mobileOpen = false,
  onClose,
}) {
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

        const { data: profile, error: profileError } = await supabase
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
          setRole(profile?.role || null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Dashboard sidebar error:", error);

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

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  /*
   * IMPORTANT:
   *
   * We intentionally DO NOT redirect based on pathname here.
   *
   * An organizer can legitimately visit:
   *
   * /dashboard/events
   * /dashboard/events/[id]
   * /dashboard/events/[id]/competitions
   * /dashboard/events/[id]/organizers
   *
   * These routes must NOT automatically send the organizer
   * back to /organizer/dashboard.
   */

  let currentRole = role;

  /*
   * The URL is only used to select the visual menu.
   * It is NOT used to perform redirects.
   */

  if (pathname.startsWith("/participant")) {
    currentRole = "PARTICIPANT";
  } else if (pathname.startsWith("/organizer")) {
    currentRole = "ORGANIZER";
  }

  /*
   * If an organizer is inside /dashboard/*
   * keep the ORGANIZER menu.
   */

  if (
    role === "ORGANIZER" &&
    pathname.startsWith("/dashboard")
  ) {
    currentRole = "ORGANIZER";
  }

  /*
   * If admin is inside /dashboard/*
   * show ADMIN menu.
   */

  if (
    role === "ADMIN" &&
    pathname.startsWith("/dashboard")
  ) {
    currentRole = "ADMIN";
  }

  const currentMenu = menus[currentRole] || [];

  const displayRole = loading
    ? "Loading..."
    : currentRole || "USER";

  const dashboardHref =
    currentRole === "PARTICIPANT"
      ? "/participant/dashboard"
      : currentRole === "ORGANIZER"
      ? "/organizer/dashboard"
      : "/dashboard";

  const profileHref =
    currentRole === "PARTICIPANT"
      ? "/participant/profile"
      : "/dashboard/profile";

  const settingsHref =
    currentRole === "PARTICIPANT"
      ? "/participant/settings"
      : "/dashboard/settings";

  function handleNavigation() {
    if (onClose) {
      onClose();
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-[#050b18] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:translate-x-0 lg:shadow-none ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* =====================================================
            LOGO
        ====================================================== */}

        <div className="border-b border-white/10 px-6 py-5">

          <div className="flex items-center justify-between">

            <Link
              href={dashboardHref}
              onClick={handleNavigation}
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

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

          </div>

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
                      pathname.startsWith(item.href + "/")
                    );

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleNavigation}
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
            onClick={handleNavigation}
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
            onClick={handleNavigation}
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
    </>
  );
}