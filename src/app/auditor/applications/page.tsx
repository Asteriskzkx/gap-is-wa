"use client";

import AuditorLayout from "@/components/layout/AuditorLayout";
import {
  PrimaryAutoComplete,
  PrimaryButton,
  PrimaryCalendar,
  PrimaryDataTable,
  PrimaryInputText,
  PrimaryCheckbox,
} from "@/components/ui";
import thaiProvinceData from "@/data/thai-provinces.json";
import { formatThaiDate } from "@/utils/dateFormatter";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import React, { useEffect, useState } from "react";

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
  farmerName: string;
  farmerEmail: string;
}

interface RubberFarmDetails {
  rubberFarmId: number;
  villageName: string;
  moo: number;
  road: string;
  alley: string;
  subDistrict: string;
  district: string;
  province: string;
  location: any;
  plantingDetails: PlantingDetail[];
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
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State for form data
  const [rubberFarms, setRubberFarms] = useState<RubberFarm[]>([]);
  const [inspectionTypes, setInspectionTypes] = useState<InspectionType[]>([]);
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [showFarmDetails, setShowFarmDetails] = useState(false);
  const [selectedFarmDetails, setSelectedFarmDetails] =
    useState<RubberFarmDetails | null>(null);
  const [loadingFarmDetails, setLoadingFarmDetails] = useState(false);

  const [selectedFarm, setSelectedFarm] = useState<RubberFarm | null>(null);
  const [selectedInspectionType, setSelectedInspectionType] =
    useState<InspectionType | null>(null);
  const [selectedAuditors, setSelectedAuditors] = useState<Auditor[]>([]);
  const [inspectionDate, setInspectionDate] = useState<Date | null>(null);

  // State for search and pagination
  const [searchFilters, setSearchFilters] = useState({
    provinceId: null as number | null,
    amphureId: null as number | null,
    tambonId: null as number | null,
    province: "",
    district: "",
    subDistrict: "",
  });
  const [auditorSearchTerm, setAuditorSearchTerm] = useState("");

  // State สำหรับข้อมูลจังหวัด อำเภอ ตำบล
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);

  // Pagination state for lazy loading
  const [farmsPagination, setFarmsPagination] = useState({
    first: 0,
    rows: 10,
    totalRecords: 0,
  });

  // Pagination state for auditors
  const [auditorsPagination, setAuditorsPagination] = useState({
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

  // Sort state for auditors
  const [auditorSortField, setAuditorSortField] = useState<string | undefined>(
    undefined
  );
  const [auditorSortOrder, setAuditorSortOrder] = useState<1 | -1 | 0 | null>(
    null
  );
  const [auditorMultiSortMeta, setAuditorMultiSortMeta] = useState<
    Array<{
      field: string;
      order: 1 | -1 | 0 | null;
    }>
  >([]);

  // Auditor info
  const [auditor, setAuditor] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    isLoading: true,
  });

  const fetchFarmDetails = async (farmId: number) => {
    setLoadingFarmDetails(true);
    try {
      const response = await fetch(`/api/v1/rubber-farms/${farmId}`);

      if (response.ok) {
        const data = await response.json();
        setSelectedFarmDetails(data);
        setShowFarmDetails(true);
      } else {
        alert("ไม่สามารถดึงข้อมูลสวนยางได้");
      }
    } catch (error) {
      console.error("Error fetching farm details:", error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoadingFarmDetails(false);
    }
  };

  // Fetch rubber farms with pagination
  const fetchRubberFarms = async (
    offset = 0,
    limit = 10,
    filters?: {
      province?: string;
      district?: string;
      subDistrict?: string;
    },
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
        limit: limit.toString(),
        offset: offset.toString(),
      });

      // เพิ่ม search filters
      if (filters?.province) params.append("province", filters.province);
      if (filters?.district) params.append("district", filters.district);
      if (filters?.subDistrict)
        params.append("subDistrict", filters.subDistrict);

      // เพิ่ม sort parameters
      if (sorting?.sortField) params.append("sortField", sorting.sortField);
      if (sorting?.sortOrder) params.append("sortOrder", sorting.sortOrder);
      if (sorting?.multiSortMeta) {
        // Filter เฉพาะ items ที่มี order เป็น 1 หรือ -1
        const validSortMeta = sorting.multiSortMeta.filter(
          (item) => item.order === 1 || item.order === -1
        );
        if (validSortMeta.length > 0) {
          params.append("multiSortMeta", JSON.stringify(validSortMeta));
        }
      }

      const response = await fetch(
        `/api/v1/auditors/available-farms?${params.toString()}`
      );

      if (response.ok) {
        const result = await response.json();

        // Handle new paginated response format
        if (result.results && result.paginator) {
          setRubberFarms(result.results);
          setFarmsPagination({
            first: result.paginator.offset,
            rows: result.paginator.limit,
            totalRecords: result.paginator.total,
          });
        } else {
          console.error("Unexpected API response format:", result);
          setRubberFarms([]);
          setFarmsPagination({ first: 0, rows: 10, totalRecords: 0 });
        }
      } else {
        console.error("Failed to fetch rubber farms:", response.status);
        setRubberFarms([]);
        setFarmsPagination({ first: 0, rows: 10, totalRecords: 0 });
      }
    } catch (error) {
      console.error("Error fetching rubber farms:", error);
      setRubberFarms([]);
      setFarmsPagination({ first: 0, rows: 10, totalRecords: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectionTypes = async () => {
    try {
      const response = await fetch("/api/v1/inspections/types");
      if (response.ok) {
        const data = await response.json();
        setInspectionTypes(data);
      }
    } catch (error) {
      console.error("Error fetching inspection types:", error);
    }
  };

  const fetchAuditors = async (
    offset = 0,
    limit = 10,
    search = "",
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
        limit: limit.toString(),
        offset: offset.toString(),
      });

      // เพิ่ม search filter
      if (search) params.append("search", search);

      // เพิ่ม sort parameters
      if (sorting?.sortField) params.append("sortField", sorting.sortField);
      if (sorting?.sortOrder) params.append("sortOrder", sorting.sortOrder);
      if (sorting?.multiSortMeta) {
        // Filter เฉพาะ items ที่มี order เป็น 1 หรือ -1
        const validSortMeta = sorting.multiSortMeta.filter(
          (item) => item.order === 1 || item.order === -1
        );
        if (validSortMeta.length > 0) {
          params.append("multiSortMeta", JSON.stringify(validSortMeta));
        }
      }

      const response = await fetch(
        `/api/v1/auditors/other-auditors?${params.toString()}`
      );

      if (response.ok) {
        const result = await response.json();

        // Handle paginated response format (same as available-farms)
        if (result.results && result.paginator) {
          setAuditors(result.results);
          setAuditorsPagination({
            first: result.paginator.offset,
            rows: result.paginator.limit,
            totalRecords: result.paginator.total,
          });
        } else {
          console.error("Unexpected API response format:", result);
          setAuditors([]);
          setAuditorsPagination({ first: 0, rows: 10, totalRecords: 0 });
        }
      }
    } catch (error) {
      console.error("Error fetching auditors:", error);
      setAuditors([]);
      setAuditorsPagination({ first: 0, rows: 10, totalRecords: 0 });
    } finally {
      setLoading(false);
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
    if (searchFilters.provinceId) {
      const selectedProvince = provinces.find(
        (p) => p.id === searchFilters.provinceId
      );
      if (selectedProvince) {
        setAmphures(selectedProvince.amphure); // แก้ไขจาก amphures เป็น amphure
        // หาชื่อจังหวัดและอัพเดท
        setSearchFilters((prev) => ({
          ...prev,
          province: selectedProvince.name_th,
          amphureId: null,
          tambonId: null,
          district: "",
          subDistrict: "",
        }));
      }
    } else {
      setAmphures([]);
      setTambons([]);
    }
  }, [searchFilters.provinceId, provinces]);

  // อัพเดทตำบลเมื่อเลือกอำเภอ
  useEffect(() => {
    if (searchFilters.amphureId) {
      const selectedAmphure = amphures.find(
        (a) => a.id === searchFilters.amphureId
      );
      if (selectedAmphure) {
        setTambons(selectedAmphure.tambon); // แก้ไขจาก tambons เป็น tambon
        // หาชื่ออำเภอและอัพเดท
        setSearchFilters((prev) => ({
          ...prev,
          district: selectedAmphure.name_th,
          tambonId: null,
          subDistrict: "",
        }));
      }
    } else {
      setTambons([]);
    }
  }, [searchFilters.amphureId, amphures]);

  // อัพเดทชื่อตำบลเมื่อเลือกตำบล
  useEffect(() => {
    if (searchFilters.tambonId) {
      const selectedTambon = tambons.find(
        (t) => t.id === searchFilters.tambonId
      );
      if (selectedTambon) {
        setSearchFilters((prev) => ({
          ...prev,
          subDistrict: selectedTambon.name_th,
        }));
      }
    }
  }, [searchFilters.tambonId, tambons]);

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

      // Fetch data
      fetchRubberFarms(0, 10, searchFilters, {
        sortField,
        sortOrder:
          sortOrder === 1 ? "asc" : sortOrder === -1 ? "desc" : undefined,
        multiSortMeta: multiSortMeta.filter(
          (item) => item.order === 1 || item.order === -1
        ) as Array<{ field: string; order: number }>,
      });
      fetchInspectionTypes();
      fetchAuditors(0, 10, auditorSearchTerm, {
        sortField: auditorSortField,
        sortOrder:
          auditorSortOrder === 1
            ? "asc"
            : auditorSortOrder === -1
            ? "desc"
            : undefined,
        multiSortMeta: auditorMultiSortMeta.filter(
          (item) => item.order === 1 || item.order === -1
        ) as Array<{ field: string; order: number }>,
      });
    }
  }, [status, session, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle page change for DataTable
  const onPageChange = (event: DataTablePageEvent) => {
    fetchRubberFarms(event.first, event.rows, searchFilters, {
      sortField,
      sortOrder:
        sortOrder === 1 ? "asc" : sortOrder === -1 ? "desc" : undefined,
      multiSortMeta: multiSortMeta.filter(
        (item) => item.order === 1 || item.order === -1
      ) as Array<{ field: string; order: number }>,
    });
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
      fetchRubberFarms(
        farmsPagination.first,
        farmsPagination.rows,
        searchFilters,
        {
          multiSortMeta: validSortMeta,
        }
      );
    } else {
      setSortField(event.sortField);
      const validOrder = event.sortOrder !== undefined ? event.sortOrder : null;
      setSortOrder(validOrder);
      fetchRubberFarms(
        farmsPagination.first,
        farmsPagination.rows,
        searchFilters,
        {
          sortField: event.sortField,
          sortOrder: event.sortOrder === 1 ? "asc" : "desc",
        }
      );
    }
  };

  // Handle search
  const handleSearch = () => {
    const validSortMeta = multiSortMeta.filter(
      (item) => item.order === 1 || item.order === -1
    ) as Array<{ field: string; order: number }>;
    fetchRubberFarms(0, farmsPagination.rows, searchFilters, {
      sortField,
      sortOrder:
        sortOrder === 1 ? "asc" : sortOrder === -1 ? "desc" : undefined,
      multiSortMeta: validSortMeta,
    });
  };

  // Handle reset search
  const handleResetSearch = () => {
    setSearchFilters({
      provinceId: null,
      amphureId: null,
      tambonId: null,
      province: "",
      district: "",
      subDistrict: "",
    });
    const validSortMeta = multiSortMeta.filter(
      (item) => item.order === 1 || item.order === -1
    ) as Array<{ field: string; order: number }>;
    fetchRubberFarms(
      0,
      farmsPagination.rows,
      {
        province: "",
        district: "",
        subDistrict: "",
      },
      {
        sortField,
        sortOrder:
          sortOrder === 1 ? "asc" : sortOrder === -1 ? "desc" : undefined,
        multiSortMeta: validSortMeta,
      }
    );
  };

  // Filter for auditors
  const handleAuditorSearch = () => {
    const validSortMeta = auditorMultiSortMeta.filter(
      (item) => item.order === 1 || item.order === -1
    ) as Array<{ field: string; order: number }>;
    fetchAuditors(0, auditorsPagination.rows, auditorSearchTerm, {
      sortField: auditorSortField,
      sortOrder:
        auditorSortOrder === 1
          ? "asc"
          : auditorSortOrder === -1
          ? "desc"
          : undefined,
      multiSortMeta: validSortMeta,
    });
  };

  // Handle page change for Auditors DataTable
  const onAuditorPageChange = (event: DataTablePageEvent) => {
    fetchAuditors(event.first, event.rows, auditorSearchTerm, {
      sortField: auditorSortField,
      sortOrder:
        auditorSortOrder === 1
          ? "asc"
          : auditorSortOrder === -1
          ? "desc"
          : undefined,
      multiSortMeta: auditorMultiSortMeta.filter(
        (item) => item.order === 1 || item.order === -1
      ) as Array<{ field: string; order: number }>,
    });
  };

  // Handle sort change for Auditors
  const onAuditorSortChange = (event: DataTableSortEvent) => {
    if (event.multiSortMeta) {
      const validMeta = event.multiSortMeta.map((meta) => ({
        field: meta.field,
        order: (meta.order ?? null) as 1 | -1 | 0 | null,
      }));
      setAuditorMultiSortMeta(validMeta);
      setAuditorSortField(undefined);
      setAuditorSortOrder(null);

      const validSortMeta = validMeta.filter(
        (item) => item.order === 1 || item.order === -1
      ) as Array<{ field: string; order: number }>;

      fetchAuditors(
        auditorsPagination.first,
        auditorsPagination.rows,
        auditorSearchTerm,
        {
          multiSortMeta: validSortMeta,
        }
      );
    } else {
      setAuditorSortField(event.sortField);
      setAuditorSortOrder((event.sortOrder ?? null) as 1 | -1 | 0 | null);
      setAuditorMultiSortMeta([]);

      fetchAuditors(
        auditorsPagination.first,
        auditorsPagination.rows,
        auditorSearchTerm,
        {
          sortField: event.sortField,
          sortOrder: event.sortOrder === 1 ? "asc" : "desc",
        }
      );
    }
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
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/v1/inspections/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rubberFarmId: selectedFarm!.id,
          inspectionTypeId: selectedInspectionType!.inspectionTypeId,
          inspectionDateAndTime: inspectionDate!.toISOString(),
          additionalAuditorIds: selectedAuditors.map((a) => a.id),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("กำหนดการตรวจประเมินถูกบันทึกเรียบร้อยแล้ว");
        setTimeout(() => router.push("/auditor/dashboard"), 2000);
      } else {
        setError(data.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
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

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="hidden md:block">
        <div className="flex items-center justify-between w-full">
          {[1, 2, 3, 4, 5].map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                    currentStep >= step
                      ? "bg-green-600 border-green-600 text-white shadow-lg"
                      : currentStep === step - 1
                      ? "bg-white border-green-300 text-green-600"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {currentStep > step ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <div className="mt-3 text-center">
                  <div
                    className={`text-xs font-medium transition-colors duration-300 whitespace-nowrap ${
                      currentStep >= step ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {step === 1 && "เลือกสวนยาง"}
                    {step === 2 && "ประเภทการตรวจ"}
                    {step === 3 && "คณะผู้ตรวจ"}
                    {step === 4 && "วันที่ตรวจ"}
                    {step === 5 && "ยืนยัน"}
                  </div>
                </div>
              </div>
              {index < 4 && (
                <div className="flex-1 mx-2 mb-6">
                  <div
                    className={`w-full h-1 rounded-full transition-colors duration-300 ${
                      currentStep > step ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <React.Fragment key={step}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    currentStep >= step
                      ? "bg-green-600 text-white"
                      : currentStep === step - 1
                      ? "bg-green-100 text-green-600 border border-green-300"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {currentStep > step ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {index < 4 && (
                  <div
                    className={`w-6 h-0.5 flex-shrink-0 transition-colors duration-300 ${
                      currentStep > step ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700">
            ขั้นตอนที่ {currentStep}: {currentStep === 1 && "เลือกสวนยางพารา"}
            {currentStep === 2 && "เลือกประเภทการตรวจประเมิน"}
            {currentStep === 3 && "เลือกคณะผู้ตรวจประเมิน"}
            {currentStep === 4 && "เลือกวันทีตรวจประเมิน"}
            {currentStep === 5 && "ยืนยันข้อมูล"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {currentStep} จาก 5 ขั้นตอน
          </div>
        </div>
      </div>
    </div>
  );

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
                    value={searchFilters.provinceId || ""}
                    options={provinces.map((province) => ({
                      label: province.name_th,
                      value: province.id,
                    }))}
                    onChange={(value) => {
                      setSearchFilters({
                        ...searchFilters,
                        provinceId: value as number,
                        amphureId: null,
                        tambonId: null,
                      });
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
                    value={searchFilters.amphureId || ""}
                    options={amphures.map((amphure) => ({
                      label: amphure.name_th,
                      value: amphure.id,
                    }))}
                    onChange={(value) => {
                      setSearchFilters({
                        ...searchFilters,
                        amphureId: value as number,
                        tambonId: null,
                      });
                    }}
                    placeholder="เลือกอำเภอ/เขต"
                    disabled={!searchFilters.provinceId}
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
                    value={searchFilters.tambonId || ""}
                    options={tambons.map((tambon) => ({
                      label: tambon.name_th,
                      value: tambon.id,
                    }))}
                    onChange={(value) => {
                      setSearchFilters({
                        ...searchFilters,
                        tambonId: value as number,
                      });
                    }}
                    placeholder="เลือกตำบล/แขวง"
                    disabled={!searchFilters.amphureId}
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
                        onClick={() => fetchFarmDetails(rowData.id)}
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
              rows={farmsPagination.rows}
              totalRecords={farmsPagination.totalRecords}
              lazy
              onPage={onPageChange}
              sortMode="multiple"
              multiSortMeta={multiSortMeta}
              onSort={onSortChange}
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
            <div className="grid gap-4">
              {inspectionTypes.map((type) => (
                <div
                  key={type.inspectionTypeId}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedInspectionType?.inspectionTypeId ===
                    type.inspectionTypeId
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedInspectionType(type)}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="inspectionType"
                      checked={
                        selectedInspectionType?.inspectionTypeId ===
                        type.inspectionTypeId
                      }
                      onChange={() => setSelectedInspectionType(type)}
                      className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {type.typeName}
                      </h3>
                      {type.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {type.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
                onClick={handleAuditorSearch}
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
                  style: { width: "50%" },
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                },
                {
                  field: "email",
                  header: "อีเมล",
                  body: (rowData: Auditor) => rowData.email,
                  style: { width: "25%" },
                  sortable: true,
                  headerAlign: "center" as const,
                  bodyAlign: "left" as const,
                },
              ]}
              loading={loading}
              paginator
              rows={auditorsPagination.rows}
              totalRecords={auditorsPagination.totalRecords}
              lazy
              onPage={onAuditorPageChange}
              sortMode="multiple"
              multiSortMeta={auditorMultiSortMeta}
              onSort={onAuditorSortChange}
              emptyMessage="ไม่พบผู้ตรวจประเมินในระบบ"
              rowClassName={(data: Auditor) =>
                selectedAuditors.some((a) => a.id === data.id)
                  ? "bg-green-50"
                  : ""
              }
              first={auditorsPagination.first}
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
                  <svg
                    className="inline-block w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
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
        <StepIndicator />
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
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-600">
                        จังหวัด:
                      </span>{" "}
                      {selectedFarmDetails.province}
                    </div>
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
                          },
                          {
                            field: "areaOfPlot",
                            header: "พื้นที่แปลง (ไร่)",
                            body: (rowData: any) => rowData.areaOfPlot,
                          },
                          {
                            field: "numberOfRubber",
                            header: "จำนวนต้นยางทั้งหมด (ต้น)",
                            body: (rowData: any) => rowData.numberOfRubber,
                          },
                          {
                            field: "numberOfTapping",
                            header: "จำนวนต้นยางที่กรีดได้ (ต้น)",
                            body: (rowData: any) => rowData.numberOfTapping,
                          },
                          {
                            field: "ageOfRubber",
                            header: "อายุต้นยาง (ปี)",
                            body: (rowData: any) => rowData.ageOfRubber,
                          },
                          {
                            field: "yearOfTapping",
                            header: "ปีที่เริ่มกรีด",
                            body: (rowData: any) =>
                              formatThaiDate(rowData.yearOfTapping, "year"),
                          },
                          {
                            field: "monthOfTapping",
                            header: "เดือนที่เริ่มกรีด",
                            body: (rowData: any) =>
                              formatThaiDate(rowData.monthOfTapping, "month"),
                          },
                          {
                            field: "totalProduction",
                            header: "ผลผลิตรวม (กก./ปี)",
                            body: (rowData: any) => rowData.totalProduction,
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
