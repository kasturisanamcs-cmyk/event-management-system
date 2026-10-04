"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

const DashboardShellContext = createContext(false);

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);

  const alreadyInsideDashboard =
    useContext(DashboardShellContext);

  /*
   * ---------------------------------------------------------
   * CLOSE MOBILE SIDEBAR WHEN ROUTE CHANGES
   * ---------------------------------------------------------
   */

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /*
   * ---------------------------------------------------------
   * PREVENT DUPLICATE DASHBOARD SHELL
   * ---------------------------------------------------------
   */

  if (alreadyInsideDashboard) {
    return <>{children}</>;
  }

  /*
   * ---------------------------------------------------------
   * DASHBOARD AREA CHECK
   * ---------------------------------------------------------
   */

  const isDashboardArea =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/organizer" ||
    pathname.startsWith("/organizer/") ||
    pathname === "/participant" ||
    pathname.startsWith("/participant/") ||
    pathname === "/competition-member" ||
    pathname.startsWith("/competition-member/");

  if (!isDashboardArea) {
    return <>{children}</>;
  }

  /*
   * ---------------------------------------------------------
   * PAGE TITLE
   * ---------------------------------------------------------
   */

  let title = "Dashboard";

  // =========================================================
  // ADMIN
  // =========================================================

  if (
    pathname === "/dashboard" ||
    pathname === "/admin" ||
    pathname === "/admin/dashboard"
  ) {
    title = "Admin Dashboard";
  } else if (
    pathname === "/dashboard/events" ||
    pathname === "/admin/events"
  ) {
    title = "Events";
  } else if (
    pathname === "/dashboard/events/create-event" ||
    pathname === "/admin/events/create-event"
  ) {
    title = "Create Event";
  } else if (
    pathname.startsWith("/dashboard/events/") ||
    pathname.startsWith("/admin/events/")
  ) {
    title = "Event Management";
  } else if (
    pathname === "/dashboard/competitions" ||
    pathname === "/admin/competitions"
  ) {
    title = "Competitions";
  } else if (
    pathname === "/dashboard/organizers" ||
    pathname === "/admin/organizers"
  ) {
    title = "Organizers";
  } else if (
    pathname === "/dashboard/participants" ||
    pathname === "/admin/participants"
  ) {
    title = "Participants";
  } else if (
    pathname === "/dashboard/competition-members" ||
    pathname === "/admin/competition-members"
  ) {
    title = "Competition Members";
  } else if (
    pathname === "/dashboard/payments" ||
    pathname === "/admin/payments"
  ) {
    title = "Payments";
  } else if (
    pathname === "/dashboard/tickets" ||
    pathname === "/admin/tickets"
  ) {
    title = "Tickets & QR";
  } else if (
    pathname === "/dashboard/announcements" ||
    pathname === "/admin/announcements"
  ) {
    title = "Announcements";
  } else if (
    pathname === "/dashboard/results" ||
    pathname === "/admin/results"
  ) {
    title = "Results";
  } else if (
    pathname === "/dashboard/schedule" ||
    pathname === "/admin/schedule"
  ) {
    title = "Schedule";
  }

  // =========================================================
  // ORGANIZER
  // =========================================================

  else if (
    pathname === "/organizer/dashboard" ||
    pathname === "/organizer"
  ) {
    title = "Organizer Dashboard";
  } else if (pathname === "/organizer/events") {
    title = "My Events";
  } else if (
    pathname === "/organizer/competitions" ||
    pathname === "/organizer/competitions/"
  ) {
    title = "Competitions";
  } else if (
    pathname.startsWith("/organizer/events/") &&
    pathname.includes("/competitions/create")
  ) {
    title = "Create Competition";
  } else if (
    pathname.startsWith("/organizer/events/")
  ) {
    title = "Event Management";
  } else if (
    pathname.startsWith("/organizer/competitions/")
  ) {
    title = "Competition Management";
  }

  // =========================================================
  // PARTICIPANT
  // =========================================================

  else if (pathname === "/participant/dashboard") {
    title = "Participant Dashboard";
  } else if (
    pathname === "/participant/events" ||
    pathname === "/participant/events/"
  ) {
    title = "Browse Events";
  } else if (
    pathname.startsWith(
      "/participant/events/details/competition/"
    )
  ) {
    title = "Competition Details";
  } else if (
    pathname === "/participant/registrations"
  ) {
    title = "My Registrations";
  } else if (
    pathname === "/participant/tickets"
  ) {
    title = "My Tickets & QR";
  } else if (
    pathname === "/participant/payments"
  ) {
    title = "Payment History";
  } else if (
    pathname === "/participant/announcements"
  ) {
    title = "Announcements";
  } else if (
    pathname === "/participant/profile"
  ) {
    title = "My Profile";
  } else if (
    pathname === "/participant/settings"
  ) {
    title = "Settings";
  }

  // =========================================================
  // COMPETITION MEMBER
  // =========================================================

  else if (
    pathname === "/competition-member" ||
    pathname === "/competition-member/dashboard"
  ) {
    title = "Competition Member Dashboard";
  } else if (
    pathname === "/competition-member/competitions"
  ) {
    title = "My Competitions";
  } else if (
    pathname === "/competition-member/participants"
  ) {
    title = "Participants";
  } else if (
    pathname === "/competition-member/attendance"
  ) {
    title = "Attendance";
  } else if (
    pathname === "/competition-member/results"
  ) {
    title = "Results";
  } else if (
    pathname === "/competition-member/announcements"
  ) {
    title = "Announcements";
  }

  /*
   * ---------------------------------------------------------
   * DASHBOARD SHELL
   * ---------------------------------------------------------
   */

  return (
    <DashboardShellContext.Provider value={true}>
      <div className="flex min-h-screen w-full overflow-x-hidden bg-[#020617] text-white">

        {/* =================================================
            SIDEBAR
        ================================================== */}

        <DashboardSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        {/* =================================================
            MAIN AREA
        ================================================== */}

        <div className="flex min-w-0 flex-1 flex-col">

          {/* HEADER */}

          <DashboardHeader
            title={title}
            onMenuClick={() => setMobileOpen(true)}
          />

          {/* PAGE CONTENT */}

          <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
            {children}
          </main>

        </div>
      </div>
    </DashboardShellContext.Provider>
  );
}