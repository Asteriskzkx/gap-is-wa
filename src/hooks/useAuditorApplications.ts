import thaiProvinceData from "@/data/thai-provinces.json";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import { useCallback, useEffect, useRef, useState } from "react";

type SortOrder = 1 | -1 | 0 | null;

const AUDITOR_SEARCH_DEBOUNCE_MS = 500;

interface LazyParams {
  first: number;
  rows: number;
  page: number;
  sortField?: string;
  sortOrder: SortOrder;
  multiSortMeta: Array<{ field: string; order: SortOrder }>;
}

export function useAuditorApplications(initialRows = 10) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Rubber farms state
  const [rubberFarms, setRubberFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  // Inspection types state
  const [inspectionTypes, setInspectionTypes] = useState<any[]>([]);

  // Auditors state
  const [auditors, setAuditors] = useState<any[]>([]);
  const [auditorsTotalRecords, setAuditorsTotalRecords] = useState(0);
  const [auditorSearchTerm, setAuditorSearchTerm] = useState("");
  const [debouncedAuditorSearchTerm, setDebouncedAuditorSearchTerm] =
    useState("");
  const auditorSearchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Province/district/subdistrict selection (ids)
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null
  );
  const [selectedSubDistrictId, setSelectedSubDistrictId] = useState<
    number | null
  >(null);

  // Applied names for API params
  const [appliedProvinceName, setAppliedProvinceName] = useState<string>("");
  const [appliedDistrictName, setAppliedDistrictName] = useState<string>("");
  const [appliedSubDistrictName, setAppliedSubDistrictName] =
    useState<string>("");

  // Lazy params for rubber farms
  const [lazyParams, setLazyParams] = useState<LazyParams>({
    first: 0,
    rows: initialRows,
    page: 0,
    sortField: undefined,
    sortOrder: null,
    multiSortMeta: [],
  });

  // Lazy params for auditors
  const [auditorsLazyParams, setAuditorsLazyParams] = useState<LazyParams>({
    first: 0,
    rows: initialRows,
    page: 0,
    sortField: undefined,
    sortOrder: null,
    multiSortMeta: [],
  });

  // Debounce auditor search term
  useEffect(() => {
    if (auditorSearchDebounceTimerRef.current) {
      clearTimeout(auditorSearchDebounceTimerRef.current);
    }

    auditorSearchDebounceTimerRef.current = setTimeout(() => {
      setDebouncedAuditorSearchTerm(auditorSearchTerm);
      setAuditorsLazyParams((p) =>
        p.first === 0 && p.page === 0 ? p : { ...p, first: 0, page: 0 }
      );
    }, AUDITOR_SEARCH_DEBOUNCE_MS);

    return () => {
      if (auditorSearchDebounceTimerRef.current) {
        clearTimeout(auditorSearchDebounceTimerRef.current);
      }
    };
  }, [auditorSearchTerm]);

  const fetchRubberFarms = useCallback(async () => {
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

      // Location filters
      if (appliedProvinceName) params.set("province", appliedProvinceName);
      if (appliedDistrictName) params.set("district", appliedDistrictName);
      if (appliedSubDistrictName)
        params.set("subDistrict", appliedSubDistrictName);

      // Sorting
      if (sortField) params.set("sortField", String(sortField));
      if (sortOrder !== undefined && sortOrder !== null)
        params.set("sortOrder", String(sortOrder === 1 ? "asc" : "desc"));
      if (multiSortMeta?.length) {
        const validSortMeta = multiSortMeta.filter(
          (item) => item.order === 1 || item.order === -1
        );
        if (validSortMeta.length > 0) {
          params.set("multiSortMeta", JSON.stringify(validSortMeta));
        }
      }

      const resp = await fetch(
        `/api/v1/auditors/available-farms?${params.toString()}`
      );
      if (!resp.ok) throw new Error("Failed to fetch rubber farms");
      const data = await resp.json();

      if (data.results && data.paginator) {
        setRubberFarms(data.results || []);
        setTotalRecords(data.paginator?.total ?? (data.results || []).length);
      } else {
        setRubberFarms([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching rubber farms:", error);
      setRubberFarms([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [
    status,
    router,
    lazyParams,
    appliedProvinceName,
    appliedDistrictName,
    appliedSubDistrictName,
  ]);

  const fetchInspectionTypes = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/inspections/types");
      if (response.ok) {
        const data = await response.json();
        setInspectionTypes(data);
      }
    } catch (error) {
      console.error("Error fetching inspection types:", error);
    }
  }, []);

  const fetchAuditors = useCallback(async () => {
    if (status === "loading") return;
    if (status !== "authenticated") return;

    try {
      setLoading(true);
      const { first, rows, multiSortMeta, sortField, sortOrder } =
        auditorsLazyParams;
      const params = new URLSearchParams();
      params.set("limit", String(rows));
      params.set("offset", String(first));

      // Search filter
      if (debouncedAuditorSearchTerm)
        params.set("search", debouncedAuditorSearchTerm);

      // Sorting
      if (sortField) params.set("sortField", String(sortField));
      if (sortOrder !== undefined && sortOrder !== null)
        params.set("sortOrder", String(sortOrder === 1 ? "asc" : "desc"));
      if (multiSortMeta?.length) {
        const validSortMeta = multiSortMeta.filter(
          (item) => item.order === 1 || item.order === -1
        );
        if (validSortMeta.length > 0) {
          params.set("multiSortMeta", JSON.stringify(validSortMeta));
        }
      }

      const resp = await fetch(
        `/api/v1/auditors/other-auditors?${params.toString()}`
      );
      if (!resp.ok) throw new Error("Failed to fetch auditors");
      const data = await resp.json();

      if (data.results && data.paginator) {
        setAuditors(data.results || []);
        setAuditorsTotalRecords(
          data.paginator?.total ?? (data.results || []).length
        );
      } else {
        setAuditors([]);
        setAuditorsTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching auditors:", error);
      setAuditors([]);
      setAuditorsTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [status, auditorsLazyParams, debouncedAuditorSearchTerm]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchRubberFarms();
    }
  }, [status, fetchRubberFarms]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchInspectionTypes();
    }
  }, [status, fetchInspectionTypes]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAuditors();
    }
  }, [status, fetchAuditors]);

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

  const handleAuditorPageChange = useCallback((event: DataTablePageEvent) => {
    setAuditorsLazyParams((prev) => ({
      ...prev,
      first: event.first,
      rows: event.rows,
      page: event.page || 0,
    }));
  }, []);

  const handleAuditorSort = useCallback((event: DataTableSortEvent) => {
    setAuditorsLazyParams((prev) => ({
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

    // Map selected ids to names using thaiProvinceData
    if (selectedProvinceId) {
      const prov: any = (thaiProvinceData as any).find(
        (p: any) => p.id === selectedProvinceId
      );
      setAppliedProvinceName(prov?.name_th || "");
    } else {
      setAppliedProvinceName("");
    }

    if (selectedDistrictId) {
      let districtName = "";
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
      setAppliedDistrictName("");
    }

    if (selectedSubDistrictId) {
      let subName = "";
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
      setAppliedSubDistrictName("");
    }
  }, [selectedProvinceId, selectedDistrictId, selectedSubDistrictId]);

  const clearFilters = useCallback(() => {
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedSubDistrictId(null);
    setAppliedProvinceName("");
    setAppliedDistrictName("");
    setAppliedSubDistrictName("");
    setLazyParams((p) => ({ ...p, first: 0 }));
  }, []);

  const applyAuditorSearch = useCallback(() => {
    if (auditorSearchDebounceTimerRef.current) {
      clearTimeout(auditorSearchDebounceTimerRef.current);
    }
    setDebouncedAuditorSearchTerm(auditorSearchTerm);
    setAuditorsLazyParams((p) => ({ ...p, first: 0, page: 0 }));
  }, [auditorSearchTerm]);

  const refresh = useCallback(() => {
    fetchRubberFarms();
    fetchAuditors();
  }, [fetchRubberFarms, fetchAuditors]);

  // Fetch farm details
  const fetchFarmDetails = useCallback(async (farmId: number) => {
    try {
      const response = await fetch(`/api/v1/rubber-farms/${farmId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch farm details");
      }
      const farmData = await response.json();

      const farmerId = Number(farmData?.farmerId);
      if (farmerId) {
        try {
          const farmerResponse = await fetch(`/api/v1/farmers/${farmerId}`);
          if (farmerResponse.ok) {
            const farmerData = await farmerResponse.json();
            farmData.farmer = farmerData?.farmer ?? farmerData;
          }
        } catch (error) {
          console.error("Error fetching farmer details:", error);
        }
      }

      return farmData;
    } catch (error) {
      console.error("Error fetching farm details:", error);
      throw error;
    }
  }, []);

  // Schedule inspection
  const scheduleInspection = useCallback(
    async (payload: {
      rubberFarmId: number;
      inspectionTypeId: number;
      inspectionDateAndTime: string;
      additionalAuditorIds: number[];
    }) => {
      try {
        const response = await fetch("/api/v1/inspections/schedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to schedule inspection");
        }

        const data = await response.json();
        // Refresh the list after scheduling
        await fetchRubberFarms();
        return data;
      } catch (error: any) {
        console.error("Error scheduling inspection:", error);
        throw error;
      }
    },
    [fetchRubberFarms]
  );

  return {
    // Rubber farms
    rubberFarms,
    loading,
    totalRecords,
    lazyParams,
    handlePageChange,
    handleSort,

    // Inspection types
    inspectionTypes,

    // Auditors
    auditors,
    auditorsTotalRecords,
    auditorsLazyParams,
    auditorSearchTerm,
    setAuditorSearchTerm,
    isAuditorSearchDebouncing: auditorSearchTerm !== debouncedAuditorSearchTerm,
    handleAuditorPageChange,
    handleAuditorSort,
    applyAuditorSearch,

    // Filters
    selectedProvinceId,
    selectedDistrictId,
    selectedSubDistrictId,
    setSelectedProvinceId,
    setSelectedDistrictId,
    setSelectedSubDistrictId,
    applyFilters,
    clearFilters,

    // API actions
    fetchFarmDetails,
    scheduleInspection,

    // Utility
    refresh,
  };
}
