"use client";

import { StepIndicator } from "@/components/farmer/StepIndicator";
import AuditorLayout from "@/components/layout/AuditorLayout";
import PrimaryAutoComplete from "@/components/ui/PrimaryAutoComplete";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";
import PrimaryInputText from "@/components/ui/PrimaryInputText";
import thaiProvinceData from "@/data/thai-provinces.json";
import { useAuditorConsultations } from "@/hooks/useAuditorConsultations";
import { useFormStepper } from "@/hooks/useFormStepper";
import { CONTAINER, HEADER, SPACING } from "@/styles/auditorClasses";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

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
    createAdviceAndDefect,
    updateAdviceAndDefect,
    savingAdviceAndDefect,
  } = useAuditorConsultations(10);

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

  // recordDate (step 2 - common)
  const [recordDate, setRecordDate] = useState<Date | null>(null);

  // adviceList (step 2 - section 1)
  const [adviceList, setAdviceList] = useState<
    Array<{
      id: string;
      // รายการให้คำปรึกษา
      adviceItem: string;
      // แนวทางการแก้ไข
      recommendation: string;
      // กำหนดระยะเวลา
      time: Date | null;
    }>
  >([
    {
      id: genId(),
      adviceItem: "",
      recommendation: "",
      time: null,
    },
  ]);

  const updateAdviceItem = (id: string, field: string, value: any) => {
    setAdviceList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addAdviceItem = () =>
    setAdviceList((prev) => [
      ...prev,
      {
        id: genId(),
        adviceItem: "",
        recommendation: "",
        time: null,
      },
    ]);

  const removeAdviceItem = (id: string) =>
    setAdviceList((prev) => prev.filter((p) => p.id !== id));

  // defectList (step 2 - section 2)
  const [defectList, setDefectList] = useState<
    Array<{
      id: string;
      // ข้อบกพร่องที่พบ
      defectItem: string;
      // รายละเอียดข้อบกพร่อง
      defectDetail: string;
      // กำหนดระยะเวลาแก้ไข
      time: Date | null;
    }>
  >([
    {
      id: genId(),
      defectItem: "",
      defectDetail: "",
      time: null,
    },
  ]);

  const updateDefectItem = (id: string, field: string, value: any) => {
    setDefectList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addDefectItem = () =>
    setDefectList((prev) => [
      ...prev,
      {
        id: genId(),
        defectItem: "",
        defectDetail: "",
        time: null,
      },
    ]);

  const removeDefectItem = (id: string) =>
    setDefectList((prev) => prev.filter((p) => p.id !== id));

  // adviceAndDefectId/version for optimistic update
  const [adviceAndDefectId, setAdviceAndDefectId] = useState<number | null>(
    null
  );
  const [adviceAndDefectVersion, setAdviceAndDefectVersion] = useState<
    number | undefined
  >(undefined);

  const handleTabChange = (value: string) => {
    onTabChange("inspectionTab", value);
    setSelectedInspection(null);
  };

  // initialize form state when a selected inspection has an existing adviceAndDefect
  useEffect(() => {
    const ad = selectedInspection?.adviceAndDefect;
    if (ad) {
      // populate from existing record
      try {
        setRecordDate(ad.date ? new Date(ad.date) : null);

        // adviceList
        if (Array.isArray(ad.adviceList) && ad.adviceList.length) {
          setAdviceList(
            ad.adviceList.map((item: any) => ({
              id: genId(),
              adviceItem: item.adviceItem || "",
              recommendation: item.recommendation || "",
              time: item.time ? new Date(item.time) : null,
            }))
          );
        } else {
          setAdviceList([
            {
              id: genId(),
              adviceItem: "",
              recommendation: "",
              time: null,
            },
          ]);
        }

        // defectList
        if (Array.isArray(ad.defectList) && ad.defectList.length) {
          setDefectList(
            ad.defectList.map((item: any) => ({
              id: genId(),
              defectItem: item.defectItem || "",
              defectDetail: item.defectDetail || "",
              time: item.time ? new Date(item.time) : null,
            }))
          );
        } else {
          setDefectList([
            {
              id: genId(),
              defectItem: "",
              defectDetail: "",
              time: null,
            },
          ]);
        }

        setAdviceAndDefectId(ad.adviceAndDefectId ?? null);
        setAdviceAndDefectVersion(ad.version ?? undefined);
      } catch (e) {
        console.error("Failed to populate advice and defect to form", e);
      }
    } else {
      // reset form to defaults when no existing adviceAndDefect
      setRecordDate(null);
      setAdviceList([
        {
          id: genId(),
          adviceItem: "",
          recommendation: "",
          time: null,
        },
      ]);
      setDefectList([
        {
          id: genId(),
          defectItem: "",
          defectDetail: "",
          time: null,
        },
      ]);
      setAdviceAndDefectId(null);
      setAdviceAndDefectVersion(undefined);
    }
  }, [selectedInspection]);

  // build payload for API from local form state
  const buildPayload = useCallback(() => {
    return {
      inspectionId: selectedInspection?.inspectionId,
      date: recordDate || new Date(),
      adviceList: adviceList.map((item) => ({
        adviceItem: item.adviceItem,
        recommendation: item.recommendation,
        time: item.time ? item.time.toISOString() : null,
      })),
      defectList: defectList.map((item) => ({
        defectItem: item.defectItem,
        defectDetail: item.defectDetail,
        time: item.time ? item.time.toISOString() : null,
      })),
    };
  }, [selectedInspection, recordDate, adviceList, defectList]);

  const handleSave = async () => {
    if (!selectedInspection) {
      return toast.error("ไม่มีการตรวจที่เลือก");
    }

    if (savingAdviceAndDefect) return;

    const payload = buildPayload();
    try {
      if (adviceAndDefectId) {
        // Update existing
        const updatePayload: any = { ...payload };
        if (adviceAndDefectVersion !== undefined) {
          updatePayload.version = adviceAndDefectVersion;
        }
        const res = await updateAdviceAndDefect(
          adviceAndDefectId,
          updatePayload
        );
        toast.success("บันทึกข้อมูลเรียบร้อย");
        setAdviceAndDefectId(res?.adviceAndDefectId ?? adviceAndDefectId);
        setAdviceAndDefectVersion(res?.version ?? adviceAndDefectVersion);
        setSelectedInspection((prev) =>
          prev ? { ...prev, adviceAndDefect: res } : prev
        );
      } else {
        // Create new
        const res = await createAdviceAndDefect(payload);
        toast.success("สร้างข้อมูลเรียบร้อย");
        setAdviceAndDefectId(res?.adviceAndDefectId ?? null);
        setAdviceAndDefectVersion(res?.version ?? undefined);
        setSelectedInspection((prev) =>
          prev ? { ...prev, adviceAndDefect: res } : prev
        );
      }
    } catch (e) {
      console.error("save advice and defect error", e);
      if ((e as any)?.message === "__BUSY__") return;
      const msg = (e as any)?.message || "บันทึกข้อมูลไม่สำเร็จ";
      toast.error(msg);
    }
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
        body: (r: any) => {
          const f = r.rubberFarm;
          const v = (val: any) =>
            (val || val === 0) && val !== "-" && val !== "" ? val : null;
          return (
            <span>
              {[
                v(f?.villageName),
                v(f?.moo) ? `หมู่ ${f.moo}` : null,
                v(f?.road),
                v(f?.alley),
                v(f?.subDistrict) ? `ต.${f.subDistrict}` : null,
                v(f?.district) ? `อ.${f.district}` : null,
                v(f?.province) ? `จ.${f.province}` : null,
              ]
                .filter(Boolean)
                .join(" ") || "-"}
            </span>
          );
        },
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
          <h1 className={HEADER.title}>บันทึกการให้คำปรึกษาและข้อบกพร่อง</h1>
          <p className={HEADER.subtitle}>
            บันทึกรายละเอียดคำแนะนำและข้อบกพร่องที่พบระหว่างการตรวจ
          </p>
        </div>

        <div className={SPACING.mb6}>
          <StepIndicator
            currentStep={step}
            maxSteps={2}
            stepLabels={[
              "เลือกการตรวจประเมิน",
              "บันทึกการให้คำปรึกษาและข้อบกพร่อง",
            ]}
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
                        อำเภอ/เขต
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
                        placeholder="เลือกอำเภอ/เขต"
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
                        ตำบล/แขวง
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
                        placeholder="เลือกตำบล/แขวง"
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
                  <label
                    className="block text-sm text-gray-600 mb-2"
                    htmlFor="recordDate"
                  >
                    วันที่บันทึกข้อมูล
                  </label>
                  <PrimaryCalendar
                    id="recordDate"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e)}
                    placeholder="เลือกวันที่บันทึกข้อมูล"
                  />
                </div>

                {/* Section 1: Advice List */}
                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    1. แบบบันทึกคำแนะนำการให้คำปรึกษา
                  </h4>

                  {adviceList.map((advice) => (
                    <div key={advice.id} className="p-3 border rounded-md mb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-3">
                        <div>
                          <label
                            className="block text-sm text-gray-600 mb-1"
                            htmlFor={`advice-item-${advice.id}`}
                          >
                            รายการให้คำปรึกษา
                          </label>
                          <PrimaryInputText
                            id={`advice-item-${advice.id}`}
                            value={advice.adviceItem}
                            onChange={(e) =>
                              updateAdviceItem(advice.id, "adviceItem", e)
                            }
                            placeholder="ระบุรายการให้คำปรึกษา"
                          />
                        </div>

                        <div>
                          <label
                            className="block text-sm text-gray-600 mb-1"
                            htmlFor={`advice-recommendation-${advice.id}`}
                          >
                            แนวทางการแก้ไข
                          </label>
                          <PrimaryInputText
                            id={`advice-recommendation-${advice.id}`}
                            value={advice.recommendation}
                            onChange={(e) =>
                              updateAdviceItem(advice.id, "recommendation", e)
                            }
                            placeholder="ระบุแนวทางการแก้ไข"
                          />
                        </div>

                        <div>
                          <label
                            className="block text-sm text-gray-600 mb-1"
                            htmlFor={`advice-time-${advice.id}`}
                          >
                            กำหนดระยะเวลา
                          </label>
                          <PrimaryCalendar
                            id={`advice-time-${advice.id}`}
                            value={advice.time}
                            onChange={(e) =>
                              updateAdviceItem(advice.id, "time", e)
                            }
                            placeholder="เลือกวันที่"
                          />
                        </div>
                      </div>

                      {adviceList.length > 1 && (
                        <div className="mt-2 flex justify-end">
                          <PrimaryButton
                            label="ลบรายการ"
                            icon="pi pi-trash"
                            color="danger"
                            variant="outlined"
                            size="small"
                            onClick={() => removeAdviceItem(advice.id)}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <PrimaryButton
                      label="เพิ่มรายการคำปรึกษา"
                      icon="pi pi-plus"
                      color="success"
                      onClick={addAdviceItem}
                    />
                  </div>
                </div>

                {/* Section 2: Defect List */}
                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    2. แบบบันทึกข้อบกพร่อง
                  </h4>

                  {defectList.map((defect) => (
                    <div key={defect.id} className="p-3 border rounded-md mb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-3">
                        <div>
                          <label
                            className="block text-sm text-gray-600 mb-1"
                            htmlFor={`defect-item-${defect.id}`}
                          >
                            ข้อบกพร่องที่พบ
                          </label>
                          <PrimaryInputText
                            id={`defect-item-${defect.id}`}
                            value={defect.defectItem}
                            onChange={(e) =>
                              updateDefectItem(defect.id, "defectItem", e)
                            }
                            placeholder="ระบุข้อบกพร่องที่พบ"
                          />
                        </div>

                        <div>
                          <label
                            className="block text-sm text-gray-600 mb-1"
                            htmlFor={`defect-detail-${defect.id}`}
                          >
                            รายละเอียดข้อบกพร่อง
                          </label>
                          <PrimaryInputText
                            id={`defect-detail-${defect.id}`}
                            value={defect.defectDetail}
                            onChange={(e) =>
                              updateDefectItem(defect.id, "defectDetail", e)
                            }
                            placeholder="ระบุรายละเอียด"
                          />
                        </div>

                        <div>
                          <label
                            className="block text-sm text-gray-600 mb-1"
                            htmlFor={`defect-time-${defect.id}`}
                          >
                            กำหนดระยะเวลาแก้ไข
                          </label>
                          <PrimaryCalendar
                            id={`defect-time-${defect.id}`}
                            value={defect.time}
                            onChange={(e) =>
                              updateDefectItem(defect.id, "time", e)
                            }
                            placeholder="เลือกวันที่"
                          />
                        </div>
                      </div>

                      {defectList.length > 1 && (
                        <div className="mt-2 flex justify-end">
                          <PrimaryButton
                            label="ลบรายการ"
                            icon="pi pi-trash"
                            color="danger"
                            variant="outlined"
                            size="small"
                            onClick={() => removeDefectItem(defect.id)}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <PrimaryButton
                      label="เพิ่มรายการข้อบกพร่อง"
                      icon="pi pi-plus"
                      color="success"
                      onClick={addDefectItem}
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-2">
                  <PrimaryButton
                    label="ย้อนกลับ"
                    color="secondary"
                    onClick={() => prevStep()}
                    disabled={savingAdviceAndDefect}
                  />
                  <PrimaryButton
                    label="บันทึกข้อมูล"
                    onClick={handleSave}
                    loading={savingAdviceAndDefect}
                    disabled={savingAdviceAndDefect || !selectedInspection}
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
