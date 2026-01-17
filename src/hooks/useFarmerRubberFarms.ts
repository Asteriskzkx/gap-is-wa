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
  }, [status, router, session, lazyParams]);

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
