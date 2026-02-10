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
import PrimaryInputText from "@/components/ui/PrimaryInputText";
import PrimaryInputTextarea from "@/components/ui/PrimaryInputTextarea";
import thaiProvinceData from "@/data/thai-provinces.json";
import { useAuditorGardenData } from "@/hooks/useAuditorGardenData";
import { useFormStepper } from "@/hooks/useFormStepper";
import { CONTAINER, HEADER, SPACING } from "@/styles/auditorClasses";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const rubberSpeciesOptions = [
  { label: "BPM 1", value: "BPM 1" },
  { label: "BPM 24", value: "BPM 24" },
  { label: "GT 1", value: "GT 1" },
  { label: "GT 1 / R.600", value: "GT 1 / R.600" },
  { label: "Haiken 2", value: "Haiken 2" },
  { label: "JVP80", value: "JVP80" },
  { label: "KRS 156", value: "KRS 156" },
  { label: "KRS 226", value: "KRS 226" },
  { label: "KRS 250", value: "KRS 250" },
  { label: "KRS 251", value: "KRS 251" },
  { label: "MIXED", value: "MIXED" },
  { label: "PB 217", value: "PB 217" },
  { label: "PB 235", value: "PB 235" },
  { label: "PB 255", value: "PB 255" },
  { label: "PB 260", value: "PB 260" },
  { label: "PB 28/59", value: "PB 28/59" },
  { label: "PB 311", value: "PB 311" },
  { label: "PB 5/51", value: "PB 5/51" },
  { label: "PR 255", value: "PR 255" },
  { label: "PR 261", value: "PR 261" },
  { label: "PR 302", value: "PR 302" },
  { label: "PR 305", value: "PR 305" },
  { label: "RRIC 100", value: "RRIC 100" },
  { label: "RRIC 121", value: "RRIC 121" },
  { label: "RRIM 501", value: "RRIM 501" },
  { label: "RRIM 600", value: "RRIM 600" },
  { label: "RRIM 628", value: "RRIM 628" },
  { label: "RRIM 703", value: "RRIM 703" },
  { label: "RRIM 3001", value: "RRIM 3001" },
  { label: "RRIT 209", value: "RRIT 209" },
  { label: "RRIT 214", value: "RRIT 214" },
  { label: "RRIT 218", value: "RRIT 218" },
  { label: "RRIT 225", value: "RRIT 225" },
  { label: "RRIT 226", value: "RRIT 226" },
  { label: "RRIT 240", value: "RRIT 240" },
  { label: "RRIT 250", value: "RRIT 250" },
  { label: "RRIT 251", value: "RRIT 251" },
  { label: "RRIT 312", value: "RRIT 312" },
  { label: "RRIT 325", value: "RRIT 325" },
  { label: "RRIT 3601", value: "RRIT 3601" },
  { label: "RRIT 3904", value: "RRIT 3904" },
  { label: "RRIT 402(ฉะเชิงเทรา)", value: "RRIT 402(ฉะเชิงเทรา)" },
  { label: "RRIT 408", value: "RRIT 408" },
  { label: "จำแนกไม่ได้", value: "จำแนกไม่ได้" },
  { label: "พื้นเมือง", value: "พื้นเมือง" },
  { label: "สงขลา 36", value: "สงขลา 36" },
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
    createDataRecord,
    updateDataRecord,
    savingDataRecord,
  } = useAuditorGardenData(10);

  const [selectedInspection, setSelectedInspection] = useState<Record<
    string,
    any
  > | null>(null);

  // data record id/version for optimistic update
  const [dataRecordId, setDataRecordId] = useState<number | null>(null);
  const [dataRecordVersion, setDataRecordVersion] = useState<
    number | undefined
  >(undefined);

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

  // map location state (GeoJSON)
  const [mapLocation, setMapLocation] = useState<any>(null);

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

  // Fertilizer usage state (step 2 - section 3)
  // ปุ๋ยเคมี
  const [chemicalFertilizers, setChemicalFertilizers] = useState<
    Array<{
      id: string;
      formula: string;
      rate: string;
      frequencyPerYear: string;
    }>
  >([{ id: genId(), formula: "", rate: "", frequencyPerYear: "" }]);

  // ปุ๋ยอินทรีย์/น้ำหมัก
  const [organicFertilizers, setOrganicFertilizers] = useState<
    Array<{
      id: string;
      formula: string;
      rate: string;
      frequencyPerYear: string;
    }>
  >([{ id: genId(), formula: "", rate: "", frequencyPerYear: "" }]);

  //อื่นๆ
  const [otherFertilizers, setOtherFertilizers] = useState<
    Array<{
      id: string;
      formula: string;
      rate: string;
      frequencyPerYear: string;
    }>
  >([{ id: genId(), formula: "", rate: "", frequencyPerYear: "" }]);

  // Fertilizer handlers
  const updateChemicalFertilizer = (id: string, field: string, value: any) => {
    setChemicalFertilizers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addChemicalFertilizer = () =>
    setChemicalFertilizers((prev) => [
      ...prev,
      { id: genId(), formula: "", rate: "", frequencyPerYear: "" },
    ]);

  const removeChemicalFertilizer = (id: string) =>
    setChemicalFertilizers((prev) => prev.filter((p) => p.id !== id));

  const updateOrganicFertilizer = (id: string, field: string, value: any) => {
    setOrganicFertilizers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addOrganicFertilizer = () =>
    setOrganicFertilizers((prev) => [
      ...prev,
      { id: genId(), formula: "", rate: "", frequencyPerYear: "" },
    ]);

  const removeOrganicFertilizer = (id: string) =>
    setOrganicFertilizers((prev) => prev.filter((p) => p.id !== id));

  const updateOtherFertilizer = (id: string, field: string, value: any) => {
    setOtherFertilizers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addOtherFertilizer = () =>
    setOtherFertilizers((prev) => [
      ...prev,
      { id: genId(), formula: "", rate: "", frequencyPerYear: "" },
    ]);

  const removeOtherFertilizer = (id: string) =>
    setOtherFertilizers((prev) => prev.filter((p) => p.id !== id));

  // previouslyCultivated (step 2 - section 4)
  const [previouslyNeverUsed, setPreviouslyNeverUsed] =
    useState<boolean>(false);
  const [previouslyUsed, setPreviouslyUsed] = useState<boolean>(false);
  const [previousCropsYear1, setPreviousCropsYear1] = useState<string>("");
  const [previousCropsYear2, setPreviousCropsYear2] = useState<string>("");

  // plantDiseases (step 2 - section 5)
  const [plantDiseases, setPlantDiseases] = useState<
    Array<{
      id: string;
      name: string;
      outbreakPeriod: string;
      preventionAndControl: string;
    }>
  >([{ id: genId(), name: "", outbreakPeriod: "", preventionAndControl: "" }]);

  const updatePlantDisease = (id: string, field: string, value: any) => {
    setPlantDiseases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addPlantDisease = () =>
    setPlantDiseases((prev) => [
      ...prev,
      { id: genId(), name: "", outbreakPeriod: "", preventionAndControl: "" },
    ]);

  const removePlantDisease = (id: string) =>
    setPlantDiseases((prev) => prev.filter((p) => p.id !== id));

  // relatedPlants (step 2 - section 6)
  const [relatedPlantHasnot, setRelatedPlantHasnot] = useState<boolean>(false);
  const [relatedPlantHas, setRelatedPlantHas] = useState<boolean>(false);
  const [relatedPlants, setRelatedPlants] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >([{ id: genId(), name: "" }]);

  const updateRelatedPlant = (id: string, value: string) => {
    setRelatedPlants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: value } : p))
    );
  };

  const addRelatedPlant = () =>
    setRelatedPlants((prev) => [...prev, { id: genId(), name: "" }]);

  const removeRelatedPlant = (id: string) =>
    setRelatedPlants((prev) => prev.filter((p) => p.id !== id));

  // moreInfo (step 2 - section 7)
  const [moreInfo, setMoreInfo] = useState<string>("");

  const handleTabChange = (value: string) => {
    onTabChange("inspectionTab", value);
    setSelectedInspection(null);
  };

  // initialize form state when a selected inspection has an existing dataRecord
  useEffect(() => {
    const dr = selectedInspection?.dataRecord;
    if (dr) {
      // species -> plantingDetails
      try {
        const species = dr.species || {};
        if (Array.isArray(species.plantingDetails)) {
          setPlantingDetails(
            species.plantingDetails.map((p: any) => ({
              id: genId(),
              specie: p.specie || "",
              spacing: p.spacing ?? null,
              numberOfTrees: p.numberOfTrees ?? null,
              plantingDate: p.plantingDate ? new Date(p.plantingDate) : null,
            }))
          );
        }

        // water system
        const ws = dr.waterSystem || {};
        setWaterSystemHas(ws.has ?? null);
        setWaterSystemDetails(ws.details || "");

        // fertilizers
        const fert = dr.fertilizers || {};
        setChemicalFertilizers(
          Array.isArray(fert.chemical) && fert.chemical.length
            ? fert.chemical.map((f: any) => ({ id: genId(), ...f }))
            : [{ id: genId(), formula: "", rate: "", frequencyPerYear: "" }]
        );
        setOrganicFertilizers(
          Array.isArray(fert.organic) && fert.organic.length
            ? fert.organic.map((f: any) => ({ id: genId(), ...f }))
            : [{ id: genId(), formula: "", rate: "", frequencyPerYear: "" }]
        );
        setOtherFertilizers(
          Array.isArray(fert.other) && fert.other.length
            ? fert.other.map((f: any) => ({ id: genId(), ...f }))
            : [{ id: genId(), formula: "", rate: "", frequencyPerYear: "" }]
        );

        // previouslyCultivated
        const pc = dr.previouslyCultivated || {};
        setPreviouslyNeverUsed(!!pc.neverUsed);
        setPreviouslyUsed(!!pc.used);
        setPreviousCropsYear1(pc.year1 || "");
        setPreviousCropsYear2(pc.year2 || "");

        // plant diseases
        const pd = dr.plantDisease || [];
        setPlantDiseases(
          Array.isArray(pd) && pd.length
            ? pd.map((d: any) => ({ id: genId(), ...d }))
            : [
              {
                id: genId(),
                name: "",
                outbreakPeriod: "",
                preventionAndControl: "",
              },
            ]
        );

        // related plants
        const rp = Array.isArray(dr.relatedPlants) ? dr.relatedPlants : [];
        const hasRelatedPlants = rp.some(
          (r: any) => typeof r?.name === "string" && r.name.trim() !== ""
        );
        if (hasRelatedPlants) {
          setRelatedPlantHas(true);
          setRelatedPlantHasnot(false);
          setRelatedPlants(
            rp
              .filter(
                (r: any) => typeof r?.name === "string" && r.name.trim() !== ""
              )
              .map((r: any) => ({ id: genId(), name: r.name || "" }))
          );
        } else {
          setRelatedPlantHas(false);
          setRelatedPlantHasnot(true);
          setRelatedPlants([{ id: genId(), name: "" }]);
        }

        // more info
        setMoreInfo(dr.moreInfo || "");

        setDataRecordId(dr.dataRecordId ?? null);
        setDataRecordVersion(dr.version ?? undefined);
        // prefer stored map in dataRecord, otherwise use the inspection rubberFarm location
        // Check if dr.map is empty object or falsy
        const hasValidMap =
          dr.map &&
          typeof dr.map === "object" &&
          Object.keys(dr.map).length > 0;
        setMapLocation(
          hasValidMap
            ? dr.map
            : selectedInspection?.rubberFarm?.location ?? null
        );
      } catch (e) {
        console.error("Failed to populate data record to form", e);
      }
    } else {
      // reset form to defaults when no existing dataRecord
      setPlantingDetails([
        {
          id: genId(),
          specie: "",
          spacing: null,
          numberOfTrees: null,
          plantingDate: null,
        },
      ]);
      setWaterSystemHas(null);
      setWaterSystemDetails("");
      setChemicalFertilizers([
        { id: genId(), formula: "", rate: "", frequencyPerYear: "" },
      ]);
      setOrganicFertilizers([
        { id: genId(), formula: "", rate: "", frequencyPerYear: "" },
      ]);
      setOtherFertilizers([
        { id: genId(), formula: "", rate: "", frequencyPerYear: "" },
      ]);
      setPreviouslyNeverUsed(false);
      setPreviouslyUsed(false);
      setPreviousCropsYear1("");
      setPreviousCropsYear2("");
      setPlantDiseases([
        { id: genId(), name: "", outbreakPeriod: "", preventionAndControl: "" },
      ]);
      setRelatedPlantHas(false);
      setRelatedPlantHasnot(false);
      setRelatedPlants([{ id: genId(), name: "" }]);
      setMoreInfo("");
      setDataRecordId(null);
      setDataRecordVersion(undefined);
      setMapLocation(selectedInspection?.rubberFarm?.location ?? null);
    }
  }, [selectedInspection]);

  // build payload for API from local form state
  const buildPayload = useCallback(() => {
    const payloadRelatedPlants = relatedPlantHas
      ? relatedPlants
          .map((r) => ({ name: (r.name || "").trim() }))
          .filter((r) => r.name !== "")
      : [];

    return {
      inspectionId: selectedInspection?.inspectionId,
      species: {
        plantingDetails: plantingDetails.map((p) => ({
          specie: p.specie,
          spacing: p.spacing,
          numberOfTrees: p.numberOfTrees,
          plantingDate: p.plantingDate ? p.plantingDate.toISOString() : null,
        })),
      },
      waterSystem: { has: waterSystemHas, details: waterSystemDetails },
      fertilizers: {
        chemical: chemicalFertilizers.map((f) => ({
          formula: f.formula,
          rate: f.rate,
          frequencyPerYear: f.frequencyPerYear,
        })),
        organic: organicFertilizers.map((f) => ({
          formula: f.formula,
          rate: f.rate,
          frequencyPerYear: f.frequencyPerYear,
        })),
        other: otherFertilizers.map((f) => ({
          formula: f.formula,
          rate: f.rate,
          frequencyPerYear: f.frequencyPerYear,
        })),
      },
      previouslyCultivated: {
        neverUsed: previouslyNeverUsed,
        used: previouslyUsed,
        year1: previousCropsYear1,
        year2: previousCropsYear2,
      },
      plantDisease: plantDiseases.map((d) => ({
        name: d.name,
        outbreakPeriod: d.outbreakPeriod,
        preventionAndControl: d.preventionAndControl,
      })),
      relatedPlants: payloadRelatedPlants,
      moreInfo,
      map: mapLocation ?? selectedInspection?.rubberFarm?.location ?? {},
    };
  }, [
    selectedInspection,
    plantingDetails,
    mapLocation,
    waterSystemHas,
    waterSystemDetails,
    chemicalFertilizers,
    organicFertilizers,
    otherFertilizers,
    previouslyNeverUsed,
    previouslyUsed,
    previousCropsYear1,
    previousCropsYear2,
    plantDiseases,
    relatedPlantHas,
    relatedPlants,
    moreInfo,
  ]);

  const handleSave = async () => {
    if (!selectedInspection) return toast.error("ไม่มีการตรวจที่เลือก");
    if (savingDataRecord) return;
    const payload = buildPayload();
    try {
      if (dataRecordId) {
        const updatePayload: any = { ...payload };
        if (dataRecordVersion !== undefined)
          updatePayload.version = dataRecordVersion;
        const res = await updateDataRecord(dataRecordId, updatePayload);
        toast.success("บันทึกข้อมูลเรียบร้อย");
        setDataRecordId(res?.dataRecordId ?? dataRecordId);
        setDataRecordVersion(res?.version ?? dataRecordVersion);
        setSelectedInspection((prev) =>
          prev ? { ...prev, dataRecord: res } : prev
        );
      } else {
        const res = await createDataRecord(payload);
        toast.success("สร้างข้อมูลเรียบร้อย");
        setDataRecordId(res?.dataRecordId ?? null);
        setDataRecordVersion(res?.version ?? undefined);
        setSelectedInspection((prev) =>
          prev ? { ...prev, dataRecord: res } : prev
        );
      }
    } catch (e) {
      console.error("save data record error", e);
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
                  <h4 className="text-sm text-gray-600 mb-2">แผนที่ตั้งสวน</h4>
                  <div className="w-full">
                    <DynamicMapViewer
                      location={
                        mapLocation ?? selectedInspection?.rubberFarm?.location
                      }
                      height="400px"
                      width="100%"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    1. พันธุ์ยางพาราที่ปลูก
                  </h4>

                  {plantingDetails.map((detail) => (
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

                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">
                      ปุ๋ยเคมี
                    </h5>
                    {(chemicalFertilizers || []).map((f) => (
                      <div key={f.id} className="p-3 border rounded-md mb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label
                              htmlFor={`chem-formula-${f.id}`}
                              className="block text-sm text-gray-600 mb-1"
                            >
                              สูตร
                            </label>
                            <PrimaryInputText
                              id={`chem-formula-${f.id}`}
                              value={f.formula}
                              onChange={(v: string) =>
                                updateChemicalFertilizer(f.id, "formula", v)
                              }
                              placeholder="สูตร/ชื่อปุ๋ย"
                              maxLength={255}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`chem-rate-${f.id}`}
                              className="block text-sm text-gray-600 mb-1"
                            >
                              อัตรา
                            </label>
                            <PrimaryInputText
                              id={`chem-rate-${f.id}`}
                              value={f.rate}
                              onChange={(v: string) =>
                                updateChemicalFertilizer(f.id, "rate", v)
                              }
                              placeholder="เช่น 2 กก./ไร่ หรือ 200 ก./ต้น"
                              maxLength={255}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`chem-freq-${f.id}`}
                              className="block text-sm text-gray-600 mb-1"
                            >
                              จำนวน
                            </label>
                            <PrimaryInputText
                              id={`chem-freq-${f.id}`}
                              value={f.frequencyPerYear}
                              onChange={(v: string) =>
                                updateChemicalFertilizer(
                                  f.id,
                                  "frequencyPerYear",
                                  v
                                )
                              }
                              placeholder="ครั้ง/ปี"
                              maxLength={255}
                            />
                          </div>
                        </div>

                        <div className="mt-2 flex justify-end">
                          {chemicalFertilizers.length > 1 && (
                            <PrimaryButton
                              label="ลบ"
                              icon="pi pi-trash"
                              color="danger"
                              variant="outlined"
                              size="small"
                              onClick={() => removeChemicalFertilizer(f.id)}
                            />
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end">
                      <PrimaryButton
                        label="เพิ่มปุ๋ยเคมี"
                        icon="pi pi-plus"
                        color="success"
                        onClick={addChemicalFertilizer}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">
                      ปุ๋ยอินทรีย์ / น้ำหมัก
                    </h5>
                    {(organicFertilizers || []).map((f) => (
                      <div key={f.id} className="p-3 border rounded-md mb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label
                              htmlFor={`org-formula-${f.id}`}
                              className="block text-sm text-gray-600 mb-1"
                            >
                              สูตร
                            </label>
                            <PrimaryInputText
                              id={`org-formula-${f.id}`}
                              value={f.formula}
                              onChange={(v: string) =>
                                updateOrganicFertilizer(f.id, "formula", v)
                              }
                              placeholder="เช่น ปุ๋ยคอก, น้ำหมัก"
                              maxLength={255}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`org-rate-${f.id}`}
                              className="block text-sm text-gray-600 mb-1"
                            >
                              อัตรา
                            </label>
                            <PrimaryInputText
                              id={`org-rate-${f.id}`}
                              value={f.rate}
                              onChange={(v: string) =>
                                updateOrganicFertilizer(f.id, "rate", v)
                              }
                              placeholder="เช่น 2 กก./ไร่ หรือ 200 ก./ต้น"
                              maxLength={255}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`org-freq-${f.id}`}
                              className="block text-sm text-gray-600 mb-1"
                            >
                              จำนวน
                            </label>
                            <PrimaryInputText
                              id={`org-freq-${f.id}`}
                              value={f.frequencyPerYear}
                              onChange={(v: string) =>
                                updateOrganicFertilizer(
                                  f.id,
                                  "frequencyPerYear",
                                  v
                                )
                              }
                              placeholder="ครั้ง/ปี"
                              maxLength={255}
                            />
                          </div>
                        </div>

                        <div className="mt-2 flex justify-end">
                          {organicFertilizers.length > 1 && (
                            <PrimaryButton
                              label="ลบ"
                              icon="pi pi-trash"
                              color="danger"
                              variant="outlined"
                              size="small"
                              onClick={() => removeOrganicFertilizer(f.id)}
                            />
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end">
                      <PrimaryButton
                        label="เพิ่มปุ๋ยอินทรีย์"
                        icon="pi pi-plus"
                        color="success"
                        onClick={addOrganicFertilizer}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">
                      อื่นๆ
                    </h5>
                    {(otherFertilizers || []).map((f) => (
                      <div key={f.id} className="p-3 border rounded-md mb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label
                              htmlFor={`other-formula-${f.id}`}
                              className="block text-sm text-gray-600 mb-1"
                            >
                              สูตร
                            </label>
                            <PrimaryInputText
                              id={`other-formula-${f.id}`}
                              value={f.formula}
                              onChange={(v: string) =>
                                updateOtherFertilizer(f.id, "formula", v)
                              }
                              placeholder="ระบุรายการอื่นๆ"
                              maxLength={255}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`other-rate-${f.id}`}
                              className="block text-sm text-gray-600 mb-1"
                            >
                              อัตรา
                            </label>
                            <PrimaryInputText
                              id={`other-rate-${f.id}`}
                              value={f.rate}
                              onChange={(v: string) =>
                                updateOtherFertilizer(f.id, "rate", v)
                              }
                              placeholder="เช่น 2 กก./ไร่ หรือ 200 ก./ต้น"
                              maxLength={255}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`other-freq-${f.id}`}
                              className="block text-sm text-gray-600 mb-1"
                            >
                              จำนวน
                            </label>
                            <PrimaryInputText
                              id={`other-freq-${f.id}`}
                              value={f.frequencyPerYear}
                              onChange={(v: string) =>
                                updateOtherFertilizer(
                                  f.id,
                                  "frequencyPerYear",
                                  v
                                )
                              }
                              placeholder="ครั้ง/ปี"
                              maxLength={255}
                            />
                          </div>
                        </div>

                        <div className="mt-2 flex justify-end">
                          {otherFertilizers.length > 1 && (
                            <PrimaryButton
                              label="ลบ"
                              icon="pi pi-trash"
                              color="danger"
                              variant="outlined"
                              size="small"
                              onClick={() => removeOtherFertilizer(f.id)}
                            />
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end">
                      <PrimaryButton
                        label="เพิ่มรายการอื่นๆ"
                        icon="pi pi-plus"
                        color="success"
                        onClick={addOtherFertilizer}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    4. ประวัติการใช้พื้นที่การผลิต ย้อนหลัง 2 ปี
                  </h4>

                  <div className="p-3 border rounded-md mb-3">
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center">
                          <PrimaryCheckbox
                            checked={previouslyNeverUsed}
                            label="พื้นที่ไม่เคยใช้ประโยชน์ทางการเกษตร"
                            onChange={(checked: boolean) => {
                              setPreviouslyNeverUsed(checked);
                              if (checked) {
                                setPreviouslyUsed(false);
                                setPreviousCropsYear1("");
                                setPreviousCropsYear2("");
                              }
                            }}
                          />
                        </div>

                        <div className="flex items-center">
                          <PrimaryCheckbox
                            checked={previouslyUsed}
                            label="พื้นที่ใช้ประโยชน์ทางการเกษตร ชนิดของพืชที่เคยปลูกมาก่อน (นับถอยหลังจากปัจจุบัน)"
                            onChange={(checked: boolean) => {
                              setPreviouslyUsed(checked);
                              if (checked) setPreviouslyNeverUsed(false);
                              if (!checked) {
                                setPreviousCropsYear1("");
                                setPreviousCropsYear2("");
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="previousCropsYear1"
                            className="block text-sm text-gray-600 mb-1"
                          >
                            ปีที่ 1
                          </label>
                          <PrimaryInputText
                            value={previousCropsYear1}
                            onChange={(v: string) => setPreviousCropsYear1(v)}
                            placeholder="ระบุพืชที่ปลูกในปีที่ 1"
                            maxLength={255}
                            disabled={!previouslyUsed}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="previousCropsYear2"
                            className="block text-sm text-gray-600 mb-1"
                          >
                            ปีที่ 2
                          </label>
                          <PrimaryInputText
                            value={previousCropsYear2}
                            onChange={(v: string) => setPreviousCropsYear2(v)}
                            placeholder="ระบุพืชที่ปลูกในปีที่ 2"
                            maxLength={255}
                            disabled={!previouslyUsed}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    5. การแพร่ระบาดของศัตรูพืช/โรค/อาการผิดปกติ และการจัดการ
                  </h4>

                  {(plantDiseases || []).map((d) => (
                    <div key={d.id} className="p-3 border rounded-md mb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor={`disease-name-${d.id}`}
                            className="block text-sm text-gray-600 mb-1"
                          >
                            ชื่อศัตรูพืช/โรค/อาการ
                          </label>
                          <PrimaryInputText
                            id={`disease-name-${d.id}`}
                            value={d.name}
                            onChange={(v: string) =>
                              updatePlantDisease(d.id, "name", v)
                            }
                            placeholder="ชื่อศัตรูพืช/โรค/อาการ"
                            maxLength={255}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`disease-outbreak-${d.id}`}
                            className="block text-sm text-gray-600 mb-1"
                          >
                            ช่วงที่ระบาด
                          </label>
                          <PrimaryInputText
                            id={`disease-outbreak-${d.id}`}
                            value={d.outbreakPeriod}
                            onChange={(v: string) =>
                              updatePlantDisease(d.id, "outbreakPeriod", v)
                            }
                            placeholder="เช่น ฤดูฝน, ฤดูแล้ง"
                            maxLength={255}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label
                            htmlFor={`disease-prevent-${d.id}`}
                            className="block text-sm text-gray-600 mb-1"
                          >
                            วิธีการป้องกันและควบคุม
                          </label>
                          <PrimaryInputTextarea
                            id={`disease-prevent-${d.id}`}
                            value={d.preventionAndControl}
                            onChange={(v: string) =>
                              updatePlantDisease(
                                d.id,
                                "preventionAndControl",
                                v
                              )
                            }
                            rows={5}
                            maxLength={1000}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            placeholder="ระบุวิธีการป้องกันและการจัดการ"
                          />
                        </div>
                      </div>

                      <div className="mt-2 flex justify-end">
                        {plantDiseases.length > 1 && (
                          <PrimaryButton
                            label="ลบรายการ"
                            icon="pi pi-trash"
                            color="danger"
                            variant="outlined"
                            size="small"
                            onClick={() => removePlantDisease(d.id)}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <PrimaryButton
                      label="เพิ่มรายการ"
                      icon="pi pi-plus"
                      color="success"
                      onClick={addPlantDisease}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    6. ชนิดของพืชที่ปลูกข้างเคียงสวนยาง
                  </h4>

                  <div className="p-3 border rounded-md mb-3">
                    <div className="flex items-center gap-4 mb-3">
                      <PrimaryCheckbox
                        checked={relatedPlantHasnot}
                        label="ไม่มี"
                        onChange={() => {
                          setRelatedPlantHasnot(true);
                          setRelatedPlantHas(false);
                          setRelatedPlants([{ id: genId(), name: "" }]);
                        }}
                      />

                      <PrimaryCheckbox
                        checked={relatedPlantHas}
                        label="มี"
                        onChange={() => {
                          setRelatedPlantHas(true);
                          setRelatedPlantHasnot(false);
                          setRelatedPlants((prev) =>
                            prev.length ? prev : [{ id: genId(), name: "" }]
                          );
                        }}
                      />
                    </div>

                    {(relatedPlants || []).map((r) => (
                      <div key={r.id}>
                        <div className="grid grid-cols-1 gap-3 items-end">
                          <div>
                            <label
                              htmlFor={`related-plant-${r.id}`}
                              className="block text-sm text-gray-600 mb-1"
                            >
                              ชนิดพืช
                            </label>
                            <PrimaryInputText
                              id={`related-plant-${r.id}`}
                              value={r.name}
                              onChange={(v: string) =>
                                updateRelatedPlant(r.id, v)
                              }
                              placeholder="ระบุชนิดพืชที่ปลูกข้างเคียง"
                              maxLength={255}
                              disabled={!relatedPlantHas}
                            />
                          </div>
                        </div>

                        <div className="mt-2 flex justify-end">
                          {relatedPlants.length > 1 && (
                            <PrimaryButton
                              label="ลบรายการ"
                              icon="pi pi-trash"
                              color="danger"
                              variant="outlined"
                              size="small"
                              onClick={() => removeRelatedPlant(r.id)}
                            />
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="mt-3 flex justify-end">
                      <PrimaryButton
                        label="เพิ่มรายการ"
                        icon="pi pi-plus"
                        color="success"
                        onClick={addRelatedPlant}
                        disabled={!relatedPlantHas}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">
                    7. ข้อมูลอื่น ๆ (เช่น ชนิดพืชร่วม พืชแซม ฯลฯ)
                  </h4>

                  <div className="p-3 border rounded-md mb-3">
                    <label
                      htmlFor="more-info"
                      className="block text-sm text-gray-600 mb-1"
                    >
                      ข้อมูลเพิ่มเติม
                    </label>
                    <PrimaryInputTextarea
                      id="more-info"
                      value={moreInfo}
                      onChange={(v: string) => setMoreInfo(v)}
                      rows={5}
                      maxLength={255}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="ระบุข้อมูลอื่น ๆ เช่น ชนิดพืชร่วม พืชแซม หรือข้อมูลเพิ่มเติมอื่น ๆ"
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-2">
                  <PrimaryButton
                    label="ย้อนกลับ"
                    color="secondary"
                    onClick={() => prevStep()}
                    disabled={savingDataRecord}
                  />
                  <PrimaryButton
                    label="บันทึกข้อมูล"
                    onClick={handleSave}
                    loading={savingDataRecord}
                    disabled={savingDataRecord || !selectedInspection}
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
