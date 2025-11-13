"use client";

import { InspectionFormModal } from "@/components/auditor/inspections/InspectionFormModal";
import {
  RubberFarmDetailsModal,
  type RubberFarmDetails,
} from "@/components/auditor/inspections/RubberFarmDetailsModal";
import AuditorLayout from "@/components/layout/AuditorLayout";
import PrimaryAutoComplete from "@/components/ui/PrimaryAutoComplete";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";
import PrimaryInputText from "@/components/ui/PrimaryInputText";
import PrimaryMultiSelect from "@/components/ui/PrimaryMultiSelect";
import thaiProvinceData from "@/data/thai-provinces.json";
import {
  useInspectionForm,
  type InspectionItem,
} from "@/hooks/useInspectionForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PrimaryCheckbox from "@/components/ui/PrimaryCheckbox";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import React, { useCallback, useEffect, useState } from "react";

interface Inspection {
  inspectionId: number;
  inspectionNo: number;
  inspectionDateAndTime: string;
  inspectionTypeId: number;
  inspectionStatus: string;
  inspectionResult: string;
  auditorChiefId: number;
  rubberFarmId: number;
  version?: number;
  inspectionType?: {
    typeName: string;
  };
  rubberFarm?: {
    villageName: string;
    district: string;
    province: string;
    farmer?: {
      namePrefix: string;
      firstName: string;
      lastName: string;
    };
  };
}

interface Province {
  id: number;
  name_th: string;
  name_en: string;
}

interface District {
  id: number;
  name_th: string;
  name_en: string;
  province_id: number;
}

interface SubDistrict {
  id: number;
  name_th: string;
  name_en: string;
  amphure_id: number;
}

// Helper function to get status badge class
const getStatusBadgeClass = (status: string): string => {
  if (status === "รอการตรวจประเมิน") return "bg-yellow-100 text-yellow-800";
  if (status === "ตรวจประเมินแล้ว") return "bg-green-100 text-green-800";
  return "bg-gray-100 text-gray-800";
};

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <div className="inline-flex justify-center w-full">
    <span
      className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
        status
      )}`}
    >
      {status}
    </span>
  </div>
);

// Helper types
type SortOrder = 1 | -1 | 0 | null;

interface LazyParams {
  first: number;
  rows: number;
  page: number;
  sortField?: string;
  sortOrder: SortOrder;
  multiSortMeta: Array<{ field: string; order: SortOrder }>;
  filters: {
    province: string;
    district: string;
    subDistrict: string;
    inspectionStatus: string;
  };
}

export default function AuditorInspectionsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // States
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFarmDetails, setShowFarmDetails] = useState(false);
  const [selectedFarmDetails, setSelectedFarmDetails] =
    useState<RubberFarmDetails | null>(null);
  const [loadingFarmDetails, setLoadingFarmDetails] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);

  // Use inspection form hook
  const {
    inspectionItems,
    setInspectionItems,
    currentItemIndex,
    setCurrentItemIndex,
    saving,
    updateRequirementEvaluation,
    updateOtherConditions,
    saveCurrentItem,
    saveAllItems,
    completeInspection,
  } = useInspectionForm();

  // Pagination & Filters
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState<LazyParams>({
    first: 0,
    rows: 10,
    page: 0,
    sortField: undefined,
    sortOrder: null,
    multiSortMeta: [],
    filters: {
      province: "",
      district: "",
      subDistrict: "",
      inspectionStatus: "",
    },
  });

  // AutoComplete states
  const [provinces] = useState<Province[]>(
    thaiProvinceData.map((p: any) => ({
      id: p.id,
      name_th: p.name_th,
      name_en: p.name_en,
    }))
  );
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null
  );
  const [selectedSubDistrictId, setSelectedSubDistrictId] = useState<
    number | null
  >(null);

  // Load inspections function
  const loadInspections = useCallback(
    async (auditorId: number) => {
      try {
        setLoading(true);

        const { first, rows, sortField, sortOrder, multiSortMeta, filters } =
          lazyParams;

        // Build query params
        const params = new URLSearchParams({
          auditorId: auditorId.toString(),
          limit: rows.toString(),
          offset: first.toString(),
          inspectionStatus: "รอการตรวจประเมิน",
          inspectionResult: "รอผลการตรวจประเมิน",
        });

        // Add filters
        if (filters.province) params.append("province", filters.province);
        if (filters.district) params.append("district", filters.district);
        if (filters.subDistrict)
          params.append("subDistrict", filters.subDistrict);
        if (filters.inspectionStatus)
          params.append("inspectionStatus", filters.inspectionStatus);

        // Add sorting
        if (multiSortMeta && multiSortMeta.length > 0) {
          params.append("multiSortMeta", JSON.stringify(multiSortMeta));
        } else if (sortField) {
          params.append("sortField", sortField);
          params.append("sortOrder", sortOrder === 1 ? "asc" : "desc");
        }

        const response = await fetch(
          `/api/v1/inspections?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("ไม่สามารถดึงรายการตรวจประเมินได้");
        }

        const data = await response.json();

        setInspections(data.results || []);
        setTotalRecords(data.paginator?.total || 0);
      } catch (error) {
        console.error("Error fetching inspections:", error);
        setInspections([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    },
    [lazyParams]
  );

  // Fetch inspections on mount and when session changes
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const auditorId = session.user.roleData?.auditorId;
      if (auditorId) {
        loadInspections(auditorId);
      }
    }
  }, [status, session, router, loadInspections]);

  // Reload when lazyParams change
  useEffect(() => {
    if (session?.user?.roleData?.auditorId) {
      loadInspections(session.user.roleData.auditorId);
    }
  }, [lazyParams, session, loadInspections]);

  // Handle pagination
  const onPage = (event: DataTablePageEvent) => {
    setLazyParams((prev) => ({
      ...prev,
      first: event.first,
      rows: event.rows,
      page: event.page || 0,
    }));
  };

  // Handle sorting
  const onSort = (event: DataTableSortEvent) => {
    const validMultiSortMeta = (event.multiSortMeta || []).map((item) => ({
      field: item.field,
      order: (item.order ?? null) as SortOrder,
    }));

    setLazyParams((prev) => ({
      ...prev,
      sortField: event.sortField as string | undefined,
      sortOrder: (event.sortOrder ?? null) as SortOrder,
      multiSortMeta: validMultiSortMeta,
    }));
  };

  // Handle province change
  const handleProvinceChange = (value: number | null) => {
    setSelectedProvinceId(value);
    setSelectedDistrictId(null);
    setSelectedSubDistrictId(null);

    if (value) {
      const provinceData: any = thaiProvinceData.find(
        (p: any) => p.id === value
      );
      if (provinceData?.amphure) {
        setDistricts(provinceData.amphure);
      } else {
        setDistricts([]);
      }
      setSubDistricts([]);
    } else {
      setDistricts([]);
      setSubDistricts([]);
    }
  };

  // Handle district change
  const handleDistrictChange = (value: number | null) => {
    setSelectedDistrictId(value);
    setSelectedSubDistrictId(null);

    if (value) {
      const district = districts.find((d) => d.id === value);
      if (district) {
        const districtData: any = district;
        if (districtData.tambon) {
          setSubDistricts(districtData.tambon);
        } else {
          setSubDistricts([]);
        }
      }
    } else {
      setSubDistricts([]);
    }
  };

  // Handle search
  const handleSearch = () => {
    const selectedProvince = provinces.find((p) => p.id === selectedProvinceId);
    const selectedDistrict = districts.find((d) => d.id === selectedDistrictId);
    const selectedSubDistrict = subDistricts.find(
      (s) => s.id === selectedSubDistrictId
    );

    setLazyParams((prev) => ({
      ...prev,
      first: 0,
      page: 0,
      filters: {
        ...prev.filters,
        province: selectedProvince?.name_th || "",
        district: selectedDistrict?.name_th || "",
        subDistrict: selectedSubDistrict?.name_th || "",
      },
    }));
  };

  // Handle reset search
  const handleResetSearch = () => {
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedSubDistrictId(null);
    setLazyParams((prev) => ({
      ...prev,
      first: 0,
      page: 0,
      filters: {
        province: "",
        district: "",
        subDistrict: "",
        inspectionStatus: "",
      },
    }));
  };

  // Fetch farm details
  const fetchFarmDetails = async (farmId: number) => {
    setLoadingFarmDetails(true);
    try {
      const response = await fetch(`/api/v1/rubber-farms/${farmId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedFarmDetails(data);
      }
    } catch (error) {
      console.error("Error fetching farm details:", error);
    } finally {
      setLoadingFarmDetails(false);
    }
  };

  // View farm details
  const viewFarmDetails = (farmId: number) => {
    setShowFarmDetails(true);
    fetchFarmDetails(farmId);
  };

  // Fetch inspection items
  const fetchInspectionItems = async (inspectionId: number) => {
    try {
      const response = await fetch(
        `/api/v1/inspection-items?inspectionId=${inspectionId}`
      );

      if (!response.ok) {
        throw new Error("ไม่สามารถดึงรายการตรวจได้");
      }

      const items: InspectionItem[] = await response.json();

      // เรียงลำดับตาม inspectionItemMaster.itemNo
      const sortedItems = [...items].sort((a, b) => {
        const itemNoA = a.inspectionItemMaster?.itemNo || 0;
        const itemNoB = b.inspectionItemMaster?.itemNo || 0;
        return itemNoA - itemNoB;
      });

      // เรียงลำดับ requirements ภายในแต่ละรายการตรวจตาม requirementNo
      sortedItems.forEach((item) => {
        if (item.requirements && item.requirements.length > 0) {
          item.requirements.sort((a, b) => {
            return (a.requirementNo || 0) - (b.requirementNo || 0);
          });
        }
      });

      setInspectionItems(sortedItems);

      // Load saved position
      const savedPosition = localStorage.getItem(
        `inspection_${inspectionId}_position`
      );
      if (savedPosition) {
        const position = Number.parseInt(savedPosition, 10);
        setCurrentItemIndex(position);
      } else {
        setCurrentItemIndex(0);
      }
    } catch (error) {
      console.error("Error fetching inspection items:", error);
    }
  };

  // Select inspection for evaluation
  const selectInspection = async (inspection: Inspection) => {
    setSelectedInspection(inspection);
    await fetchInspectionItems(inspection.inspectionId);
    setShowInspectionForm(true);
  };

  // Render additional fields (simplified - extend as needed)
  const renderAdditionalFields = (itemIndex: number) => {
    const item = inspectionItems[itemIndex];
    if (!item || !item.inspectionItemMaster) return null;

    const itemNo = item.inspectionItemMaster.itemNo;
    const otherConditions = item.otherConditions || {};

    // For inspection item 1: Water source fields
    if (itemNo === 1) {
      return (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            ข้อมูลเพิ่มเติม
          </h4>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="waterSourceInPlantation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                แหล่งน้ำที่ใช้ในแปลงปลูก
              </label>
              <PrimaryInputText
                id="waterSourceInPlantation"
                value={otherConditions.waterSourceInPlantation || ""}
                onChange={(value) =>
                  updateOtherConditions(
                    itemIndex,
                    "waterSourceInPlantation",
                    value
                  )
                }
                placeholder="ระบุแหล่งน้ำที่ใช้ในแปลงปลูก"
              />
            </div>
            <div>
              <label
                htmlFor="waterSourcePostHarvest"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                น้ำที่ใช้ในกระบวนการหลังการเก็บเกี่ยว
              </label>
              <PrimaryInputText
                id="waterSourcePostHarvest"
                value={otherConditions.waterSourcePostHarvest || ""}
                onChange={(value) =>
                  updateOtherConditions(
                    itemIndex,
                    "waterSourcePostHarvest",
                    value
                  )
                }
                placeholder="ระบุน้ำที่ใช้ในกระบวนการหลังการเก็บเกี่ยว"
              />
            </div>
          </div>
        </div>
      );
    }

    // For inspection item 2: Land condition - MultiSelect
    if (itemNo === 2) {
      const currentLandConditions = otherConditions.landConditions || [];
      const hasOtherSelected = currentLandConditions.includes("other");

      return (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            ลักษณะพื้นที่ปลูก
          </h4>
          <div className="space-y-4">
            <PrimaryMultiSelect
              id={`landConditions-${itemIndex}`}
              value={currentLandConditions}
              options={[
                { label: "ที่ราบ", value: "flat" },
                { label: "ที่ราบลุ่ม", value: "lowland" },
                { label: "ที่ดอน", value: "upland" },
                { label: "ยกร่อง", value: "raised-bed" },
                { label: "ยกร่องน้ำขัง", value: "raised-bed-waterlogged" },
                { label: "อื่นๆ", value: "other" },
              ]}
              onChange={(values) => {
                updateOtherConditions(itemIndex, "landConditions", values);
              }}
              placeholder="เลือกลักษณะพื้นที่ปลูก (เลือกได้หลายอัน)"
              display="chip"
              maxSelectedLabels={6}
              selectAll={true}
            />

            {hasOtherSelected && (
              <div>
                <label
                  htmlFor={`landConditionsOther-${itemIndex}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ระบุลักษณะพื้นที่อื่นๆ
                </label>
                <PrimaryInputText
                  id={`landConditionsOther-${itemIndex}`}
                  value={otherConditions.landConditionsOther || ""}
                  onChange={(value) =>
                    updateOtherConditions(
                      itemIndex,
                      "landConditionsOther",
                      value
                    )
                  }
                  placeholder="ระบุลักษณะพื้นที่อื่นๆ"
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    // For inspection item 3: Hazardous fertilizer usage - Checkbox to tell not use fertilizer
    if (itemNo === 3) {
      const notUsingHazardous = otherConditions.notUsingHazardous || false;

      return (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            ข้อมูลเพิ่มเติม
          </h4>
          <div className="space-y-4">
            <PrimaryCheckbox
              checked={notUsingHazardous}
              label="ไม่ได้ใช้วัตถุอันตรายทางการเกษตรในการผลิต"
              onChange={(checked: boolean) =>
                updateOtherConditions(itemIndex, "notUsingHazardous", checked)
              }
            />
          </div>
        </div>
      );
    }

    return null;
  };

  // Check if all required fields are filled for all items
  const areAllRequiredFieldsFilled = (): boolean => {
    // ตรวจสอบทุก item
    for (const item of inspectionItems) {
      // ตรวจสอบว่าทุก requirement มีการกรอก evaluationResult และ evaluationMethod
      if (item.requirements && item.requirements.length > 0) {
        for (const req of item.requirements) {
          // ตรวจสอบว่ามีการเลือก evaluationResult หรือไม่ (ต้องไม่เป็น NOT_EVALUATED, empty, null, undefined)
          if (
            !req.evaluationResult ||
            req.evaluationResult === "NOT_EVALUATED"
          ) {
            return false;
          }

          // ตรวจสอบว่ามีการเลือก evaluationMethod หรือไม่ (ต้องไม่เป็น PENDING, empty, null, undefined)
          if (!req.evaluationMethod || req.evaluationMethod === "PENDING") {
            return false;
          }
        }
      }
    }

    return true;
  };

  // Handle save
  const handleSave = async () => {
    if (selectedInspection) {
      const success = await saveCurrentItem(selectedInspection.inspectionId);
      if (success) {
        // Save position
        localStorage.setItem(
          `inspection_${selectedInspection.inspectionId}_position`,
          currentItemIndex.toString()
        );
        alert("บันทึกข้อมูลสำเร็จ");
      }
    }
  };

  // Handle save all items
  const handleSaveAll = async () => {
    if (selectedInspection) {
      const success = await saveAllItems(selectedInspection.inspectionId);
      if (success) {
        // Keep current position
        localStorage.setItem(
          `inspection_${selectedInspection.inspectionId}_position`,
          currentItemIndex.toString()
        );
      }
    }
  };

  // Handle complete
  const handleComplete = async () => {
    if (selectedInspection) {
      const success = await completeInspection(selectedInspection.inspectionId);
      if (success) {
        // Clear saved position
        localStorage.removeItem(
          `inspection_${selectedInspection.inspectionId}_position`
        );
        alert("จบการตรวจประเมินสำเร็จ");
        setShowInspectionForm(false);
        // Reload inspections
        if (session?.user?.roleData?.auditorId) {
          loadInspections(session.user.roleData.auditorId);
        }
      }
    }
  };

  // Handle previous/next - ไม่บันทึก เฉพาะเปลี่ยนรายการ
  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentItemIndex < inspectionItems.length - 1) {
      // ไม่บันทึก เพียงแค่ไปรายการถัดไป
      setCurrentItemIndex(currentItemIndex + 1);
    } else {
      // ถ้าอยู่รายการสุดท้าย วนกลับไปรายการแรก (ไม่บันทึก)
      setCurrentItemIndex(0);
    }
  };

  // DataTable columns
  const columns = [
    {
      field: "inspectionNo",
      header: "รหัสการตรวจ",
      sortable: true,
      body: (rowData: Inspection) => rowData.inspectionNo,
      headerAlign: "center" as const,
      bodyAlign: "center" as const,
    },
    {
      field: "inspectionDateAndTime",
      header: "วันที่ตรวจ",
      sortable: true,
      body: (rowData: Inspection) =>
        new Date(rowData.inspectionDateAndTime).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      headerAlign: "center" as const,
      bodyAlign: "center" as const,
    },
    {
      field: "inspectionType.typeName",
      header: "ประเภท",
      sortable: true,
      body: (rowData: Inspection) =>
        rowData.inspectionType?.typeName || "ไม่ระบุ",
      headerAlign: "center" as const,
      bodyAlign: "left" as const,
    },
    {
      field: "rubberFarm.farmer",
      header: "เกษตรกร",
      sortable: true,
      body: (rowData: Inspection) => {
        const farmer = rowData.rubberFarm?.farmer;
        return farmer
          ? `${farmer.namePrefix}${farmer.firstName} ${farmer.lastName}`
          : "ไม่ระบุ";
      },
      headerAlign: "center" as const,
      bodyAlign: "left" as const,
    },
    {
      field: "rubberFarm.province",
      header: "จังหวัด",
      sortable: true,
      body: (rowData: Inspection) => rowData.rubberFarm?.province || "ไม่ระบุ",
      headerAlign: "center" as const,
      bodyAlign: "left" as const,
    },
    {
      field: "inspectionStatus",
      header: "สถานะ",
      sortable: true,
      body: (rowData: Inspection) => (
        <StatusBadge status={rowData.inspectionStatus} />
      ),
      headerAlign: "center" as const,
      bodyAlign: "center" as const,
      mobileAlign: "right" as const,
      mobileHideLabel: false,
    },
    {
      field: "actions",
      header: "",
      body: (rowData: Inspection) => (
        <div className="flex justify-center gap-2">
          <PrimaryButton
            icon="pi pi-eye"
            onClick={() => viewFarmDetails(rowData.rubberFarmId)}
            color="info"
            rounded
            text
            // tooltip="ดูรายละเอียดสวน"
            // tooltipOptions={{ position: "left" }}
          />
          <PrimaryButton
            icon="pi pi-file-edit"
            onClick={() => selectInspection(rowData)}
            color="success"
            rounded
            text
            // tooltip="เริ่มตรวจประเมิน"
            // tooltipOptions={{
            //   position: "left",
            // }}
          />
        </div>
      ),
      headerAlign: "center" as const,
      bodyAlign: "center" as const,
      mobileAlign: "right" as const,
      mobileHideLabel: true,
    },
  ];

  if (loading && inspections.length === 0) {
    return (
      <AuditorLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
        </div>
      </AuditorLayout>
    );
  }

  return (
    <AuditorLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            ตรวจประเมินสวนยางพารา
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            รายการตรวจประเมินที่รอดำเนินการ
          </p>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="province-search"
              >
                จังหวัด
              </label>
              <PrimaryAutoComplete
                id="province-search"
                value={selectedProvinceId || ""}
                options={provinces.map((province) => ({
                  label: province.name_th,
                  value: province.id,
                }))}
                onChange={(value) => handleProvinceChange(value as number)}
                placeholder="เลือกจังหวัด"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="district-search"
              >
                อำเภอ
              </label>
              <PrimaryAutoComplete
                id="district-search"
                value={selectedDistrictId || ""}
                options={districts.map((district) => ({
                  label: district.name_th,
                  value: district.id,
                }))}
                onChange={(value) => handleDistrictChange(value as number)}
                placeholder="เลือกอำเภอ"
                disabled={!selectedProvinceId}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="subdistrict-search"
              >
                ตำบล
              </label>
              <PrimaryAutoComplete
                id="subdistrict-search"
                value={selectedSubDistrictId || ""}
                options={subDistricts.map((subDistrict) => ({
                  label: subDistrict.name_th,
                  value: subDistrict.id,
                }))}
                onChange={(value) => setSelectedSubDistrictId(value as number)}
                placeholder="เลือกตำบล"
                disabled={!selectedDistrictId}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2 justify-center items-center">
            <PrimaryButton
              label="ค้นหา"
              icon="pi pi-search"
              onClick={handleSearch}
              color="success"
            />
            <PrimaryButton
              label="ล้างค่า"
              icon="pi pi-refresh"
              onClick={handleResetSearch}
              color="secondary"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <PrimaryDataTable
            value={inspections}
            columns={columns}
            loading={loading}
            paginator
            rows={lazyParams.rows}
            totalRecords={totalRecords}
            lazy
            onPage={onPage}
            first={lazyParams.first}
            sortMode="multiple"
            multiSortMeta={lazyParams.multiSortMeta}
            onSort={onSort}
            emptyMessage="ไม่พบรายการตรวจประเมินที่รอดำเนินการ"
            dataKey="inspectionId"
            rowsPerPageOptions={[10, 25, 50]}
          />
        </div>

        {/* Farm Details Modal */}
        {showFarmDetails && (
          <RubberFarmDetailsModal
            farmDetails={selectedFarmDetails}
            loading={loadingFarmDetails}
            onClose={() => setShowFarmDetails(false)}
          />
        )}

        {/* Inspection Form Modal */}
        <InspectionFormModal
          show={showInspectionForm}
          onClose={() => setShowInspectionForm(false)}
          inspectionItems={inspectionItems}
          currentItemIndex={currentItemIndex}
          saving={saving}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSave={handleSave}
          onSaveAll={handleSaveAll}
          onComplete={handleComplete}
          updateRequirementEvaluation={updateRequirementEvaluation}
          updateOtherConditions={updateOtherConditions}
          renderAdditionalFields={renderAdditionalFields}
          allRequiredFieldsFilled={areAllRequiredFieldsFilled()}
        />
      </div>
    </AuditorLayout>
  );
}
