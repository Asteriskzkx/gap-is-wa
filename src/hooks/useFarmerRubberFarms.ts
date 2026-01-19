import thaiProvinceData from "@/data/thai-provinces.json";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type SortOrder = 1 | -1 | 0 | null;

interface LazyParams {
  first: number;
  rows: number;
  page: number;
  sortField?: string;
  sortOrder: SortOrder;
  multiSortMeta: Array<{ field: string; order: SortOrder }>;
}

export function useFarmerRubberFarms(initialRows = 10) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null
  );
  const [selectedSubDistrictId, setSelectedSubDistrictId] = useState<
    number | null
  >(null);

  const [appliedProvinceName, setAppliedProvinceName] = useState<string | null>(
    null
  );
  const [appliedDistrictName, setAppliedDistrictName] = useState<string | null>(
    null
  );
  const [appliedSubDistrictName, setAppliedSubDistrictName] = useState<
    string | null
  >(null);

  const [farmDetails, setFarmDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isShowDetails, setIsShowDetails] = useState(false);

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

    const farmerId = session?.user?.roleData?.farmerId;
    if (!farmerId) {
      setItems([]);
      setTotalRecords(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { first, rows, multiSortMeta, sortField, sortOrder } = lazyParams;
      const params = new URLSearchParams();
      params.set("farmerId", String(farmerId));
      params.set("limit", String(rows));
      params.set("offset", String(first));

      if (appliedProvinceName) params.set("province", appliedProvinceName);
      if (appliedDistrictName) params.set("district", appliedDistrictName);
      if (appliedSubDistrictName)
        params.set("subDistrict", appliedSubDistrictName);

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

      const resp = await fetch(`/api/v1/rubber-farms?${params.toString()}`);
      if (!resp.ok) throw new Error("Failed to fetch rubber farms for farmer");
      const data = await resp.json();

      if (data.results && data.paginator) {
        setItems(data.results || []);
        setTotalRecords(data.paginator?.total ?? (data.results || []).length);
      } else {
        const rows = Array.isArray(data) ? data : [];
        setItems(rows);
        setTotalRecords(rows.length);
      }
    } catch (err) {
      console.error("useFarmerRubberFarms fetch error:", err);
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

    if (selectedProvinceId) {
      const prov: any = (thaiProvinceData as any).find(
        (p: any) => p.id === selectedProvinceId
      );
      setAppliedProvinceName(prov?.name_th || null);
    } else {
      setAppliedProvinceName(null);
    }

    if (selectedDistrictId) {
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
  }, [selectedProvinceId, selectedDistrictId, selectedSubDistrictId]);

  const clearFilters = useCallback(() => {
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedSubDistrictId(null);
    setAppliedProvinceName(null);
    setAppliedDistrictName(null);
    setAppliedSubDistrictName(null);
    setLazyParams((p) => ({ ...p, first: 0 }));
  }, []);

  const openDetails = useCallback(async (farmId: number) => {
    try {
      setIsShowDetails(true);
      setDetailsLoading(true);
      setFarmDetails(null);

      const resp = await fetch(`/api/v1/rubber-farms/${farmId}`);
      if (!resp.ok) throw new Error("Failed to fetch rubber farm details");
      const data = await resp.json();
      setFarmDetails(data || null);
    } catch (err) {
      console.error("openDetails error:", err);
      toast.error("ไม่สามารถดึงข้อมูลสวนยางได้");
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const closeDetails = useCallback(() => {
    setIsShowDetails(false);
    setFarmDetails(null);
  }, []);

  return {
    items,
    loading,
    totalRecords,
    lazyParams,
    selectedProvinceId,
    selectedDistrictId,
    selectedSubDistrictId,
    setSelectedProvinceId,
    setSelectedDistrictId,
    setSelectedSubDistrictId,
    applyFilters,
    clearFilters,
    handlePageChange,
    handleSort,
    setRows: (rows: number) => setLazyParams((p) => ({ ...p, rows })),
    openDetails,
    closeDetails,
    farmDetails,
    detailsLoading,
    isShowDetails,
  };
}
