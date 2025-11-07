"use client";

import { useParams } from "next/navigation";
import CommitteeLayout from "@/components/layout/CommitteeLayout";
import InspectionSummaryContent from "@/components/shared/inspection/InspectionSummaryContent";

export default function CommitteeInspectionSummaryPage() {
  const params = useParams();
  const inspectionId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <CommitteeLayout>
      <InspectionSummaryContent inspectionId={inspectionId} role="committee" />
    </CommitteeLayout>
  );
}
