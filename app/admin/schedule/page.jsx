"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SchedulePage from "@/components/schedule/SchedulePage";

export default function AdminSchedulePage() {
  return (
    <DashboardLayout>
      <SchedulePage title="Schedule" />
    </DashboardLayout>
  );
}