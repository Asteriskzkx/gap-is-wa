import React from "react";
import { formStyles } from "@/styles/formStyles";
import {
  PrimaryAutoComplete,
  PrimaryInputNumber,
  PrimaryCalendar,
  PrimaryDropdown,
  PrimaryButton,
} from "@/components/ui";
import { PlantingDetail } from "@/hooks/useRubberFarmForm";

// ตัวเลือกพันธุ์ยางพารา
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

// ตัวเลือกเดือน
const monthOptions = [
  { label: "มกราคม", value: 0 },
  { label: "กุมภาพันธ์", value: 1 },
  { label: "มีนาคม", value: 2 },
  { label: "เมษายน", value: 3 },
  { label: "พฤษภาคม", value: 4 },
  { label: "มิถุนายน", value: 5 },
  { label: "กรกฎาคม", value: 6 },
  { label: "สิงหาคม", value: 7 },
  { label: "กันยายน", value: 8 },
  { label: "ตุลาคม", value: 9 },
  { label: "พฤศจิกายน", value: 10 },
  { label: "ธันวาคม", value: 11 },
];

interface PlantingDetailsStepProps {
  plantingDetails: PlantingDetail[];
  updatePlantingDetail: (
    index: number,
    field: keyof PlantingDetail,
    value: string | number | Date
  ) => void;
  addPlantingDetail: () => void;
  removePlantingDetail: (index: number) => void;
}

export const PlantingDetailsStep: React.FC<PlantingDetailsStepProps> = ({
  plantingDetails,
  updatePlantingDetail,
  addPlantingDetail,
  removePlantingDetail,
}) => {
  return (
    <div className={formStyles.formSection}>
      <h2 className={formStyles.section.title}>รายละเอียดการปลูก</h2>
      <p className={formStyles.formField.hint}>
        กรุณากรอกข้อมูลรายละเอียดการปลูกยางพารา (อย่างน้อย 1 รายการ)
      </p>

      {plantingDetails.map((detail, index) => {
        const uniqueKey = `${detail.specie || "empty"}-${index}`;
        return (
          <div key={uniqueKey} className={formStyles.section.card}>
            <div className="flex justify-between items-center mb-3">
              <h3 className={formStyles.section.cardTitle}>
                รายการที่ {index + 1}
              </h3>
              {plantingDetails.length > 1 && (
                <PrimaryButton
                  label="ลบรายการ"
                  icon="pi pi-trash"
                  color="danger"
                  variant="outlined"
                  size="small"
                  type="button"
                  onClick={() => removePlantingDetail(index)}
                />
              )}
            </div>

            <div className={`${formStyles.formField.wrapper} mb-4`}>
              <div>
                <label
                  htmlFor={`specie-${index}`}
                  className={formStyles.formField.label}
                >
                  พันธุ์ยางพารา{" "}
                  <span className={formStyles.formField.requiredMark}>*</span>
                </label>
                <PrimaryAutoComplete
                  id={`specie-${index}`}
                  name={`specie-${index}`}
                  value={detail.specie}
                  options={rubberSpeciesOptions}
                  onChange={(value) =>
                    updatePlantingDetail(index, "specie", value)
                  }
                  placeholder="เลือกพันธุ์ยางพารา"
                />
              </div>

              <div>
                <label
                  htmlFor={`areaOfPlot-${index}`}
                  className={formStyles.formField.label}
                >
                  พื้นที่แปลง (ไร่){" "}
                  <span className={formStyles.formField.requiredMark}>*</span>
                </label>
                <PrimaryInputNumber
                  id={`areaOfPlot-${index}`}
                  name={`areaOfPlot-${index}`}
                  value={detail.areaOfPlot || null}
                  onChange={(value) =>
                    updatePlantingDetail(index, "areaOfPlot", value || 0)
                  }
                  min={0}
                  max={100000}
                  maxFractionDigits={2}
                />
              </div>
            </div>

            <div className={`${formStyles.formField.wrapperThree} mb-4`}>
              <div>
                <label
                  htmlFor={`numberOfRubber-${index}`}
                  className={formStyles.formField.label}
                >
                  จำนวนต้นยางทั้งหมด (ต้น){" "}
                  <span className={formStyles.formField.requiredMark}>*</span>
                </label>
                <PrimaryInputNumber
                  id={`numberOfRubber-${index}`}
                  name={`numberOfRubber-${index}`}
                  value={detail.numberOfRubber || null}
                  onChange={(value) =>
                    updatePlantingDetail(index, "numberOfRubber", value || 0)
                  }
                  min={0}
                  max={100000}
                  maxFractionDigits={0}
                />
              </div>

              <div>
                <label
                  htmlFor={`numberOfTapping-${index}`}
                  className={formStyles.formField.label}
                >
                  จำนวนต้นยางที่กรีดได้ (ต้น){" "}
                  <span className={formStyles.formField.requiredMark}>*</span>
                </label>
                <PrimaryInputNumber
                  id={`numberOfTapping-${index}`}
                  name={`numberOfTapping-${index}`}
                  value={detail.numberOfTapping || null}
                  onChange={(value) =>
                    updatePlantingDetail(index, "numberOfTapping", value || 0)
                  }
                  min={0}
                  max={100000}
                  maxFractionDigits={0}
                />
              </div>

              <div>
                <label
                  htmlFor={`ageOfRubber-${index}`}
                  className={formStyles.formField.label}
                >
                  อายุต้นยาง (ปี){" "}
                  <span className={formStyles.formField.requiredMark}>*</span>
                </label>
                <PrimaryInputNumber
                  id={`ageOfRubber-${index}`}
                  name={`ageOfRubber-${index}`}
                  value={detail.ageOfRubber || null}
                  onChange={(value) =>
                    updatePlantingDetail(index, "ageOfRubber", value || 0)
                  }
                  min={0}
                  max={100000}
                  maxFractionDigits={0}
                />
              </div>
            </div>

            <div className={`${formStyles.formField.wrapperThree} mb-4`}>
              <div>
                <label
                  htmlFor={`yearOfTapping-${index}`}
                  className={formStyles.formField.label}
                >
                  ปีที่เริ่มกรีด{" "}
                  <span className={formStyles.formField.requiredMark}>*</span>
                </label>
                <PrimaryCalendar
                  id={`yearOfTapping-${index}`}
                  name={`yearOfTapping-${index}`}
                  value={
                    detail.yearOfTapping ? new Date(detail.yearOfTapping) : null
                  }
                  onChange={(value) => {
                    if (value) {
                      updatePlantingDetail(index, "yearOfTapping", value);
                    }
                  }}
                  view="year"
                  dateFormat="yy"
                  placeholder="เลือกปี"
                />
              </div>

              <div>
                <label
                  htmlFor={`monthOfTapping-${index}`}
                  className={formStyles.formField.label}
                >
                  เดือนที่เริ่มกรีด{" "}
                  <span className={formStyles.formField.requiredMark}>*</span>
                </label>
                <PrimaryDropdown
                  id={`monthOfTapping-${index}`}
                  name={`monthOfTapping-${index}`}
                  value={
                    detail.monthOfTapping
                      ? new Date(detail.monthOfTapping).getMonth()
                      : ""
                  }
                  options={monthOptions}
                  onChange={(value) => {
                    const date = new Date();
                    date.setMonth(value);
                    updatePlantingDetail(index, "monthOfTapping", date);
                  }}
                  placeholder="เลือกเดือน"
                />
              </div>

              <div>
                <label
                  htmlFor={`totalProduction-${index}`}
                  className={formStyles.formField.label}
                >
                  ผลผลิตรวม (กก./ปี){" "}
                  <span className={formStyles.formField.requiredMark}>*</span>
                </label>
                <PrimaryInputNumber
                  id={`totalProduction-${index}`}
                  name={`totalProduction-${index}`}
                  value={detail.totalProduction || null}
                  onChange={(value) =>
                    updatePlantingDetail(index, "totalProduction", value || 0)
                  }
                  min={0}
                  max={100000}
                  maxFractionDigits={2}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* ปุ่มเพิ่มรายการ */}
      <div className="mt-6 flex justify-center">
        <PrimaryButton
          label="เพิ่มรายการปลูก"
          icon="pi pi-plus"
          color="success"
          variant="outlined"
          type="button"
          onClick={addPlantingDetail}
        />
      </div>
    </div>
  );
};
