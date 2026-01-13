"use client";

import thaiProvinceData from "@/data/thai-provinces.json";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import { useCallback, useEffect, useState } from "react";

export interface RubberFarm {
  rubberFarmId: number;
  farmId?: string;
  villageName: string;
  moo: number;
  road: string;
  alley: string;
  location?: string;
  district: string;
  province: string;
  subDistrict: string;
  createdAt: string;
}

export interface AdviceItem {
  adviceItem: string;
  recommendation: string;
  time: string | null;
}

export interface DefectItem {
  defectItem: string;
  defectDetail: string;
  time: string | null;
}

export interface AdviceAndDefect {
  adviceAndDefectId: number;
  date: string;
  adviceList: AdviceItem[];
  defectList: DefectItem[];
}

export interface Inspection {
  inspectionId: number;
  inspectionNo: string;
  inspectionDateAndTime: string;
  inspectionStatus: string;
  inspectionResult: string;
  rubberFarmId: number;
  adviceAndDefect?: AdviceAndDefect;
}

export interface ApplicationItem {
  rubberFarm: RubberFarm;
  inspection?: Inspection;
}

type SortOrder = 1 | -1 | 0 | null;

const getApplicationStatusText = (application: ApplicationItem) => {
  if (!application.inspection) {
    return "รอกำหนดวันตรวจประเมิน";
  }

  const status = application.inspection.inspectionStatus;
  const result = application.inspection.inspectionResult;

  if (status === "รอการตรวจประเมิน") {
    return "รอการตรวจประเมิน";
  }

  if (status === "ตรวจประเมินแล้ว") {
    if (result === "รอผลการตรวจประเมิน") {
      return "ตรวจประเมินแล้ว รอสรุปผล";
    }
    if (result === "ผ่าน") {
      return "ผ่านการรับรอง";
    }
    if (result === "ไม่ผ่าน") {
      return "ไม่ผ่านการรับรอง";
    }
  }

  return status || "ไม่ทราบสถานะ";
};

const formatDateParam = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null
  );
  const [selectedSubDistrictId, setSelectedSubDistrictId] = useState<
    number | null
  >(null);

  const [appliedProvinceName, setAppliedProvinceName] = useState("");
  const [appliedDistrictName, setAppliedDistrictName] = useState("");
  const [appliedSubDistrictName, setAppliedSubDistrictName] = useState("");

  const [inspectionDate, setInspectionDate] = useState<Date | null>(null);
  const [appliedInspectionDate, setAppliedInspectionDate] = useState<
    Date | null
  >(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [appliedStatus, setAppliedStatus] = useState<string | null>(null);

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

        if (appliedProvinceName) params.append("province", appliedProvinceName);
        if (appliedDistrictName) params.append("district", appliedDistrictName);
        if (appliedSubDistrictName)
          params.append("subDistrict", appliedSubDistrictName);
        if (appliedInspectionDate)
          params.append("inspectionDate", formatDateParam(appliedInspectionDate));
        if (appliedStatus) params.append("inspectionStatus", appliedStatus);

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
        let serverOffset = offset;
        let serverLimit = limit;
        let serverTotal = 0;

        if (result.results && result.paginator) {
          farms = result.results;
          serverOffset = result.paginator.offset;
          serverLimit = result.paginator.limit;
          serverTotal = result.paginator.total;
        } else {
          farms = Array.isArray(result) ? result : [];
          serverOffset = offset;
          serverLimit = limit;
          serverTotal = farms.length || 0;
        }

        const allApplicationItems: ApplicationItem[] = farms.map(
          (farm: any) => ({
            rubberFarm: {
              rubberFarmId: farm.rubberFarmId,
              farmId: farm.farmId,
              villageName: farm.villageName,
              moo: farm.moo,
              road: farm.road,
              alley: farm.alley,
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
        setFarmsPagination({
          first: serverOffset,
          rows: serverLimit,
          totalRecords: serverTotal,
        });
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    },
    [
      initialRows,
      appliedProvinceName,
      appliedDistrictName,
      appliedSubDistrictName,
      appliedInspectionDate,
      appliedStatus,
    ]
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

  const applyFilters = useCallback(() => {
    setFarmsPagination((p) => ({ ...p, first: 0 }));

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

    setAppliedInspectionDate(inspectionDate);
    setAppliedStatus(selectedStatus);
  }, [
    inspectionDate,
    selectedDistrictId,
    selectedProvinceId,
    selectedStatus,
    selectedSubDistrictId,
  ]);

  const clearFilters = useCallback(() => {
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedSubDistrictId(null);
    setAppliedProvinceName("");
    setAppliedDistrictName("");
    setAppliedSubDistrictName("");
    setInspectionDate(null);
    setAppliedInspectionDate(null);
    setSelectedStatus(null);
    setAppliedStatus(null);
    setFarmsPagination((p) => ({ ...p, first: 0 }));
  }, []);

  const formatThaiDate = useCallback((dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const getStatusInfo = useCallback((application: ApplicationItem) => {
    const text = getApplicationStatusText(application);

    if (text === "รอกำหนดวันตรวจประเมิน") {
      return {
        text,
        color: "bg-yellow-100 text-yellow-800",
      };
    }

    if (text === "รอการตรวจประเมิน") {
      return { text, color: "bg-blue-100 text-blue-800" };
    }

    if (text === "ตรวจประเมินแล้ว รอสรุปผล") {
      return { text, color: "bg-purple-100 text-purple-800" };
    }

    if (text === "ผ่านการรับรอง") {
      return { text, color: "bg-green-100 text-green-800" };
    }

    if (text === "ไม่ผ่านการรับรอง") {
      return { text, color: "bg-red-100 text-red-800" };
    }

    return {
      text,
      color: "bg-gray-100 text-gray-800",
    };
  }, []);

  const hasActiveFilters =
    appliedProvinceName !== "" ||
    appliedDistrictName !== "" ||
    appliedSubDistrictName !== "" ||
    appliedInspectionDate !== null ||
    appliedStatus !== null;

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
    selectedProvinceId,
    selectedDistrictId,
    selectedSubDistrictId,
    setSelectedProvinceId,
    setSelectedDistrictId,
    setSelectedSubDistrictId,
    inspectionDate,
    setInspectionDate,
    selectedStatus,
    setSelectedStatus,
    applyFilters,
    clearFilters,
    hasActiveFilters,
  };
}
