"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import FarmerLayout from "@/components/layout/FarmerLayout";
import { PrimaryDataTable, PrimaryButton } from "@/components/ui";
import { DangerIcon } from "@/components/icons";

interface RubberFarm {
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

interface Inspection {
  inspectionId: number;
  inspectionNo: string;
  inspectionDateAndTime: string;
  inspectionStatus: string;
  inspectionResult: string;
  rubberFarmId: number;
}

interface ApplicationItem {
  rubberFarm: RubberFarm;
  inspection?: Inspection;
}

export default function FarmerApplicationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination state
  const [farmsPagination, setFarmsPagination] = useState({
    first: 0,
    rows: 10,
    totalRecords: 0,
  });

  // Sort state
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<1 | -1 | 0 | null>(null);
  const [multiSortMeta, setMultiSortMeta] = useState<
    Array<{
      field: string;
      order: 1 | -1 | 0 | null;
    }>
  >([]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.roleData?.farmerId) {
      fetchApplicationsWithPagination(session.user.roleData.farmerId, 0, 10, {
        sortField,
        sortOrder:
          sortOrder === 1 ? "asc" : sortOrder === -1 ? "desc" : undefined,
        multiSortMeta: multiSortMeta.filter(
          (item) => item.order === 1 || item.order === -1
        ) as Array<{ field: string; order: number }>,
      });
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, session, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch applications with pagination
  const fetchApplicationsWithPagination = async (
    farmerId: number,
    offset = 0,
    limit = 10,
    sorting?: {
      sortField?: string;
      sortOrder?: string;
      multiSortMeta?: Array<{
        field: string;
        order: number;
      }>;
    }
  ) => {
    try {
      setLoading(true);

      // สร้าง query parameters
      const params = new URLSearchParams({
        farmerId: farmerId.toString(),
        limit: limit.toString(),
        offset: offset.toString(),
        includeInspections: "true", // เพิ่ม flag เพื่อดึงข้อมูล inspection มาด้วย
      });

      // เพิ่ม sort parameters
      if (sorting?.sortField) params.append("sortField", sorting.sortField);
      if (sorting?.sortOrder) params.append("sortOrder", sorting.sortOrder);
      if (sorting?.multiSortMeta) {
        const validSortMeta = sorting.multiSortMeta.filter(
          (item) => item.order === 1 || item.order === -1
        );
        if (validSortMeta.length > 0) {
          params.append("multiSortMeta", JSON.stringify(validSortMeta));
        }
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
      let farms = [];

      // Handle paginated response
      if (result.results && result.paginator) {
        farms = result.results;
        setFarmsPagination({
          first: result.paginator.offset,
          rows: result.paginator.limit,
          totalRecords: result.paginator.total,
        });
      } else {
        // Fallback for non-paginated response
        farms = result;
        setFarmsPagination({
          first: 0,
          rows: 10,
          totalRecords: result.length || 0,
        });
      }

      // แปลงข้อมูลเป็น ApplicationItem format
      // ตอนนี้ inspection data มากับ farm แล้ว ไม่ต้องไปดึงแยกอีก
      const allApplicationItems: ApplicationItem[] = farms.map((farm: any) => ({
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
      }));

      setApplications(allApplicationItems);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // Handle page change for DataTable
  const onPageChange = (event: DataTablePageEvent) => {
    if (session?.user?.roleData?.farmerId) {
      fetchApplicationsWithPagination(
        session.user.roleData.farmerId,
        event.first,
        event.rows,
        {
          sortField,
          sortOrder:
            sortOrder === 1 ? "asc" : sortOrder === -1 ? "desc" : undefined,
          multiSortMeta: multiSortMeta.filter(
            (item) => item.order === 1 || item.order === -1
          ) as Array<{ field: string; order: number }>,
        }
      );
    }
  };

  // Handle sort change
  const onSortChange = (event: DataTableSortEvent) => {
    if (event.multiSortMeta) {
      const validMultiSort = event.multiSortMeta.filter(
        (item) => item.order !== undefined
      ) as Array<{ field: string; order: 1 | -1 | 0 | null }>;
      setMultiSortMeta(validMultiSort);
      const validSortMeta = validMultiSort.filter(
        (item) => item.order === 1 || item.order === -1
      ) as Array<{ field: string; order: number }>;
      if (session?.user?.roleData?.farmerId) {
        fetchApplicationsWithPagination(
          session.user.roleData.farmerId,
          farmsPagination.first,
          farmsPagination.rows,
          {
            multiSortMeta: validSortMeta,
          }
        );
      }
    } else {
      setSortField(event.sortField);
      const validOrder = event.sortOrder !== undefined ? event.sortOrder : null;
      setSortOrder(validOrder);
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
  };

  const formatThaiDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusInfo = (application: ApplicationItem) => {
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
  };

  return (
    <FarmerLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            ติดตามสถานะการรับรอง
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            ตรวจสอบสถานะคำขอและผลการรับรองแหล่งผลิต
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {error && <div className="p-8 text-center text-red-600">{error}</div>}

          {!error && applications.length === 0 && !loading && (
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 flex items-start">
                <DangerIcon className="h-6 w-6 text-yellow-500 mr-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-base font-medium text-yellow-800">
                    ยังไม่มีข้อมูลสวนยาง
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    คุณยังไม่ได้ลงทะเบียนสวนยางพารา
                    กรุณาลงทะเบียนสวนยางเพื่อยื่นขอรับรอง
                  </p>
                  <PrimaryButton
                    label="ลงทะเบียนสวนยาง"
                    color="warning"
                    className="mt-3"
                    onClick={() => router.push("/farmer/applications/new")}
                  />
                </div>
              </div>
            </div>
          )}

          {!error && (applications.length > 0 || loading) && (
            <PrimaryDataTable
              value={applications}
              columns={[
                {
                  field: "rubberFarmId",
                  header: "รหัสสวน",
                  body: (rowData: ApplicationItem) => {
                    return (
                      rowData.rubberFarm.farmId ||
                      `RF${rowData.rubberFarm.rubberFarmId
                        .toString()
                        .padStart(5, "0")}`
                    );
                  },
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "center" as const,
                  style: { width: "10%" },
                },
                {
                  field: "location",
                  header: "สถานที่",
                  body: (rowData: ApplicationItem) => {
                    const farm = rowData.rubberFarm;
                    return (
                      farm.location || `${farm.villageName} หมู่ ${farm.moo}`
                    );
                  },
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                  style: { width: "20%" },
                },
                {
                  field: "province",
                  header: "จังหวัด",
                  body: (rowData: ApplicationItem) =>
                    rowData.rubberFarm.province,
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                  style: { width: "10%" },
                },
                {
                  field: "district",
                  header: "อำเภอ",
                  body: (rowData: ApplicationItem) =>
                    rowData.rubberFarm.district,
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                  style: { width: "10%" },
                },
                {
                  field: "subDistrict",
                  header: "ตำบล",
                  body: (rowData: ApplicationItem) =>
                    rowData.rubberFarm.subDistrict,
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                  style: { width: "10%" },
                },
                {
                  field: "inspectionDateAndTime",
                  header: "กำหนดตรวจประเมิน",
                  body: (rowData: ApplicationItem) =>
                    rowData.inspection?.inspectionDateAndTime
                      ? formatThaiDate(rowData.inspection.inspectionDateAndTime)
                      : "-",
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "center" as const,
                  style: { width: "20%" },
                },
                {
                  field: "status",
                  header: "สถานะ",
                  body: (rowData: ApplicationItem) => {
                    const statusInfo = getStatusInfo(rowData);
                    return (
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}
                      >
                        {statusInfo.text}
                      </span>
                    );
                  },
                  sortable: false,
                  headerAlign: "center" as const,
                  bodyAlign: "center" as const,
                  style: { width: "20%" },
                },
              ]}
              loading={loading}
              paginator
              rows={farmsPagination.rows}
              totalRecords={farmsPagination.totalRecords}
              first={farmsPagination.first}
              lazy
              onPage={onPageChange}
              sortMode="multiple"
              multiSortMeta={multiSortMeta}
              onSort={onSortChange}
              emptyMessage="ไม่พบข้อมูลสวนยางพารา"
            />
          )}
        </div>
      </div>
    </FarmerLayout>
  );
}
