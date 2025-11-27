"use client";

import { StepIndicator } from "@/components/farmer/StepIndicator";
import AuditorLayout from "@/components/layout/AuditorLayout";
import PrimaryAutoComplete from "@/components/ui/PrimaryAutoComplete";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";
import thaiProvinceData from "@/data/thai-provinces.json";
import { useAuditorGardenData } from "@/hooks/useAuditorGardenData";
import { useFormStepper } from "@/hooks/useFormStepper";
import { CONTAINER, HEADER, SPACING } from "@/styles/auditorClasses";
import { useMemo, useState } from "react";

export default function Page() {
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
                <p className="text-sm text-gray-600">
                  หน้าสำหรับบันทึกข้อมูลประจำสวนยางยังไม่ถูกสร้าง
                </p>
                <div className="mt-4 flex justify-between gap-2">
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
