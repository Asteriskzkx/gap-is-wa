"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";

export interface RubberFarm {
  rubberFarmId: number;
  farmId?: string;
  villageName: string;
  moo: number;
  location?: string;
  district: string;
  province: string;
  subDistrict: string;
  createdAt: string;
}

export interface Inspection {
  inspectionId: number;
  inspectionNo: string;
  inspectionDateAndTime: string;
  inspectionStatus: string;
  inspectionResult: string;
  rubberFarmId: number;
}

export interface ApplicationItem {
  rubberFarm: RubberFarm;
  inspection?: Inspection;
}

type SortOrder = 1 | -1 | 0 | null;

export function useFarmerApplications(initialRows = 10) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [farmsPagination, setFarmsPagination] = useState({
    first: 0,
    rows: initialRows,
    totalRecords: 0,
  });

  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [multiSortMeta, setMultiSortMeta] = useState<
    Array<{ field: string; order: SortOrder }>
  >([]);

  const fetchApplicationsWithPagination = useCallback(
    async (
      farmerId: number,
      offset = 0,
      limit = initialRows,
      sorting?: {
        sortField?: string;
        sortOrder?: string;
        multiSortMeta?: Array<{ field: string; order: number }>;
      }
    ) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          farmerId: farmerId.toString(),
          limit: limit.toString(),
          offset: offset.toString(),
          includeInspections: "true",
        });

        if (sorting?.sortField) params.append("sortField", sorting.sortField);
        if (sorting?.sortOrder) params.append("sortOrder", sorting.sortOrder);
        if (sorting?.multiSortMeta) {
          const validSortMeta = sorting.multiSortMeta.filter(
            (item) => item.order === 1 || item.order === -1
          );
          if (validSortMeta.length > 0)
            params.append("multiSortMeta", JSON.stringify(validSortMeta));
        }

        const farmsResponse = await fetch(
          `/api/v1/rubber-farms?${params.toString()}`
        );

        if (!farmsResponse.ok) {
          setError("ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
          setLoading(false);
          return;
        }

        const result = await farmsResponse.json();
        let farms: any[] = [];

        if (result.results && result.paginator) {
          farms = result.results;
          setFarmsPagination({
            first: result.paginator.offset,
            rows: result.paginator.limit,
            totalRecords: result.paginator.total,
          });
        } else {
          farms = result;
          setFarmsPagination({
            first: 0,
            rows: limit,
            totalRecords: result.length || 0,
          });
        }

        const allApplicationItems: ApplicationItem[] = farms.map(
          (farm: any) => ({
            rubberFarm: {
              rubberFarmId: farm.rubberFarmId,
              farmId: farm.farmId,
              villageName: farm.villageName,
              moo: farm.moo,
              location: farm.location,
              district: farm.district,
              province: farm.province,
              subDistrict: farm.subDistrict,
              createdAt: farm.createdAt,
            },
            inspection: farm.inspection || undefined,
          })
        );

        setApplications(allApplicationItems);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    },
    [initialRows]
  );

  useEffect(() => {
    if (status === "authenticated" && session?.user?.roleData?.farmerId) {
      let orderStr: string | undefined;
      if (sortOrder === 1) orderStr = "asc";
      else if (sortOrder === -1) orderStr = "desc";
      else orderStr = undefined;

      fetchApplicationsWithPagination(
        session.user.roleData.farmerId,
        0,
        farmsPagination.rows,
        {
          sortField,
          sortOrder: orderStr,
          multiSortMeta: multiSortMeta.filter(
            (item) => item.order === 1 || item.order === -1
          ) as Array<{ field: string; order: number }>,
        }
      );
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [
    status,
    session,
    router,
    fetchApplicationsWithPagination,
    farmsPagination.rows,
    sortField,
    sortOrder,
    multiSortMeta,
  ]);

  const onPageChange = useCallback(
    (event: DataTablePageEvent) => {
      if (session?.user?.roleData?.farmerId) {
        let orderStr: string | undefined;
        if (sortOrder === 1) orderStr = "asc";
        else if (sortOrder === -1) orderStr = "desc";
        else orderStr = undefined;

        fetchApplicationsWithPagination(
          session.user.roleData.farmerId,
          event.first,
          event.rows,
          {
            sortField,
            sortOrder: orderStr,
            multiSortMeta: multiSortMeta.filter(
              (item) => item.order === 1 || item.order === -1
            ) as Array<{ field: string; order: number }>,
          }
        );
      }
    },
    [
      session,
      fetchApplicationsWithPagination,
      sortField,
      sortOrder,
      multiSortMeta,
    ]
  );

  const onSortChange = useCallback(
    (event: DataTableSortEvent) => {
      if (event.multiSortMeta) {
        const validMultiSort = (event.multiSortMeta || []).filter(
          (item) => item.order !== undefined
        ) as Array<{ field: string; order: SortOrder }>;
        setMultiSortMeta(validMultiSort);
        const validSortMeta = validMultiSort.filter(
          (item) => item.order === 1 || item.order === -1
        ) as Array<{ field: string; order: number }>;
        if (session?.user?.roleData?.farmerId) {
          fetchApplicationsWithPagination(
            session.user.roleData.farmerId,
            farmsPagination.first,
            farmsPagination.rows,
            { multiSortMeta: validSortMeta }
          );
        }
      } else {
        setSortField(event.sortField ? String(event.sortField) : undefined);
        const validOrder = event.sortOrder ?? null;
        setSortOrder(validOrder as SortOrder);
        if (session?.user?.roleData?.farmerId) {
          fetchApplicationsWithPagination(
            session.user.roleData.farmerId,
            farmsPagination.first,
            farmsPagination.rows,
            {
              sortField: event.sortField,
              sortOrder: event.sortOrder === 1 ? "asc" : "desc",
            }
          );
        }
      }
    },
    [
      session,
      fetchApplicationsWithPagination,
      farmsPagination.first,
      farmsPagination.rows,
    ]
  );

  const formatThaiDate = useCallback((dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const getStatusInfo = useCallback((application: ApplicationItem) => {
    if (!application.inspection) {
      return {
        text: "รอกำหนดวันตรวจประเมิน",
        color: "bg-yellow-100 text-yellow-800",
      };
    }

    const inspection = application.inspection;
    const status = inspection.inspectionStatus;
    const result = inspection.inspectionResult;

    if (status === "รอการตรวจประเมิน") {
      return { text: "รอการตรวจประเมิน", color: "bg-blue-100 text-blue-800" };
    } else if (status === "ตรวจประเมินแล้ว") {
      if (result === "รอผลการตรวจประเมิน") {
        return {
          text: "ตรวจประเมินแล้ว รอสรุปผล",
          color: "bg-purple-100 text-purple-800",
        };
      } else if (result === "ผ่าน") {
        return { text: "ผ่านการรับรอง", color: "bg-green-100 text-green-800" };
      } else if (result === "ไม่ผ่าน") {
        return {
          text: "ไม่ผ่านการรับรอง",
          color: "bg-red-100 text-red-800",
        };
      }
    }

    return {
      text: status || "ไม่ทราบสถานะ",
      color: "bg-gray-100 text-gray-800",
    };
  }, []);

  return {
    applications,
    loading,
    error,
    farmsPagination,
    multiSortMeta,
    onPageChange,
    onSortChange,
    setRows: (rows: number) => setFarmsPagination((p) => ({ ...p, rows })),
    formatThaiDate,
    getStatusInfo,
  };
}
