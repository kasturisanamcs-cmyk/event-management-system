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
          href: "/competition-member/participants",
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
          name: "Announcements",
          href: "/dashboard/announcements",
          icon: "◇",
        },
        {
          name: "Schedule",
          href: "/dashboard/schedule",
          icon: "◷",
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
          name: "Announcements",
          href: "/dashboard/announcements",
          icon: "◇",
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

export default function DashboardSidebar({
  mobileOpen = false,
  onClose = () => {},
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * ---------------------------------------------------------
   * LOAD USER ROLE
   *
   * Supabase authenticated user + profiles.role
   * is the ONLY source of truth.
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */

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

    onClose();

    router.replace("/login");
    router.refresh();
  }

  /*
   * ---------------------------------------------------------
   * ROLE SELECTION
   *
   * IMPORTANT:
   *
   * DO NOT use pathname to determine role.
   *
   * Example:
   *
   * ADMIN visiting:
   * /participant/events
   *
   * MUST remain ADMIN.
   *
   * ADMIN visiting:
   * /competition-member/attendance
   *
   * MUST remain ADMIN.
   *
   * The URL only determines the page.
   * It NEVER changes the authenticated user's role.
   * ---------------------------------------------------------
   */

  const currentRole = role
    ? role.trim().toUpperCase()
    : null;

  const currentMenu =
    currentRole && menus[currentRole]
      ? menus[currentRole]
      : [];

  const displayRole = loading
    ? "Loading..."
    : currentRole || "USER";

  /*
   * ---------------------------------------------------------
   * DASHBOARD ROUTES
   * ---------------------------------------------------------
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

  /*
   * ---------------------------------------------------------
   * PROFILE ROUTES
   * ---------------------------------------------------------
   */

  const profileHref =
    currentRole === "PARTICIPANT"
      ? "/participant/profile"
      : currentRole === "ORGANIZER"
      ? "/organizer/profile"
      : currentRole === "COMPETITION_MEMBER"
      ? "/competition-member/profile"
      : "/dashboard/profile";

  /*
   * ---------------------------------------------------------
   * SETTINGS ROUTES
   * ---------------------------------------------------------
   */

  const settingsHref =
    currentRole === "PARTICIPANT"
      ? "/participant/settings"
      : currentRole === "ORGANIZER"
      ? "/organizer/settings"
      : currentRole === "COMPETITION_MEMBER"
      ? "/competition-member/settings"
      : "/dashboard/settings";

  /*
   * ---------------------------------------------------------
   * MOBILE + DESKTOP SIDEBAR
   * ---------------------------------------------------------
   */

  return (
    <>
      {/* MOBILE BACKDROP */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          h-screen
          w-[280px]
          shrink-0
          flex-col
          border-r
          border-white/10
          bg-[#050b18]
          text-white
          shadow-2xl
          transition-transform
          duration-300
          ease-out

          lg:sticky
          lg:top-0
          lg:z-30
          lg:w-72
          lg:translate-x-0
          lg:shadow-none

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* =================================================
            LOGO
        ================================================== */}

        <div className="relative shrink-0 border-b border-white/10 px-5 py-5 sm:px-6">
          <Link
            href={dashboardHref}
            onClick={onClose}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white">
              E
            </div>

            <div className="min-w-0">
              <p className="font-bold text-white">
                EventNest
              </p>

              <p className="truncate text-xs text-slate-500">
                Smart Event Management
              </p>
            </div>
          </Link>

          {/* MOBILE CLOSE BUTTON */}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* =================================================
            CURRENT ROLE
        ================================================== */}

        <div className="shrink-0 border-b border-white/10 px-5 py-4 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Current Role
          </p>

          <p className="mt-1 text-sm font-semibold text-blue-400">
            {displayRole}
          </p>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================== */}

        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-5 sm:px-4">
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
                    (item.href !== dashboardHref &&
                      pathname.startsWith(
                        item.href + "/"
                      ));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex
                        min-h-11
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        text-sm
                        transition

                        ${
                          active
                            ? "bg-blue-600/15 text-blue-400"
                            : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                        }
                      `}
                    >
                      <span className="flex w-5 shrink-0 justify-center text-sm">
                        {item.icon}
                      </span>

                      <span className="min-w-0 truncate">
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* =================================================
            ACCOUNT
        ================================================== */}

        <div className="shrink-0 border-t border-white/10 p-3 sm:p-4">
          {/* PROFILE */}

          <Link
            href={profileHref}
            onClick={onClose}
            className="mb-1 flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <span className="flex w-5 justify-center">
              ◯
            </span>

            Profile
          </Link>

          {/* SETTINGS */}

          <Link
            href={settingsHref}
            onClick={onClose}
            className="mb-1 flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <span className="flex w-5 justify-center">
              ⚙
            </span>

            Settings
          </Link>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
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