"use client";

import { StepIndicator } from "@/components/farmer/StepIndicator";
import AuditorLayout from "@/components/layout/AuditorLayout";
import DynamicMapViewer from "@/components/maps/DynamicMapViewer";
import PrimaryAutoComplete from "@/components/ui/PrimaryAutoComplete";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryCheckbox from "@/components/ui/PrimaryCheckbox";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";
import PrimaryInputNumber from "@/components/ui/PrimaryInputNumber";
import PrimaryInputTextarea from "@/components/ui/PrimaryInputTextarea";
import thaiProvinceData from "@/data/thai-provinces.json";
import { useAuditorGardenData } from "@/hooks/useAuditorGardenData";
import { useFormStepper } from "@/hooks/useFormStepper";
import { CONTAINER, HEADER, SPACING } from "@/styles/auditorClasses";
import { useMemo, useState } from "react";

const rubberSpeciesOptions = [
  { label: "RRIT 251", value: "RRIT 251" },
  { label: "RRIM 600", value: "RRIM 600" },
  { label: "BPM 24", value: "BPM 24" },
  { label: "PB 235", value: "PB 235" },
  { label: "RRIT 408", value: "RRIT 408" },
  { label: "RRIT 226", value: "RRIT 226" },
  { label: "อื่นๆ", value: "อื่นๆ" },
];

export default function Page() {
  const genId = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

  const {
    items,
    loading,
    totalRecords,
    lazyParams,
    applyFilters,
    clearFilters,
    handlePageChange,
    handleSort,
    currentTab,
    onTabChange,
    selectedProvinceId,
    selectedDistrictId,
    selectedSubDistrictId,
    setSelectedProvinceId,
    setSelectedDistrictId,
    setSelectedSubDistrictId,
  } = useAuditorGardenData(10);

  const [selectedInspection, setSelectedInspection] = useState<Record<
    string,
    any
  > | null>(null);

  // location autocomplete state
  const [provinces] = useState<any[]>(
    (thaiProvinceData as any).map((p: any) => ({
      id: p.id,
      name_th: p.name_th,
    }))
  );
  const [districts, setDistricts] = useState<any[]>([]);
  const [subDistricts, setSubDistricts] = useState<any[]>([]);

  const { step, nextStep, prevStep } = useFormStepper(2);

  // Planting details for step 2
  const [plantingDetails, setPlantingDetails] = useState<
    Array<{
      id: string;
      specie: string;
      spacing: number | null;
      numberOfTrees: number | null;
      plantingDate: Date | null;
    }>
  >([
    {
      id: genId(),
      specie: "",
      spacing: null,
      numberOfTrees: null,
      plantingDate: null,
    },
  ]);

  const updatePlantingDetail = (id: string, field: string, value: any) => {
    setPlantingDetails((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addPlantingDetail = () =>
    setPlantingDetails((prev) => [
      ...prev,
      {
        id: genId(),
        specie: "",
        spacing: null,
        numberOfTrees: null,
        plantingDate: null,
      },
    ]);

  const removePlantingDetail = (id: string) =>
    setPlantingDetails((prev) => prev.filter((p) => p.id !== id));

  // Water system state (step 2 - section 2)
  const [waterSystemHas, setWaterSystemHas] = useState<boolean | null>(null);
  const [waterSystemDetails, setWaterSystemDetails] = useState<string>("");

  const handleTabChange = (value: string) => {
    onTabChange("inspectionTab", value);
    setSelectedInspection(null);
  };

  const columns = useMemo(
    () => [
      {
        field: "inspectionNo",
        header: "รหัสการตรวจ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (r: any) => r.inspectionNo || "-",
        style: { width: "12%" },
      },
      {
        field: "inspectionDateAndTime",
        header: "วันที่ตรวจ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (r: any) =>
          r.inspectionDateAndTime
            ? new Date(r.inspectionDateAndTime).toLocaleString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "-",
        style: { width: "12%" },
      },
      {
        field: "inspectionType.typeName",
        header: "ประเภท",
        sortable: true,
        body: (r: any) => r.inspectionType?.typeName || "ไม่ระบุ",
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        style: { width: "31%" },
      },
      {
        field: "rubberFarm",
        header: "สถานที่",
        sortable: false,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        body: (r: any) =>
          [
            r.rubberFarm?.villageName,
            r.rubberFarm?.subDistrict,
            r.rubberFarm?.district,
            r.rubberFarm?.province,
          ]
            .filter(Boolean)
            .join(" ") || "-",
        style: { width: "31%" },
      },
      {
        field: "rubberFarm.farmer",
        header: "เกษตรกร",
        sortable: true,
        body: (r: any) => {
          const farmer = r.rubberFarm?.farmer;
          return farmer
            ? `${farmer.namePrefix}${farmer.firstName} ${farmer.lastName}`
            : "ไม่ระบุ";
        },
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        style: { width: "14%" },
      },
    ],
    []
  );

  return (
    <AuditorLayout>
      <div className={CONTAINER.page}>
        <div className={SPACING.mb8}>
          <h1 className={HEADER.title}>บันทึกข้อมูลประจำสวนยาง</h1>
          <p className={HEADER.subtitle}>
            จัดเก็บข้อมูลสำคัญของสวนยางพาราที่ได้รับการตรวจประเมิน
          </p>
        </div>

        <div className={SPACING.mb6}>
          <StepIndicator
            currentStep={step}
            maxSteps={2}
            stepLabels={["เลือกการตรวจประเมิน", "บันทึกข้อมูลประจำสวนยาง"]}
          />
        </div>

        <div className={CONTAINER.card}>
          <div className={CONTAINER.cardPadding}>
            {step === 1 && (
              <div className={SPACING.mb6}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  <div className="w-full sm:w-full">
                    <div>
                      <label
                        className="block text-sm text-gray-600 mb-1"
                        htmlFor="province-search"
                      >
                        จังหวัด
                      </label>
                      <PrimaryAutoComplete
                        id="province-search"
                        value={selectedProvinceId || ""}
                        options={(provinces || []).map((province: any) => ({
                          label: province.name_th,
                          value: province.id,
                        }))}
                        onChange={(value) => {
                          // update hook state and local districts
                          const v = value as number | "";
                          const id = v === "" ? null : Number(v);
                          setSelectedProvinceId(id);
                          setSelectedDistrictId(null);
                          setSelectedSubDistrictId(null);
                          if (id) {
                            const provinceData: any = (
                              thaiProvinceData as any
                            ).find((p: any) => p.id === id);
                            if (provinceData?.amphure)
                              setDistricts(provinceData.amphure);
                            else setDistricts([]);
                            setSubDistricts([]);
                          } else {
                            setDistricts([]);
                            setSubDistricts([]);
                          }
                        }}
                        placeholder="เลือกจังหวัด"
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-full">
                    <div>
                      <label
                        className="block text-sm text-gray-600 mb-1"
                        htmlFor="district-search"
                      >
                        อำเภอ
                      </label>
                      <PrimaryAutoComplete
                        id="district-search"
                        value={selectedDistrictId || ""}
                        options={(districts || []).map((d: any) => ({
                          label: d.name_th,
                          value: d.id,
                        }))}
                        onChange={(value) => {
                          const v = value as number | "";
                          const id = v === "" ? null : Number(v);
                          setSelectedDistrictId(id);
                          setSelectedSubDistrictId(null);
                          if (id) {
                            const district = (districts || []).find(
                              (di: any) => di.id === id
                            );
                            if (district?.tambon)
                              setSubDistricts(district.tambon);
                            else setSubDistricts([]);
                          } else {
                            setSubDistricts([]);
                          }
                        }}
                        placeholder="เลือกอำเภอ"
                        disabled={!selectedProvinceId}
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-full">
                    <div>
                      <label
                        className="block text-sm text-gray-600 mb-1"
                        htmlFor="subdistrict-search"
                      >
                        ตำบล
                      </label>
                      <PrimaryAutoComplete
                        id="subdistrict-search"
                        value={selectedSubDistrictId || ""}
                        options={(subDistricts || []).map((s: any) => ({
                          label: s.name_th,
                          value: s.id,
                        }))}
                        onChange={(value) => {
                          const v = value as number | "";
                          const id = v === "" ? null : Number(v);
                          setSelectedSubDistrictId(id);
                        }}
                        placeholder="เลือกตำบล"
                        disabled={!selectedDistrictId}
                      />
                    </div>
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

                <div className="mt-3 flex justify-between gap-3">
                  <PrimaryButton
                    label="อยู่ระหว่างการตรวจประเมิน"
                    fullWidth
                    color={
                      currentTab === "in-progress" ? "success" : "secondary"
                    }
                    onClick={() => handleTabChange("in-progress")}
                  />
                  <PrimaryButton
                    label="ตรวจประเมินเสร็จแล้ว"
                    fullWidth
                    color={currentTab === "completed" ? "success" : "secondary"}
                    onClick={() => handleTabChange("completed")}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <PrimaryDataTable
                  value={items}
                  columns={columns}
                  loading={loading}
                  paginator
                  rows={lazyParams.rows}
                  rowsPerPageOptions={[10, 25, 50]}
                  totalRecords={totalRecords}
                  lazy
                  onPage={handlePageChange}
                  first={lazyParams.first}
                  sortMode="multiple"
                  multiSortMeta={lazyParams.multiSortMeta}
                  onSort={handleSort}
                  dataKey="inspectionId"
                  rowClassName={(data: any) =>
                    selectedInspection?.inspectionId === data.inspectionId
                      ? "bg-green-50 cursor-pointer"
                      : "cursor-pointer"
                  }
                  onRowClick={(e) => setSelectedInspection(e.data)}
                />

                <div className="mt-4 flex justify-end gap-2">
                  <PrimaryButton
                    label="ถัดไป"
                    onClick={() => {
                      if (selectedInspection) nextStep();
                    }}
                    disabled={!selectedInspection}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">แผนที่ตั้งสวน</h4>
                  <div className="w-full">
                    <DynamicMapViewer
                      location={selectedInspection?.rubberFarm?.location}
                      height="400px"
                      width="100%"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    1. พันธุ์ยางพาราที่ปลูก
                  </h4>

                  {plantingDetails.map((detail, index) => (
                    <div key={detail.id} className="p-3 border rounded-md mb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label
                            htmlFor={`specie-${detail.id}`}
                            className="block text-sm text-gray-600 mb-1"
                          >
                            พันธุ์ยางพารา
                          </label>
                          <PrimaryAutoComplete
                            id={`specie-${detail.id}`}
                            name={`specie-${detail.id}`}
                            value={detail.specie}
                            options={rubberSpeciesOptions}
                            onChange={(value) =>
                              updatePlantingDetail(detail.id, "specie", value)
                            }
                            placeholder="เลือกพันธุ์ยางพารา"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`spacing-${detail.id}`}
                            className="block text-sm text-gray-600 mb-1"
                          >
                            ระยะปลูก (เมตร)
                          </label>
                          <PrimaryInputNumber
                            id={`spacing-${detail.id}`}
                            name={`spacing-${detail.id}`}
                            value={detail.spacing}
                            onChange={(v) =>
                              updatePlantingDetail(detail.id, "spacing", v)
                            }
                            min={0}
                            max={100000}
                            placeholder="ระยะปลูก (เมตร)"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`numberOfTrees-${detail.id}`}
                            className="block text-sm text-gray-600 mb-1"
                          >
                            จำนวนต้น
                          </label>
                          <PrimaryInputNumber
                            id={`numberOfTrees-${detail.id}`}
                            name={`numberOfTrees-${detail.id}`}
                            value={detail.numberOfTrees}
                            onChange={(v) =>
                              updatePlantingDetail(
                                detail.id,
                                "numberOfTrees",
                                v
                              )
                            }
                            min={0}
                            max={100000}
                            placeholder="จำนวนต้น"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`plantingDate-${detail.id}`}
                            className="block text-sm text-gray-600 mb-1"
                          >
                            วันที่ปลูก
                          </label>
                          <PrimaryCalendar
                            id={`plantingDate-${detail.id}`}
                            value={detail.plantingDate}
                            onChange={(d) =>
                              updatePlantingDetail(detail.id, "plantingDate", d)
                            }
                            placeholder="เลือกวันที่ปลูก"
                          />
                        </div>
                      </div>

                      <div className="mt-2 flex justify-end">
                        {plantingDetails.length > 1 && (
                          <PrimaryButton
                            label="ลบรายการ"
                            icon="pi pi-trash"
                            color="danger"
                            variant="outlined"
                            size="small"
                            onClick={() => removePlantingDetail(detail.id)}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="mt-2 flex justify-end">
                    <PrimaryButton
                      label="เพิ่มรายการปลูก"
                      icon="pi pi-plus"
                      color="success"
                      onClick={addPlantingDetail}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    2. ระบบการให้น้ำ
                  </h4>
                  <div className="p-3 border rounded-md mb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                      <div className="flex justify-between items-start">
                        <PrimaryCheckbox
                          checked={waterSystemHas === false}
                          label="ไม่มี"
                          onChange={(_checked: boolean) => {
                            setWaterSystemHas(false);
                            setWaterSystemDetails("");
                          }}
                        />
                        <PrimaryCheckbox
                          checked={waterSystemHas === true}
                          label="มี"
                          onChange={(_checked: boolean) => {
                            setWaterSystemHas(true);
                          }}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={"water-system-details"}
                          className="block text-sm text-gray-600 mb-1"
                        >
                          ระบุ
                        </label>
                        <PrimaryInputTextarea
                          id={"water-system-details"}
                          value={waterSystemDetails}
                          onChange={(v: string) => setWaterSystemDetails(v)}
                          rows={5}
                          maxLength={255}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          placeholder="ระบุรายละเอียดระบบการให้น้ำ"
                          disabled={waterSystemHas !== true}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    3. การใช้ปุ๋ย/สารปรับปรุงดิน
                  </h4>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    4. ประวัติการใช้พื้นที่การผลิต ย้อนหลัง 2 ปี
                  </h4>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    5. การแพร่ระบาดของศัตรูพืช/โรค/อาการผิดปกติ และการจัดการ
                  </h4>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    6. ชนิดของพืชที่ปลูกข้างเคียงสวนยาง
                  </h4>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    7. ข้อมูลอื่น ๆ (เช่น ชนิดพืชร่วม พืชแซม ฯลฯ)
                  </h4>
                </div>

                <div className="flex justify-between gap-2">
                  <PrimaryButton
                    label="ย้อนกลับ"
                    color="secondary"
                    onClick={() => prevStep()}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuditorLayout>
  );
}
