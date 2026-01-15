"use client";

import { DangerIcon } from "@/components/icons";
import FarmerLayout from "@/components/layout/FarmerLayout";
import {
  PrimaryButton,
  PrimaryCalendar,
  PrimaryDataTable,
  PrimaryDropdown,
} from "@/components/ui";
import thaiProvinceData from "@/data/thai-provinces.json";
import { useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { useEffect, useState } from "react";

import {
  ApplicationItem,
  useFarmerApplications,
} from "@/hooks/useFarmerApplications";

interface Tambon {
  id: number;
  name_th: string;
  name_en: string;
  zip_code: number;
  amphure_id: number;
}

interface Amphure {
  id: number;
  name_th: string;
  name_en: string;
  province_id: number;
  tambon: Tambon[];
}

interface Province {
  id: number;
  name_th: string;
  name_en: string;
  amphure: Amphure[];
}

const STATUS_OPTIONS = [
  { label: "รอกำหนดวันตรวจประเมิน", value: "รอกำหนดวันตรวจประเมิน" },
  { label: "รอการตรวจประเมิน", value: "รอการตรวจประเมิน" },
  { label: "ตรวจประเมินแล้ว รอสรุปผล", value: "ตรวจประเมินแล้ว รอสรุปผล" },
  { label: "ผ่านการรับรอง", value: "ผ่านการรับรอง" },
  { label: "ไม่ผ่านการรับรอง", value: "ไม่ผ่านการรับรอง" },
];

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
  } = useFarmerApplications(10);

  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationItem | null>(null);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);

  useEffect(() => {
    setProvinces(thaiProvinceData as Province[]);
  }, []);

  useEffect(() => {
    if (selectedProvinceId) {
      const selectedProvince = provinces.find(
        (province) => province.id === selectedProvinceId
      );
      if (selectedProvince) {
        setAmphures(selectedProvince.amphure);
        setTambons([]);
        setSelectedDistrictId(null);
        setSelectedSubDistrictId(null);
      }
    } else {
      setAmphures([]);
      setTambons([]);
      setSelectedDistrictId(null);
      setSelectedSubDistrictId(null);
    }
  }, [
    selectedProvinceId,
    provinces,
    setSelectedDistrictId,
    setSelectedSubDistrictId,
  ]);

  useEffect(() => {
    if (selectedDistrictId) {
      const selectedAmphure = amphures.find(
        (amphure) => amphure.id === selectedDistrictId
      );
      if (selectedAmphure) {
        setTambons(selectedAmphure.tambon);
        setSelectedSubDistrictId(null);
      }
    } else {
      setTambons([]);
      setSelectedSubDistrictId(null);
    }
  }, [selectedDistrictId, amphures, setSelectedSubDistrictId]);

  const handleViewAdvice = (application: ApplicationItem) => {
    setSelectedApplication(application);
    setShowAdviceModal(true);
  };

  const showEmptyState =
    !error && !loading && applications.length === 0 && !hasActiveFilters;
  const showTable =
    !error && (applications.length > 0 || loading || hasActiveFilters);

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

          {showEmptyState && (
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

          {showTable && (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="filterProvince"
                      className="block text-sm text-gray-600 mb-1"
                    >
                      จังหวัด
                    </label>
                    <PrimaryDropdown
                      id="filterProvince"
                      value={selectedProvinceId}
                      options={provinces.map((province) => ({
                        label: province.name_th,
                        value: province.id,
                      }))}
                      onChange={(value) =>
                        setSelectedProvinceId(value ? Number(value) : null)
                      }
                      placeholder="เลือกจังหวัด"
                      filter
                      showClear
                      emptyMessage="ไม่มีข้อมูลจังหวัด"
                      emptyFilterMessage="ไม่พบจังหวัดที่ค้นหา"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="filterDistrict"
                      className="block text-sm text-gray-600 mb-1"
                    >
                      อำเภอ/เขต
                    </label>
                    <PrimaryDropdown
                      id="filterDistrict"
                      value={selectedDistrictId}
                      options={amphures.map((amphure) => ({
                        label: amphure.name_th,
                        value: amphure.id,
                      }))}
                      onChange={(value) =>
                        setSelectedDistrictId(value ? Number(value) : null)
                      }
                      placeholder="เลือกอำเภอ/เขต"
                      disabled={!selectedProvinceId}
                      filter
                      showClear
                      emptyMessage="ไม่มีข้อมูลอำเภอ/เขต"
                      emptyFilterMessage="ไม่พบอำเภอ/เขตที่ค้นหา"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="filterSubDistrict"
                      className="block text-sm text-gray-600 mb-1"
                    >
                      ตำบล/แขวง
                    </label>
                    <PrimaryDropdown
                      id="filterSubDistrict"
                      value={selectedSubDistrictId}
                      options={tambons.map((tambon) => ({
                        label: tambon.name_th,
                        value: tambon.id,
                      }))}
                      onChange={(value) =>
                        setSelectedSubDistrictId(value ? Number(value) : null)
                      }
                      placeholder="เลือกตำบล/แขวง"
                      disabled={!selectedDistrictId}
                      filter
                      showClear
                      emptyMessage="ไม่มีข้อมูลตำบล/แขวง"
                      emptyFilterMessage="ไม่พบตำบล/แขวงที่ค้นหา"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="filterInspectionDate"
                      className="block text-sm text-gray-600 mb-1"
                    >
                      กำหนดการตรวจประเมิน
                    </label>
                    <PrimaryCalendar
                      id="filterInspectionDate"
                      value={inspectionDate}
                      onChange={setInspectionDate}
                      placeholder="เลือกวันที่ตรวจประเมิน"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="filterStatus"
                      className="block text-sm text-gray-600 mb-1"
                    >
                      สถานะ
                    </label>
                    <PrimaryDropdown
                      id="filterStatus"
                      value={selectedStatus}
                      options={STATUS_OPTIONS}
                      onChange={(value) =>
                        setSelectedStatus(value ? String(value) : null)
                      }
                      placeholder="เลือกสถานะ"
                      showClear
                    />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="justify-self-end">
                    <PrimaryButton
                      label="ค้นหา"
                      icon="pi pi-search"
                      onClick={() => applyFilters()}
                    />
                  </div>
                  <div>
                    <PrimaryButton
                      label="ล้างค่า"
                      color="secondary"
                      icon="pi pi-refresh"
                      onClick={() => clearFilters()}
                    />
                  </div>
                </div>
              </div>

              <div>
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
                        if (!farm) return "";

                        const v = (val: any) =>
                          (val || val === 0) && val !== "-" && val !== ""
                            ? val
                            : null;

                        const parts = [
                          v(farm.villageName),
                          v(farm.moo) ? `หมู่ ${farm.moo}` : null,
                          v(farm.road),
                          v(farm.alley),
                          // v(farm.subDistrict) ? `ต.${farm.subDistrict}` : null,
                          // v(farm.district) ? `อ.${farm.district}` : null,
                          // v(farm.province) ? `จ.${farm.province}` : null,
                        ];

                        return parts.filter(Boolean).join(" ");
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
                          ? formatThaiDate(
                              rowData.inspection.inspectionDateAndTime
                            )
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
              </div>
            </>
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
          draggable={false}
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
