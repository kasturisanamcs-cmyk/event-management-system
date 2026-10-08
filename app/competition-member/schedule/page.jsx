"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SchedulePage from "@/components/schedule/SchedulePage";

export default function CompetitionMemberSchedulePage() {
  return (
    <DashboardLayout>
      <SchedulePage title="Competition Schedule" />
    </DashboardLayout>
  );
}