"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SchedulePage from "@/components/schedule/SchedulePage";

export default function ParticipantSchedulePage() {
  return (
    <DashboardLayout>
      <SchedulePage title="My Schedule" />
    </DashboardLayout>
  );
}