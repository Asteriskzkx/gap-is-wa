import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

type SortOrder = 1 | -1 | 0 | null;

interface LazyParams {
  first: number;
  rows: number;
  page: number;
  sortField?: string;
  sortOrder: SortOrder;
  multiSortMeta: Array<{ field: string; order: SortOrder }>;
}

export function useRevokeCertificate(initialRows = 10) {
  const router = useRouter();
  const { status } = useSession();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [appliedFromDate, setAppliedFromDate] = useState<Date | null>(null);
  const [appliedToDate, setAppliedToDate] = useState<Date | null>(null);
  const [appliedCancelRequestFlag, setAppliedCancelRequestFlag] = useState<
    string | null
  >("true");

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
      params.set("activeFlag", "true");
      if (
        appliedCancelRequestFlag !== undefined &&
        appliedCancelRequestFlag !== null
      ) {
        params.set("cancelRequestFlag", String(appliedCancelRequestFlag));
      }
      if (appliedFromDate)
        params.set("fromDate", appliedFromDate.toISOString());
      if (appliedToDate) params.set("toDate", appliedToDate.toISOString());
      if (sortField) params.set("sortField", String(sortField));
      if (sortOrder !== undefined && sortOrder !== null)
        params.set("sortOrder", String(sortOrder === 1 ? "asc" : "desc"));
      if (multiSortMeta?.length)
        params.set("multiSortMeta", JSON.stringify(multiSortMeta));

      const resp = await fetch(
        `/api/v1/certificates/revoke-list?${params.toString()}`
      );
      if (!resp.ok) throw new Error("Failed to fetch revoke-list certificates");
      const data = await resp.json();
      setItems(data.results || []);
      setTotalRecords(data.paginator?.total ?? (data.results || []).length);
    } catch (err) {
      console.error("useRevokeCertificate fetch error:", err);
      setItems([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [
    status,
    router,
    lazyParams,
    appliedFromDate,
    appliedToDate,
    appliedCancelRequestFlag,
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
  }, [fromDate, toDate]);

  const onTabChange = useCallback((field: string, value: string) => {
    // only support cancelRequestFlag for now
    if (field === "cancelRequestFlag") {
      setAppliedCancelRequestFlag(value);
      setLazyParams((p) => ({ ...p, first: 0 }));
    }
  }, []);

  const clearFilters = useCallback(() => {
    setFromDate(null);
    setToDate(null);
    setAppliedFromDate(null);
    setAppliedToDate(null);
    setLazyParams((p) => ({ ...p, first: 0 }));
  }, []);

  const openFiles = useCallback(async (certificateId: number) => {
    try {
      const params = new URLSearchParams();
      params.set("tableReference", "Certificate");
      params.set("idReference", String(certificateId));

      const resp = await fetch(`/api/v1/files/get-files?${params.toString()}`);
      if (!resp.ok) throw new Error("Failed to fetch files");
      const data = await resp.json();
      const files = data.files || [];
      if (!files.length) {
        if (globalThis.window !== undefined)
          toast.error("ไม่พบไฟล์สำหรับใบรับรองนี้");
        return;
      }

      const url = files[0].url;
      if (url && globalThis.window !== undefined) {
        const w = globalThis.window.open(url, "_blank", "noopener,noreferrer");
        if (w) w.focus();
      } else if (globalThis.window !== undefined) {
        toast.error("ไม่พบ URL ของไฟล์");
      }
    } catch (err) {
      console.error("openFiles error:", err);
      if (globalThis.window !== undefined)
        toast.error("เกิดข้อผิดพลาดขณะดึงไฟล์");
    }
  }, []);

  const revokeCertificate = useCallback(
    async (
      certificateId: number,
      cancelRequestDetail?: string,
      version?: number
    ) => {
      try {
        const body: any = { certificateId };
        if (cancelRequestDetail !== undefined)
          body.cancelRequestDetail = cancelRequestDetail;
        if (version !== undefined) body.version = version;

        const resp = await fetch(`/api/v1/certificates/revoke`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!resp.ok) {
          const err = await resp.text();
          throw new Error(err || "Failed to revoke certificate");
        }

        // After revoking the certificate, delete any related files
        try {
          const delParams = new URLSearchParams();
          delParams.set("tableReference", "Certificate");
          delParams.set("idReference", String(certificateId));

          const delResp = await fetch(
            `/api/v1/files/delete?${delParams.toString()}`,
            {
              method: "DELETE",
            }
          );

          if (!delResp.ok) {
            // Log but don't fail the whole operation for a file-delete error
            const txt = await delResp.text().catch(() => "");
            console.warn(
              "Failed deleting certificate files:",
              delResp.status,
              txt
            );
            if (globalThis.window !== undefined) {
              toast.success(
                "ยกเลิกใบรับรองเรียบร้อยแล้ว (แต่ไม่สามารถลบไฟล์ได้)"
              );
            }
          } else if (globalThis.window !== undefined) {
            toast.success("ยกเลิกใบรับรองเรียบร้อยแล้ว");
          }
        } catch (err) {
          console.error("Error deleting certificate files:", err);
          if (globalThis.window !== undefined)
            toast.success("ยกเลิกใบรับรองเรียบร้อยแล้ว (ไฟล์อาจยังอยู่)");
        }

        // Refresh the list after successful revoke
        await fetchItems();
        return true;
      } catch (err) {
        console.error("revokeCertificate error:", err);
        if (globalThis.window !== undefined)
          toast.error("เกิดข้อผิดพลาดขณะยกเลิกใบรับรอง");
        return false;
      }
    },
    [fetchItems]
  );

  return {
    items,
    loading,
    totalRecords,
    lazyParams,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    applyFilters,
    clearFilters,
    handlePageChange,
    handleSort,
    setRows: (rows: number) => setLazyParams((p) => ({ ...p, rows })),
    openFiles,
    revokeCertificate,
    currentTab:
      appliedCancelRequestFlag === "true" ? "revocation-requests" : "other",
    onTabChange,
  };
}
