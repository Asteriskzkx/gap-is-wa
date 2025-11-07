"use client";

import CommitteeLayout from "@/components/layout/CommitteeLayout";
import InspectionReports from "@/components/shared/InspectionReports";

export default function CommitteeAssessmentsPage() {
  return (
    <CommitteeLayout>
      <InspectionReports
        title="พิจารณาผลการตรวจประเมิน"
        defaultTab="completed"
        subtitle="พิจารณาและออกใบรับรองตามผลการตรวจประเมิน"
      />
    </CommitteeLayout>
  );
}
