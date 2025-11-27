import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import thaiProvinceData from "@/data/thai-provinces.json";

type SortOrder = 1 | -1 | 0 | null;

interface LazyParams {
  first: number;
  rows: number;
  page: number;
  sortField?: string;
  sortOrder: SortOrder;
  multiSortMeta: Array<{ field: string; order: SortOrder }>;
}

export function useAuditorGardenData(initialRows = 10) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  // province/district/subdistrict selection (ids)
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null
  );
  const [selectedSubDistrictId, setSelectedSubDistrictId] = useState<
    number | null
  >(null);

  const [appliedFromDate, setAppliedFromDate] = useState<Date | null>(null);
  const [appliedToDate, setAppliedToDate] = useState<Date | null>(null);
  // applied names for API params
  const [appliedProvinceName, setAppliedProvinceName] = useState<string | null>(
    null
  );
  const [appliedDistrictName, setAppliedDistrictName] = useState<string | null>(
    null
  );
  const [appliedSubDistrictName, setAppliedSubDistrictName] = useState<
    string | null
  >(null);
  const [appliedTab, setAppliedTab] = useState<string>("in-progress");

  const [lazyParams, setLazyParams] = useState<LazyParams>({
    first: 0,
    rows: initialRows,
    page: 0,
    sortField: undefined,
    sortOrder: null,
    multiSortMeta: [],
  });

  const fetchItems = useCallback(async () => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      router.push("/");
      return;
    }

    try {
      setLoading(true);
      const { first, rows, multiSortMeta, sortField, sortOrder } = lazyParams;
      const params = new URLSearchParams();
      params.set("limit", String(rows));
      params.set("offset", String(first));

      // get auditor id from session roleData if available
      const auditorId = (session as any)?.user?.roleData?.auditorId;
      if (auditorId) params.set("auditorId", String(auditorId));

      // tab filters
      if (appliedTab === "in-progress") {
        // รอการตรวจประเมิน และ รอผลการตรวจประเมิน
        params.set("inspectionStatus", "รอการตรวจประเมิน");
        params.set("inspectionResult", "รอผลการตรวจประเมิน");
      } else if (appliedTab === "completed") {
        params.set("inspectionStatus", "ตรวจประเมินแล้ว");
      }

      if (appliedFromDate)
        params.set("fromDate", appliedFromDate.toISOString());
      if (appliedToDate) params.set("toDate", appliedToDate.toISOString());

      // location filters (names)
      if (appliedProvinceName) params.set("province", appliedProvinceName);
      if (appliedDistrictName) params.set("district", appliedDistrictName);
      if (appliedSubDistrictName)
        params.set("subDistrict", appliedSubDistrictName);
      if (sortField) params.set("sortField", String(sortField));
      if (sortOrder !== undefined && sortOrder !== null)
        params.set("sortOrder", String(sortOrder === 1 ? "asc" : "desc"));
      if (multiSortMeta?.length)
        params.set("multiSortMeta", JSON.stringify(multiSortMeta));

      const resp = await fetch(`/api/v1/inspections?${params.toString()}`);
      if (!resp.ok) throw new Error("Failed to fetch inspections for auditor");
      const data = await resp.json();
      setItems(data.results || []);
      setTotalRecords(data.paginator?.total ?? (data.results || []).length);
    } catch (err) {
      console.error("useAuditorGardenData fetch error:", err);
      setItems([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [
    status,
    router,
    session,
    lazyParams,
    appliedFromDate,
    appliedToDate,
    appliedTab,
    appliedProvinceName,
    appliedDistrictName,
    appliedSubDistrictName,
  ]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handlePageChange = useCallback((event: DataTablePageEvent) => {
    setLazyParams((prev) => ({
      ...prev,
      first: event.first,
      rows: event.rows,
      page: event.page || 0,
    }));
  }, []);

  const handleSort = useCallback((event: DataTableSortEvent) => {
    setLazyParams((prev) => ({
      ...prev,
      sortField: event.sortField ? String(event.sortField) : undefined,
      sortOrder: (event.sortOrder ?? null) as SortOrder,
      multiSortMeta: (event.multiSortMeta || []) as Array<{
        field: string;
        order: SortOrder;
      }>,
    }));
  }, []);

  const applyFilters = useCallback(() => {
    setLazyParams((p) => ({ ...p, first: 0 }));
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    // map selected ids to names using thaiProvinceData
    if (selectedProvinceId) {
      const prov: any = (thaiProvinceData as any).find(
        (p: any) => p.id === selectedProvinceId
      );
      setAppliedProvinceName(prov?.name_th || null);
    } else {
      setAppliedProvinceName(null);
    }

    if (selectedDistrictId) {
      // find district across provinces
      let districtName: string | null = null;
      for (const p of thaiProvinceData as any) {
        const found = (p.amphure || []).find(
          (a: any) => a.id === selectedDistrictId
        );
        if (found) {
          districtName = found.name_th;
          break;
        }
      }
      setAppliedDistrictName(districtName);
    } else {
      setAppliedDistrictName(null);
    }

    if (selectedSubDistrictId) {
      let subName: string | null = null;
      for (const p of thaiProvinceData as any) {
        for (const a of p.amphure || []) {
          const found = (a.tambon || []).find(
            (t: any) => t.id === selectedSubDistrictId
          );
          if (found) {
            subName = found.name_th;
            break;
          }
        }
        if (subName) break;
      }
      setAppliedSubDistrictName(subName);
    } else {
      setAppliedSubDistrictName(null);
    }
  }, [
    fromDate,
    toDate,
    selectedProvinceId,
    selectedDistrictId,
    selectedSubDistrictId,
  ]);

  const clearFilters = useCallback(() => {
    setFromDate(null);
    setToDate(null);
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedSubDistrictId(null);
    setAppliedFromDate(null);
    setAppliedToDate(null);
    setAppliedProvinceName(null);
    setAppliedDistrictName(null);
    setAppliedSubDistrictName(null);
    setLazyParams((p) => ({ ...p, first: 0 }));
  }, []);

  const onTabChange = useCallback((field: string, value: string) => {
    if (field === "inspectionTab") {
      setAppliedTab(value);
      setLazyParams((p) => ({ ...p, first: 0 }));
    }
  }, []);

  return {
    items,
    loading,
    totalRecords,
    lazyParams,
    fromDate,
    toDate,
    selectedProvinceId,
    selectedDistrictId,
    selectedSubDistrictId,
    setFromDate,
    setToDate,
    setSelectedProvinceId,
    setSelectedDistrictId,
    setSelectedSubDistrictId,
    applyFilters,
    clearFilters,
    handlePageChange,
    handleSort,
    setRows: (rows: number) => setLazyParams((p) => ({ ...p, rows })),
    currentTab: appliedTab === "completed" ? "completed" : "in-progress",
    onTabChange,
  };
}
