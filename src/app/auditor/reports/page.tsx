"use client";

import AuditorLayout from "@/components/layout/AuditorLayout";
import InspectionReports from "@/components/shared/InspectionReports";

export default function AuditorReportsPage() {
  return (
    <AuditorLayout>
      <InspectionReports defaultTab="pending" />
    </AuditorLayout>
  );
}
