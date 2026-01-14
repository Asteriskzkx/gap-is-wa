"use client";

import { StepIndicator } from "@/components/farmer/StepIndicator";
import { InfoIcon } from "@/components/icons";
import AuditorLayout from "@/components/layout/AuditorLayout";
import DynamicMapViewer from "@/components/maps/DynamicMapViewer";
import {
  PrimaryAutoComplete,
  PrimaryButton,
  PrimaryCalendar,
  PrimaryCheckbox,
  PrimaryDataTable,
  PrimaryInputText,
} from "@/components/ui";
import thaiProvinceData from "@/data/thai-provinces.json";
import { useAuditorApplications } from "@/hooks/useAuditorApplications";
import { formatThaiDate } from "@/utils/dateFormatter";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// Interface สำหรับข้อมูลจังหวัด อำเภอ ตำบล
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
  tambon: Tambon[]; // ชื่อ property ใน JSON คือ tambon (เอกพจน์)
}

interface Province {
  id: number;
  name_th: string;
  name_en: string;
  amphure: Amphure[]; // ชื่อ property ใน JSON คือ amphure (เอกพจน์)
}

interface RubberFarm {
  id: number;
  location: string;
  province: string;
  district: string;
  subDistrict: string;
  productDistributionType: string;
  farmerName: string;
  farmerEmail: string;
}

interface RubberFarmDetails {
  rubberFarmId: number;
  farmerId: number;
  villageName: string;
  moo: number;
  road: string;
  alley: string;
  subDistrict: string;
  district: string;
  province: string;
  location: any;
  productDistributionType: string;
  plantingDetails: PlantingDetail[];
  farmer?: FarmerDetails;
}

interface PlantingDetail {
  plantingDetailId: number;
  specie: string;
  areaOfPlot: number;
  numberOfRubber: number;
  numberOfTapping: number;
  ageOfRubber: number;
  yearOfTapping: string;
  monthOfTapping: string;
  totalProduction: number;
}

interface FarmerDetails {
  farmerId: number;
  namePrefix: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  mobilePhoneNumber?: string;
}

interface InspectionType {
  inspectionTypeId: number;
  typeName: string;
  description: string | null;
}

interface Auditor {
  id: number;
  name: string;
  email: string;
}

export default function AuditorScheduleInspectionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Use custom hook
  const {
    rubberFarms,
    loading,
    totalRecords,
    lazyParams,
    handlePageChange,
    handleSort,
    inspectionTypes,
    auditors,
    auditorsTotalRecords,
    auditorsLazyParams,
    auditorSearchTerm,
    setAuditorSearchTerm,
    handleAuditorPageChange,
    handleAuditorSort,
    applyAuditorSearch,
    selectedProvinceId,
    selectedDistrictId,
    selectedSubDistrictId,
    setSelectedProvinceId,
    setSelectedDistrictId,
    setSelectedSubDistrictId,
    applyFilters,
    clearFilters,
    fetchFarmDetails,
    scheduleInspection,
  } = useAuditorApplications(10);

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State for form data
  const [showFarmDetails, setShowFarmDetails] = useState(false);
  const [selectedFarmDetails, setSelectedFarmDetails] =
    useState<RubberFarmDetails | null>(null);
  const [loadingFarmDetails, setLoadingFarmDetails] = useState(false);

  const [selectedFarm, setSelectedFarm] = useState<RubberFarm | null>(null);
  const [selectedInspectionType, setSelectedInspectionType] =
    useState<InspectionType | null>(null);
  const [selectedAuditors, setSelectedAuditors] = useState<Auditor[]>([]);
  const [inspectionDate, setInspectionDate] = useState<Date | null>(null);

  // State สำหรับข้อมูลจังหวัด อำเภอ ตำบล
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);

  // Auditor info
  const [auditor, setAuditor] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    isLoading: true,
  });

  const handleFetchFarmDetails = async (farmId: number) => {
    setLoadingFarmDetails(true);
    try {
      const data = await fetchFarmDetails(farmId);
      setSelectedFarmDetails(data);
      setShowFarmDetails(true);
    } catch (error) {
      console.error("Error fetching farm details:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoadingFarmDetails(false);
    }
  };

  // โหลดข้อมูลจังหวัด
  useEffect(() => {
    setProvinces(thaiProvinceData as Province[]);
  }, []);

  // ปรับไม่ให้ background scroll เมื่อเปิด modal รายละเอียดสวน
  useEffect(() => {
    if (showFarmDetails) {
      // ซ่อนการเลื่อนของ body
      document.body.style.overflow = "hidden";
    } else {
      // คืนค่าเดิม
      document.body.style.overflow = "";
    }

    // cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [showFarmDetails]);

  // อัพเดทอำเภอเมื่อเลือกจังหวัด
  useEffect(() => {
    if (selectedProvinceId) {
      const selectedProvince = provinces.find(
        (p) => p.id === selectedProvinceId
      );
      if (selectedProvince) {
        setAmphures(selectedProvince.amphure);
        setSelectedDistrictId(null);
        setSelectedSubDistrictId(null);
      }
    } else {
      setAmphures([]);
      setTambons([]);
    }
  }, [
    selectedProvinceId,
    provinces,
    setSelectedDistrictId,
    setSelectedSubDistrictId,
  ]);

  // อัพเดทตำบลเมื่อเลือกอำเภอ
  useEffect(() => {
    if (selectedDistrictId) {
      const selectedAmphure = amphures.find((a) => a.id === selectedDistrictId);
      if (selectedAmphure) {
        setTambons(selectedAmphure.tambon);
        setSelectedSubDistrictId(null);
      }
    } else {
      setTambons([]);
    }
  }, [selectedDistrictId, amphures, setSelectedSubDistrictId]);

  useEffect(() => {
    // ตรวจสอบ session
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const auditorData = session.user.roleData;
      setAuditor({
        namePrefix: auditorData?.namePrefix || "",
        firstName: auditorData?.firstName || "",
        lastName: auditorData?.lastName || "",
        isLoading: false,
      });
    }
  }, [status, session, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search - use hook's applyFilters
  const handleSearch = () => {
    applyFilters();
  };

  // Handle reset search - use hook's clearFilters
  const handleResetSearch = () => {
    clearFilters();
  };

  // Handle auditor search
  const handleAuditorSearchClick = () => {
    applyAuditorSearch();
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedFarm) {
      setError("กรุณาเลือกสวนยางพารา");
      return;
    }
    if (currentStep === 2 && !selectedInspectionType) {
      setError("กรุณาเลือกประเภทการตรวจประเมิน");
      return;
    }
    if (currentStep === 4 && !inspectionDate) {
      setError("กรุณาเลือกวันที่ตรวจประเมิน");
      return;
    }

    setError("");
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    try {
      await scheduleInspection({
        rubberFarmId: selectedFarm!.id,
        inspectionTypeId: selectedInspectionType!.inspectionTypeId,
        inspectionDateAndTime: inspectionDate!.toISOString(),
        additionalAuditorIds: selectedAuditors.map((a) => a.id),
      });

      setSuccess("กำหนดการตรวจประเมินถูกบันทึกเรียบร้อยแล้ว");
      setTimeout(() => router.push("/auditor/dashboard"), 2000);
    } catch (error: any) {
      const errorMessage = error?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      setError(errorMessage);
    }
  };

  const handleAuditorToggle = (auditor: Auditor) => {
    setSelectedAuditors((prev) => {
      const exists = prev.find((a) => a.id === auditor.id);
      return exists
        ? prev.filter((a) => a.id !== auditor.id)
        : [...prev, auditor];
    });
  };

  // ตรวจสอบว่า inspection type สามารถเลือกได้หรือไม่ ตาม productDistributionType
  const isInspectionTypeAvailable = (
    inspectionType: InspectionType
  ): boolean => {
    if (!selectedFarm) return false;

    const productType = selectedFarm.productDistributionType;

    // Mapping ระหว่าง productDistributionType กับ inspectionTypeId
    const typeMapping: Record<string, number> = {
      ก่อนเปิดกรีด: 1,
      น้ำยางสด: 2,
      ยางก้อนถ้วย: 3,
    };

    return typeMapping[productType] === inspectionType.inspectionTypeId;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ขั้นตอนที่ 1: เลือกสวนยางพารา
            </h2>

            {/* Search Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                ค้นหาสวนยางพารา
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="searchProvinceId"
                    className="block text-sm font-medium text-gray-600 mb-1"
                  >
                    จังหวัด
                  </label>
                  <PrimaryAutoComplete
                    id="searchProvinceId"
                    value={selectedProvinceId || ""}
                    options={provinces.map((province) => ({
                      label: province.name_th,
                      value: province.id,
                    }))}
                    onChange={(value) => {
                      setSelectedProvinceId(value as number);
                    }}
                    placeholder="เลือกจังหวัด"
                  />
                </div>
                <div>
                  <label
                    htmlFor="searchAmphureId"
                    className="block text-sm font-medium text-gray-600 mb-1"
                  >
                    อำเภอ/เขต
                  </label>
                  <PrimaryAutoComplete
                    id="searchAmphureId"
                    value={selectedDistrictId || ""}
                    options={amphures.map((amphure) => ({
                      label: amphure.name_th,
                      value: amphure.id,
                    }))}
                    onChange={(value) => {
                      setSelectedDistrictId(value as number);
                    }}
                    placeholder="เลือกอำเภอ/เขต"
                    disabled={!selectedProvinceId}
                  />
                </div>
                <div>
                  <label
                    htmlFor="searchTambonId"
                    className="block text-sm font-medium text-gray-600 mb-1"
                  >
                    ตำบล/แขวง
                  </label>
                  <PrimaryAutoComplete
                    id="searchTambonId"
                    value={selectedSubDistrictId || ""}
                    options={tambons.map((tambon) => ({
                      label: tambon.name_th,
                      value: tambon.id,
                    }))}
                    onChange={(value) => {
                      setSelectedSubDistrictId(value as number);
                    }}
                    placeholder="เลือกตำบล/แขวง"
                    disabled={!selectedDistrictId}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-center">
                <PrimaryButton
                  label="ค้นหา"
                  icon="pi pi-search"
                  color="success"
                  onClick={handleSearch}
                ></PrimaryButton>
                <PrimaryButton
                  label="ล้างค่า"
                  icon="pi pi-refresh"
                  color="secondary"
                  onClick={handleResetSearch}
                ></PrimaryButton>
              </div>
            </div>

            <PrimaryDataTable
              value={rubberFarms}
              columns={[
                {
                  field: "id",
                  header: "รหัสสวน",
                  body: (rowData: RubberFarm) =>
                    `RF${rowData.id.toString().padStart(5, "0")}`,
                  style: { width: "15%" },
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "center" as const,
                },
                {
                  field: "province",
                  header: "จังหวัด",
                  body: (rowData: RubberFarm) => rowData.province,
                  style: { width: "15%" },
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                },
                {
                  field: "district",
                  header: "อำเภอ/เขต",
                  body: (rowData: RubberFarm) => rowData.district,
                  style: { width: "15%" },
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                },
                {
                  field: "subDistrict",
                  header: "ตำบล/แขวง",
                  body: (rowData: RubberFarm) => rowData.subDistrict,
                  style: { width: "15%" },
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                },
                {
                  field: "farmerName",
                  header: "เกษตรกร",
                  body: (rowData: RubberFarm) => rowData.farmerName,
                  style: { width: "15%" },
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                },
                {
                  field: "farmerEmail",
                  header: "อีเมล",
                  body: (rowData: RubberFarm) => rowData.farmerEmail,
                  style: { width: "20%" },
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                },
                {
                  field: "actions",
                  header: "",
                  body: (rowData: RubberFarm) => (
                    <div className="flex justify-center">
                      <PrimaryButton
                        icon="pi pi-eye"
                        color="info"
                        onClick={() => handleFetchFarmDetails(rowData.id)}
                        disabled={loadingFarmDetails}
                        rounded
                        text
                        // tooltip="ดูข้อมูลสวนยางพารา"
                        // tooltipOptions={{ position: "left" }}
                      ></PrimaryButton>
                    </div>
                  ),
                  style: { width: "5%" },
                  headerAlign: "center" as const,
                  bodyAlign: "center" as const,
                  mobileAlign: "right" as const,
                  mobileHideLabel: true, // ซ่อน label ใน mobile
                },
              ]}
              loading={loading}
              paginator
              rows={lazyParams.rows}
              rowsPerPageOptions={[10, 25, 50]}
              totalRecords={totalRecords}
              lazy
              first={lazyParams.first}
              onPage={handlePageChange}
              sortMode="multiple"
              multiSortMeta={lazyParams.multiSortMeta}
              onSort={handleSort}
              emptyMessage="ไม่พบข้อมูลสวนยางพารา"
              rowClassName={(data: RubberFarm) =>
                selectedFarm?.id === data.id
                  ? "bg-green-50 cursor-pointer"
                  : "cursor-pointer"
              }
              onRowClick={(event: any) => {
                // ถ้าคลิกที่ปุ่ม "ดูข้อมูล" ไม่ให้เลือกแถว
                if (event.originalEvent.target.tagName === "BUTTON") {
                  return;
                }
                setSelectedFarm(event.data);
              }}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ขั้นตอนที่ 2: เลือกประเภทการตรวจประเมิน
            </h2>
            {selectedFarm && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">รูปแบบการจำหน่ายผลผลิต:</span>{" "}
                  {selectedFarm.productDistributionType}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  ระบบจะแสดงเฉพาะประเภทการตรวจประเมินที่เหมาะสมกับรูปแบบการจำหน่ายผลผลิต
                </p>
              </div>
            )}
            <div className="grid gap-4">
              {inspectionTypes.map((type) => {
                const isAvailable = isInspectionTypeAvailable(type);
                return (
                  <div
                    key={type.inspectionTypeId}
                    className={`p-6 border-2 rounded-lg transition-all ${
                      !isAvailable
                        ? "opacity-50 cursor-not-allowed bg-gray-50"
                        : selectedInspectionType?.inspectionTypeId ===
                          type.inspectionTypeId
                        ? "border-green-500 bg-green-50 cursor-pointer"
                        : "border-gray-200 hover:border-gray-300 cursor-pointer"
                    }`}
                    onClick={() =>
                      isAvailable && setSelectedInspectionType(type)
                    }
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="inspectionType"
                        checked={
                          selectedInspectionType?.inspectionTypeId ===
                          type.inspectionTypeId
                        }
                        onChange={() =>
                          isAvailable && setSelectedInspectionType(type)
                        }
                        disabled={!isAvailable}
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 disabled:opacity-50"
                      />
                      <div className="ml-3">
                        <h3
                          className={`text-lg font-medium ${
                            isAvailable ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {type.typeName}
                          {!isAvailable && (
                            <span className="ml-2 text-xs text-red-500">
                              (ไม่สามารถเลือกได้)
                            </span>
                          )}
                        </h3>
                        {type.description && (
                          <p
                            className={`mt-1 text-sm ${
                              isAvailable ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {type.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ขั้นตอนที่ 3: เลือกคณะผู้ตรวจประเมินเพิ่มเติม (ไม่บังคับ)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              ท่านสามารถเลือกผู้ตรวจประเมินเพิ่มเติมเพื่อร่วมในการตรวจประเมินได้
            </p>
            <div className="mb-4 flex gap-2">
              <PrimaryInputText
                placeholder="ค้นหาผู้ตรวจประเมิน..."
                value={auditorSearchTerm}
                onChange={setAuditorSearchTerm}
                className="flex-1"
              />
              <PrimaryButton
                label="ค้นหา"
                icon="pi pi-search"
                onClick={handleAuditorSearchClick}
                color="success"
              />
            </div>

            <PrimaryDataTable
              key={`auditors-table-${selectedAuditors.length}-${selectedAuditors
                .map((a) => a.id)
                .join("-")}`}
              value={auditors}
              columns={[
                {
                  field: "selected",
                  header: "เลือก",
                  body: (rowData: Auditor) => (
                    <div className="inline-flex justify-center w-full">
                      <PrimaryCheckbox
                        id={`auditor-${rowData.id}`}
                        checked={selectedAuditors.some(
                          (a) => a.id === rowData.id
                        )}
                        onChange={() => handleAuditorToggle(rowData)}
                      />
                    </div>
                  ),
                  style: { width: "10%" },
                  headerAlign: "center" as const,
                  bodyAlign: "center" as const,
                  mobileAlign: "right" as const,
                  mobileHideLabel: false,
                },
                {
                  field: "id",
                  header: "รหัสผู้ตรวจ",
                  body: (rowData: Auditor) =>
                    rowData.id.toString().padStart(5, "0"),
                  style: { width: "15%" },
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "center" as const,
                },
                {
                  field: "name",
                  header: "ชื่อ-นามสกุล",
                  body: (rowData: Auditor) => rowData.name,
                  style: { width: "37%" },
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                },
                {
                  field: "email",
                  header: "อีเมล",
                  body: (rowData: Auditor) => rowData.email,
                  style: { width: "38%" },
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                },
              ]}
              loading={loading}
              paginator
              rows={auditorsLazyParams.rows}
              rowsPerPageOptions={[10, 25, 50]}
              totalRecords={auditorsTotalRecords}
              lazy
              first={auditorsLazyParams.first}
              onPage={handleAuditorPageChange}
              sortMode="multiple"
              multiSortMeta={auditorsLazyParams.multiSortMeta}
              onSort={handleAuditorSort}
              emptyMessage="ไม่พบผู้ตรวจประเมินในระบบ"
              rowClassName={(data: Auditor) =>
                selectedAuditors.some((a) => a.id === data.id)
                  ? "bg-green-50"
                  : ""
              }
            />

            {selectedAuditors.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  เลือกผู้ตรวจประเมินแล้ว {selectedAuditors.length} คน
                </p>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ขั้นตอนที่ 4: เลือกวันและเวลาตรวจประเมิน
            </h2>
            <div className="max-w-md mx-auto">
              <label
                htmlFor="inspectionDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                วันที่และเวลาตรวจประเมิน
              </label>
              <PrimaryCalendar
                id="inspectionDate"
                value={inspectionDate}
                onChange={setInspectionDate}
                placeholder="เลือกวันที่และเวลา"
                showTime
                hourFormat="24"
                dateFormat="dd/mm/yy"
                minDate={new Date()}
                required
                showIcon
              />
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <InfoIcon className="inline-block w-4 h-4 mr-1" />
                  กรุณาเลือกวันที่และเวลาที่เหมาะสมสำหรับการตรวจประเมิน
                </p>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ขั้นตอนที่ 5: ยืนยันข้อมูลการตรวจประเมิน
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  สวนยางพาราที่เลือก
                </h3>
                <div className="mt-2 p-4 bg-white rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    รหัสสวน: RF{selectedFarm?.id.toString().padStart(5, "0")}
                  </p>
                  <p className="text-sm text-gray-600">
                    พื้นที่: {selectedFarm?.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    เกษตรกร: {selectedFarm?.farmerName}
                  </p>
                  <p className="text-sm text-gray-600">
                    อีเมล: {selectedFarm?.farmerEmail}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  ประเภทการตรวจประเมิน
                </h3>
                <div className="mt-2 p-4 bg-white rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedInspectionType?.typeName}
                  </p>
                  {selectedInspectionType?.description && (
                    <p className="text-sm text-gray-600">
                      {selectedInspectionType.description}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  คณะผู้ตรวจประเมิน
                </h3>
                <div className="mt-2 p-4 bg-white rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    หัวหน้าผู้ตรวจ: {auditor.namePrefix}
                    {auditor.firstName} {auditor.lastName}
                  </p>
                  {selectedAuditors.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        ผู้ตรวจร่วม:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedAuditors.map((a) => (
                          <li key={a.id}>
                            • {a.name} ({a.email})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">ไม่มีผู้ตรวจร่วม</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  วันที่และเวลาตรวจประเมิน
                </h3>
                <div className="mt-2 p-4 bg-white rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {inspectionDate
                      ? inspectionDate.toLocaleString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <AuditorLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            แจ้งกำหนดการวันที่ตรวจประเมิน
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            กำหนดวันและเวลาสำหรับการตรวจประเมินสวนยางพาราตามมาตรฐานจีเอพี
          </p>
        </div>
        <StepIndicator
          currentStep={currentStep}
          maxSteps={5}
          stepLabels={[
            "เลือกสวนยาง",
            "ประเภทการตรวจ",
            "คณะผู้ตรวจ",
            "วันที่ตรวจ",
            "ยืนยัน",
          ]}
        />
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 w-full">
          {renderStepContent()}
          <div className="mt-8 flex justify-between">
            <PrimaryButton
              label="ย้อนกลับ"
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              security="outlined"
              color="secondary"
            ></PrimaryButton>
            {currentStep < 5 ? (
              <PrimaryButton
                label="ถัดไป"
                onClick={handleNextStep}
                color="success"
              />
            ) : (
              <PrimaryButton
                label={loading ? "กำลังบันทึก..." : "ยืนยันและบันทึก"}
                onClick={handleSubmit}
                disabled={loading}
                loading={loading}
                color="success"
              />
            )}
          </div>
        </div>

        {showFarmDetails && selectedFarmDetails && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-8xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  ข้อมูลสวนยางพารา
                </h3>
                <PrimaryButton
                  icon="pi pi-times"
                  onClick={() => setShowFarmDetails(false)}
                  rounded
                  text
                  color="secondary"
                />
              </div>
              <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {selectedFarmDetails.farmer && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      ข้อมูลเกษตรกร
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">
                          ชื่อ-นามสกุล:
                        </span>{" "}
                        {`${selectedFarmDetails.farmer.namePrefix}${selectedFarmDetails.farmer.firstName} ${selectedFarmDetails.farmer.lastName}`}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          อีเมล:
                        </span>{" "}
                        {selectedFarmDetails.farmer.email || "-"}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          เบอร์โทรศัพท์:
                        </span>{" "}
                        {selectedFarmDetails.farmer.phoneNumber || "-"}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">
                          เบอร์โทรศัพท์มือถือ:
                        </span>{" "}
                        {selectedFarmDetails.farmer.mobilePhoneNumber || "-"}
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    ที่ตั้งสวนยาง
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">
                        หมู่บ้าน/ชุมชน:
                      </span>{" "}
                      {selectedFarmDetails.villageName}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        หมู่ที่:
                      </span>{" "}
                      {selectedFarmDetails.moo}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">ถนน:</span>{" "}
                      {selectedFarmDetails.road || "-"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">ซอย:</span>{" "}
                      {selectedFarmDetails.alley || "-"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        ตำบล/แขวง:
                      </span>{" "}
                      {selectedFarmDetails.subDistrict}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        อำเภอ/เขต:
                      </span>{" "}
                      {selectedFarmDetails.district}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        จังหวัด:
                      </span>{" "}
                      {selectedFarmDetails.province}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        รูปแบบการจำหน่ายผลผลิต:
                      </span>{" "}
                      {selectedFarmDetails.productDistributionType}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    แผนที่ตั้งสวน
                  </h4>
                  <div className="w-full">
                    <DynamicMapViewer
                      location={selectedFarmDetails.location}
                      height="320px"
                      width="100%"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    รายละเอียดการปลูก
                  </h4>
                  {selectedFarmDetails.plantingDetails &&
                  selectedFarmDetails.plantingDetails.length > 0 ? (
                    <div className="overflow-x-auto">
                      <PrimaryDataTable
                        value={selectedFarmDetails.plantingDetails}
                        columns={[
                          {
                            field: "specie",
                            header: "พันธุ์ยางพารา",
                            body: (rowData: any) => rowData.specie,
                            style: { width: "11%" },
                            headerAlign: "center" as const,
                            bodyAlign: "left" as const,
                          },
                          {
                            field: "areaOfPlot",
                            header: "พื้นที่แปลง (ไร่)",
                            body: (rowData: any) => rowData.areaOfPlot,
                            style: { width: "11%" },
                            headerAlign: "center" as const,
                            bodyAlign: "right" as const,
                          },
                          {
                            field: "numberOfRubber",
                            header: "จำนวนต้นยางทั้งหมด (ต้น)",
                            body: (rowData: any) => rowData.numberOfRubber,
                            style: { width: "16%" },
                            headerAlign: "center" as const,
                            bodyAlign: "right" as const,
                          },
                          {
                            field: "numberOfTapping",
                            header: "จำนวนต้นยางที่กรีดได้ (ต้น)",
                            body: (rowData: any) => rowData.numberOfTapping,
                            style: { width: "17%" },
                            headerAlign: "center" as const,
                            bodyAlign: "right" as const,
                          },
                          {
                            field: "ageOfRubber",
                            header: "อายุต้นยาง (ปี)",
                            body: (rowData: any) => rowData.ageOfRubber,
                            style: { width: "11%" },
                            headerAlign: "center" as const,
                            bodyAlign: "right" as const,
                          },
                          {
                            field: "yearOfTapping",
                            header: "ปีที่เริ่มกรีด",
                            body: (rowData: any) =>
                              formatThaiDate(rowData.yearOfTapping, "year"),
                            style: { width: "10%" },
                            headerAlign: "center" as const,
                            bodyAlign: "center" as const,
                          },
                          {
                            field: "monthOfTapping",
                            header: "เดือนที่เริ่มกรีด",
                            body: (rowData: any) =>
                              formatThaiDate(rowData.monthOfTapping, "month"),
                            style: { width: "11" },
                            headerAlign: "center" as const,
                            bodyAlign: "center" as const,
                          },
                          {
                            field: "totalProduction",
                            header: "ผลผลิตรวม (กก./ปี)",
                            body: (rowData: any) => rowData.totalProduction,
                            style: { width: "13%" },
                            headerAlign: "center" as const,
                            bodyAlign: "right" as const,
                          },
                        ]}
                        loading={loadingFarmDetails}
                        paginator={false}
                        emptyMessage="ไม่มีข้อมูลรายละเอียดการปลูก"
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      ไม่มีข้อมูลรายละเอียดการปลูก
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <PrimaryButton
                  label="ปิด"
                  onClick={() => setShowFarmDetails(false)}
                  color="secondary"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AuditorLayout>
  );
}
