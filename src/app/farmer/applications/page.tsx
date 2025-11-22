"use client";

import { useRouter } from "next/navigation";
import { DangerIcon } from "@/components/icons";
import FarmerLayout from "@/components/layout/FarmerLayout";
import { PrimaryButton, PrimaryDataTable } from "@/components/ui";

import {
  ApplicationItem,
  useFarmerApplications,
} from "@/hooks/useFarmerApplications";

export default function FarmerApplicationsPage() {
  const router = useRouter();

  const {
    applications,
    loading,
    error,
    farmsPagination,
    multiSortMeta,
    onPageChange,
    onSortChange,
    formatThaiDate,
    getStatusInfo,
  } = useFarmerApplications(10);

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
                  style: { width: "12%" },
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
                  style: { width: "15%" },
                },
                {
                  field: "province",
                  header: "จังหวัด",
                  body: (rowData: ApplicationItem) =>
                    rowData.rubberFarm.province,
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                  style: { width: "15%" },
                },
                {
                  field: "district",
                  header: "อำเภอ",
                  body: (rowData: ApplicationItem) =>
                    rowData.rubberFarm.district,
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                  style: { width: "15%" },
                },
                {
                  field: "subDistrict",
                  header: "ตำบล",
                  body: (rowData: ApplicationItem) =>
                    rowData.rubberFarm.subDistrict,
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                  style: { width: "15%" },
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
                  style: { width: "13%" },
                },
                {
                  field: "status",
                  header: "สถานะ",
                  body: (rowData: ApplicationItem) => {
                    const statusInfo = getStatusInfo(rowData);
                    return (
                      <div className="inline-flex justify-center w-full">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}
                        >
                          {statusInfo.text}
                        </span>
                      </div>
                    );
                  },
                  sortable: false,
                  headerAlign: "center" as const,
                  bodyAlign: "center" as const,
                  mobileAlign: "right" as const,
                  style: { width: "15%" },
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
              rowsPerPageOptions={[10, 25, 50]}
            />
          )}
        </div>
      </div>
    </FarmerLayout>
  );
}
