import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export function useReadyToIssueInspections(initialRows = 5) {
  const router = useRouter();
  const { status } = useSession();

  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [lazyParams, setLazyParams] = useState<LazyParams>({
    first: 0,
    rows: initialRows,
    page: 0,
    sortField: undefined,
    sortOrder: null,
    multiSortMeta: [],
  });

  const fetchInspections = useCallback(async () => {
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
      if (fromDate) params.set("from", fromDate.toISOString());
      if (toDate) params.set("to", toDate.toISOString());
      if (sortField) params.set("sortField", String(sortField));
      if (sortOrder !== undefined && sortOrder !== null)
        params.set("sortOrder", String(sortOrder));
      if (multiSortMeta?.length)
        params.set("multiSortMeta", JSON.stringify(multiSortMeta));

      const response = await fetch(
        `/api/v1/inspections/ready-to-issue?${params.toString()}`
      );
      if (!response.ok)
        throw new Error("Failed to fetch ready-to-issue inspections");
      const data = await response.json();
      setInspections(data.results || []);
      setTotalRecords(
        data.paginator?.total ?? data.total ?? (data.results || []).length
      );
    } catch (err) {
      console.error("useReadyToIssueInspections fetch error:", err);
      setInspections([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [status, router, lazyParams, fromDate, toDate]);

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
      sortOrder: (event.sortOrder ?? null) as SortOrder,
      multiSortMeta: (event.multiSortMeta || []) as Array<{
        field: string;
        order: SortOrder;
      }>,
    }));
  }, []);

  return {
    inspections,
    loading,
    totalRecords,
    lazyParams,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    handlePageChange,
    handleSort,
    setRows: (rows: number) => setLazyParams((p) => ({ ...p, rows })),
  };
}
