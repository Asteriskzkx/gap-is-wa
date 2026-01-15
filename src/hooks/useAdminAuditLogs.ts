import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";

export interface AuditLogItem {
  auditLogId: number;
  tableName: string;
  recordId: number;
  userId: number | null;
  operatorName?: string | null;
  action: string;
  oldData: Record<string, any> | null;
  newData: Record<string, any> | null;
  createdAt: string;
}

type SortOrder = 1 | -1 | 0 | null;

interface LazyParams {
  first: number;
  rows: number;
  page: number;
  sortField?: string;
  sortOrder: SortOrder;
  multiSortMeta: Array<{ field: string; order: SortOrder }>;
}

export function useAdminAuditLogs(initialRows = 10) {
  const router = useRouter();
  const { status } = useSession();

  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deletingOldLogs, setDeletingOldLogs] = useState(false);

  // Filter states
  const [tableName, setTableName] = useState<string>("");
  const [recordId, setRecordId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [action, setAction] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Applied filter states
  const [appliedTableName, setAppliedTableName] = useState<string>("");
  const [appliedRecordId, setAppliedRecordId] = useState<number | null>(null);
  const [appliedUserId, setAppliedUserId] = useState<number | null>(null);
  const [appliedAction, setAppliedAction] = useState<string>("");
  const [appliedStartDate, setAppliedStartDate] = useState<Date | null>(null);
  const [appliedEndDate, setAppliedEndDate] = useState<Date | null>(null);

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

      if (appliedTableName) params.set("tableName", appliedTableName);
      if (appliedRecordId !== null)
        params.set("recordId", String(appliedRecordId));
      if (appliedUserId !== null) params.set("userId", String(appliedUserId));
      if (appliedAction) params.set("action", appliedAction);
      if (appliedStartDate)
        params.set("startDate", appliedStartDate.toISOString());
      if (appliedEndDate) params.set("endDate", appliedEndDate.toISOString());

      if (sortField) params.set("sortField", String(sortField));
      if (sortOrder !== undefined && sortOrder !== null)
        params.set("sortOrder", String(sortOrder === 1 ? "asc" : "desc"));
      if (multiSortMeta?.length)
        params.set("multiSortMeta", JSON.stringify(multiSortMeta));

      const resp = await fetch(
        `/api/v1/audit-logs/paginated?${params.toString()}`
      );
      if (!resp.ok) throw new Error("Failed to fetch audit logs");

      const data = await resp.json();
      setItems(data.results || []);
      setTotalRecords(data.paginator?.total ?? (data.results || []).length);
    } catch (err) {
      console.error("useAdminAuditLogs fetch error:", err);
      setItems([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [
    status,
    router,
    lazyParams,
    appliedTableName,
    appliedRecordId,
    appliedUserId,
    appliedAction,
    appliedStartDate,
    appliedEndDate,
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
    setAppliedTableName(tableName);
    setAppliedRecordId(recordId);
    setAppliedUserId(userId);
    setAppliedAction(action);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  }, [tableName, recordId, userId, action, startDate, endDate]);

  const clearFilters = useCallback(() => {
    setTableName("");
    setRecordId(null);
    setUserId(null);
    setAction("");
    setStartDate(null);
    setEndDate(null);
    setAppliedTableName("");
    setAppliedRecordId(null);
    setAppliedUserId(null);
    setAppliedAction("");
    setAppliedStartDate(null);
    setAppliedEndDate(null);
    setLazyParams((p) => ({ ...p, first: 0 }));
  }, []);

  const countOldLogs = useCallback(async (days: number): Promise<number> => {
    try {
      const resp = await fetch(`/api/v1/audit-logs/old/count?days=${days}`);
      if (!resp.ok) throw new Error("Failed to count old logs");
      const data = await resp.json();
      return data.count || 0;
    } catch (err) {
      console.error("useAdminAuditLogs countOldLogs error:", err);
      return 0;
    }
  }, []);

  const deleteOldLogs = useCallback(
    async (
      days: number
    ): Promise<{ success: boolean; deletedCount: number }> => {
      if (deletingOldLogs) {
        return { success: false, deletedCount: 0 };
      }

      setDeletingOldLogs(true);
      try {
        const resp = await fetch(`/api/v1/audit-logs/old?days=${days}`, {
          method: "DELETE",
        });
        if (!resp.ok) throw new Error("Failed to delete old logs");
        const data = await resp.json();
        // Refresh the list after deletion
        await fetchItems();
        return { success: true, deletedCount: data.deletedCount || 0 };
      } catch (err) {
        console.error("useAdminAuditLogs deleteOldLogs error:", err);
        return { success: false, deletedCount: 0 };
      } finally {
        setDeletingOldLogs(false);
      }
    },
    [fetchItems, deletingOldLogs]
  );

  return {
    items,
    loading,
    totalRecords,
    lazyParams,
    deletingOldLogs,
    // Filter states
    tableName,
    setTableName,
    recordId,
    setRecordId,
    userId,
    setUserId,
    action,
    setAction,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    // Actions
    applyFilters,
    clearFilters,
    handlePageChange,
    handleSort,
    setRows: (rows: number) => setLazyParams((p) => ({ ...p, rows })),
    deleteOldLogs,
    countOldLogs,
  };
}
