import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getInspectionSummaryRoute } from "@/lib/routeHelpers";
import { useSession } from "next-auth/react";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";

type SortOrder = 1 | -1 | 0 | null;

interface LazyParams {
  first: number;
  rows: number;
  page: number;
  sortField?: string;
  sortOrder: SortOrder;
  multiSortMeta: Array<{ field: string; order: SortOrder }>;
}

interface Inspection {
  inspectionId: number;
  inspectionNo: number;
  inspectionDateAndTime: string;
  inspectionStatus: string;
  inspectionResult: string;
  auditorChiefId: number;
  rubberFarmId: number;
  rubberFarm?: {
    villageName: string;
    district: string;
    province: string;
    farmer?: {
      namePrefix: string;
      firstName: string;
      lastName: string;
    };
  };
}

export function useInspectionReports(
  initialTab: "pending" | "completed" = "pending"
) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState<"pending" | "completed">(
    initialTab
  );
  const [filters, setFilters] = useState<{
    province?: string;
    district?: string;
    subDistrict?: string;
  }>({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState<LazyParams>({
    first: 0,
    rows: 10,
    page: 0,
    sortField: undefined,
    sortOrder: null,
    multiSortMeta: [],
  });

  const fetchInspections = useCallback(async () => {
    // wait until session status is resolved
    if (status === "loading") {
      return;
    }

    if (status !== "authenticated") {
      router.push("/");
      return;
    }

    try {
      setLoading(true);

      const auditorId = session?.user?.roleData?.auditorId;
      const { first, rows, multiSortMeta } = lazyParams;

      // build query params; include auditorId only when present
      const params = new URLSearchParams({
        limit: rows.toString(),
        offset: first.toString(),
      });

      if (auditorId) {
        params.append("auditorId", auditorId.toString());
      }

      if (currentTab === "pending") {
        params.append("inspectionStatus", "ตรวจประเมินแล้ว");
        params.append("inspectionResult", "รอผลการตรวจประเมิน");
      } else {
        params.append("inspectionStatus", "ตรวจประเมินแล้ว");
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      // include location filters when provided
      if (filters.province) params.append("province", filters.province);
      if (filters.district) params.append("district", filters.district);
      if (filters.subDistrict)
        params.append("subDistrict", filters.subDistrict);

      if (multiSortMeta && multiSortMeta.length > 0) {
        params.append("multiSortMeta", JSON.stringify(multiSortMeta));
      }

      const response = await fetch(`/api/v1/inspections?${params.toString()}`);

      if (!response.ok) {
        throw new Error("ไม่สามารถดึงรายการตรวจประเมินได้");
      }

      const data = await response.json();

      let results = data.results || [];
      if (currentTab === "completed") {
        results = results.filter(
          (inspection: Inspection) =>
            inspection.inspectionResult !== "รอผลการตรวจประเมิน"
        );
      }

      setInspections(results);
      // support both shapes: { results, paginator: { total } } and legacy { total }
      const totalFromPaginator = data?.paginator?.total;
      setTotalRecords(totalFromPaginator ?? data.total ?? results.length);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      setInspections([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [session, status, router, lazyParams, currentTab, searchTerm, filters]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

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
      sortOrder: event.sortOrder ?? null,
      multiSortMeta: (event.multiSortMeta || []) as Array<{
        field: string;
        order: SortOrder;
      }>,
    }));
  }, []);

  const handleTabChange = useCallback((tab: "pending" | "completed") => {
    setCurrentTab(tab);
    setLazyParams((prev) => ({
      ...prev,
      first: 0,
      page: 0,
    }));
  }, []);

  const handleViewDetails = useCallback(
    (inspectionId: number) => {
      // route to the correct inspection summary page depending on the user's role
      // prefer explicit role from session.user.role if available, otherwise
      // infer from roleData fields (auditorId / committeeId)
      const roleFromSession = (session as any)?.user?.role as
        | string
        | undefined;

      // normalize role to lowercase to handle different casing (e.g. 'COMMITTEE')
      const normalizedRoleFromSession = roleFromSession
        ? roleFromSession.toLowerCase()
        : undefined;

      const hasCommittee =
        (session as any)?.user?.roleData?.committeeId !== undefined &&
        (session as any)?.user?.roleData?.committeeId !== null;

      const hasAuditor =
        (session as any)?.user?.roleData?.auditorId !== undefined &&
        (session as any)?.user?.roleData?.auditorId !== null;

      let role = normalizedRoleFromSession || roleFromSession;
      if (!role) {
        if (hasCommittee) role = "committee";
        else if (hasAuditor) role = "auditor";
        else role = "auditor";
      }

      router.push(getInspectionSummaryRoute(role, inspectionId));
    },
    [router, session]
  );

  return {
    inspections,
    loading,
    searchTerm,
    setSearchTerm,
    currentTab,
    totalRecords,
    lazyParams,
    status,
    handlePageChange,
    handleSort,
    handleTabChange,
    handleViewDetails,
    filters,
    setFilters,
  };
}
