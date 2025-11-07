"use client";

import { useParams } from "next/navigation";
import CommitteeLayout from "@/components/layout/CommitteeLayout";
import InspectionDetailContent from "@/components/shared/inspection/InspectionDetailContent";

export default function CommitteeInspectionDetailPage() {
  const params = useParams();
  const inspectionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const itemId = Array.isArray(params.itemId)
    ? params.itemId[0]
    : params.itemId;

  return (
    <CommitteeLayout>
      <InspectionDetailContent inspectionId={inspectionId} itemId={itemId} />
    </CommitteeLayout>
  );
}
