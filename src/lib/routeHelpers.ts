export function getInspectionSummaryRoute(
  role: string,
  inspectionId: number | string
) {
  const r = (role || "").toString().toLowerCase();
  if (r === "committee")
    return `/committee/assessments/summary/${inspectionId}`;
  return `/auditor/inspection-summary/${inspectionId}`;
}

export function getInspectionDetailRoute(
  role: string,
  inspectionId: number | string,
  itemId: number | string
) {
  const r = (role || "").toString().toLowerCase();
  if (r === "committee")
    return `/committee/assessments/summary/detail/${inspectionId}/${itemId}`;
  return `/auditor/inspection-detail/${inspectionId}/${itemId}`;
}
