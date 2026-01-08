"use client";

import { DangerIcon } from "@/components/icons";
import FarmerLayout from "@/components/layout/FarmerLayout";
import { PrimaryButton, PrimaryDataTable } from "@/components/ui";
import { useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { useState } from "react";

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

  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationItem | null>(null);

  const handleViewAdvice = (application: ApplicationItem) => {
    setSelectedApplication(application);
    setShowAdviceModal(true);
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
                  style: { width: "13%" },
                },
                {
                  field: "province",
                  header: "จังหวัด",
                  body: (rowData: ApplicationItem) =>
                    rowData.rubberFarm.province,
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                  style: { width: "14%" },
                },
                {
                  field: "district",
                  header: "อำเภอ",
                  body: (rowData: ApplicationItem) =>
                    rowData.rubberFarm.district,
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                  style: { width: "14%" },
                },
                {
                  field: "subDistrict",
                  header: "ตำบล",
                  body: (rowData: ApplicationItem) =>
                    rowData.rubberFarm.subDistrict,
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                  style: { width: "14%" },
                },
                {
                  field: "inspectionDateAndTime",
                  header: "กำหนดการตรวจประเมิน",
                  body: (rowData: ApplicationItem) =>
                    rowData.inspection?.inspectionDateAndTime
                      ? formatThaiDate(rowData.inspection.inspectionDateAndTime)
                      : "-",
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "center" as const,
                  style: { width: "15%" },
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
                {
                  field: "actions",
                  header: "",
                  body: (rowData: ApplicationItem) => {
                    const hasAdviceAndDefect =
                      rowData.inspection?.adviceAndDefect != null;
                    return (
                      <div className="flex justify-center">
                        <PrimaryButton
                          icon="pi pi-eye"
                          color="info"
                          onClick={() => handleViewAdvice(rowData)}
                          disabled={!hasAdviceAndDefect}
                          rounded
                          text
                        />
                      </div>
                    );
                  },
                  style: { width: "5%" },
                  headerAlign: "center" as const,
                  bodyAlign: "center" as const,
                  mobileAlign: "right" as const,
                  mobileHideLabel: true, // ซ่อน label ใน mobile
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

        <Dialog
          visible={
            showAdviceModal &&
            selectedApplication?.inspection?.adviceAndDefect != null
          }
          onHide={() => setShowAdviceModal(false)}
          header={
            <div className="text-xl font-bold">
              ข้อมูลการให้คำปรึกษาและข้อบกพร่อง
            </div>
          }
          footer={
            <div className="flex justify-end">
              <PrimaryButton
                label="ปิด"
                icon="pi pi-times"
                color="secondary"
                onClick={() => setShowAdviceModal(false)}
              />
            </div>
          }
          modal
          style={{ width: "90vw", maxWidth: "56rem" }}
          contentStyle={{ maxHeight: "70vh", overflowY: "auto" }}
          blockScroll={true}
        >
          {selectedApplication?.inspection?.adviceAndDefect && (
            <div>
              {/* ข้อมูลการตรวจ */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  ข้อมูลการตรวจประเมิน
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-sm text-gray-600">รหัสการตรวจ:</span>
                    <p className="font-medium">
                      {selectedApplication.inspection?.inspectionNo || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">วันที่บันทึก:</span>
                    <p className="font-medium">
                      {formatThaiDate(
                        selectedApplication.inspection.adviceAndDefect.date
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* รายการให้คำปรึกษา */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  รายการให้คำปรึกษา
                </h3>
                {selectedApplication.inspection.adviceAndDefect.adviceList
                  ?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedApplication.inspection.adviceAndDefect.adviceList.map(
                      (advice: any, index: number) => (
                        <div
                          key={`advice-${advice.adviceItem}-${advice.time}-${index}`}
                          className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                        >
                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              รายการให้คำปรึกษา:
                            </span>
                            <p className="mt-1 text-gray-900">
                              {advice.adviceItem}
                            </p>
                          </div>
                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              แนวทางการแก้ไข:
                            </span>
                            <p className="mt-1 text-gray-900">
                              {advice.recommendation}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              กำหนดระยะเวลา:
                            </span>
                            <p className="mt-1 text-gray-900">
                              {advice.time ? formatThaiDate(advice.time) : "-"}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500  py-4 text-center bg-gray-50 rounded-lg">
                    ไม่มีรายการให้คำปรึกษา
                  </p>
                )}
              </div>

              {/* ข้อบกพร่อง */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  ข้อบกพร่อง
                </h3>
                {selectedApplication.inspection.adviceAndDefect.defectList
                  ?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedApplication.inspection.adviceAndDefect.defectList.map(
                      (defect: any, index: number) => (
                        <div
                          key={`defect-${defect.defectItem}-${defect.time}-${index}`}
                          className="border border-gray-200 rounded-lg p-4 bg-white-50 hover:shadow-md transition-shadow"
                        >
                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              ข้อบกพร่องที่พบ:
                            </span>
                            <p className="mt-1 text-gray-900">
                              {defect.defectItem}
                            </p>
                          </div>
                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              รายละเอียดข้อบกพร่อง:
                            </span>
                            <p className="mt-1 text-gray-900">
                              {defect.defectDetail}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              กำหนดระยะเวลาแก้ไข:
                            </span>
                            <p className="mt-1 text-gray-900">
                              {defect.time ? formatThaiDate(defect.time) : "-"}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500  py-4 text-center bg-gray-50 rounded-lg">
                    ไม่มีข้อบกพร่อง
                  </p>
                )}
              </div>
            </div>
          )}
        </Dialog>
      </div>
    </FarmerLayout>
  );
}
