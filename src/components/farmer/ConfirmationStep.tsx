import React from "react";
import { formStyles } from "@/styles/formStyles";
import { RubberFarm, PlantingDetail } from "@/hooks/useRubberFarmForm";
import { formatThaiDate } from "@/utils/dateFormatter";

interface ConfirmationStepProps {
  rubberFarm: RubberFarm;
  plantingDetails: PlantingDetail[];
  isConfirmed: boolean;
  onConfirmChange: (checked: boolean) => void;
}

const SummaryItem: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div>
    <div className={formStyles.section.summaryItem.label}>{label}</div>
    <div className={formStyles.section.summaryItem.value}>{value || "-"}</div>
  </div>
);

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  rubberFarm,
  plantingDetails,
  isConfirmed,
  onConfirmChange,
}) => {
  const validPlantingDetails = plantingDetails.filter(
    (detail) =>
      detail.specie && detail.areaOfPlot > 0 && detail.numberOfRubber > 0
  );

  return (
    <div className={formStyles.formSection}>
      <h2 className={formStyles.section.title}>ยืนยันข้อมูล</h2>

      <div className={formStyles.section.summaryCard}>
        <h3 className={formStyles.section.summaryTitle}>ข้อมูลสวนยาง</h3>
        <div className={formStyles.section.summaryGrid}>
          <SummaryItem label="หมู่บ้าน/ชุมชน" value={rubberFarm.villageName} />
          <SummaryItem label="หมู่ที่" value={rubberFarm.moo} />
          <SummaryItem label="ถนน" value={rubberFarm.road} />
          <SummaryItem label="ซอย" value={rubberFarm.alley} />
          <SummaryItem label="ตำบล/แขวง" value={rubberFarm.subDistrict} />
          <SummaryItem label="อำเภอ/เขต" value={rubberFarm.district} />
          <SummaryItem label="จังหวัด" value={rubberFarm.province} />
        </div>
      </div>

      <h3 className={formStyles.section.summaryTitle}>รายละเอียดการปลูก</h3>
      {validPlantingDetails.map((detail, index) => {
        const uniqueKey = `${detail.specie}-${detail.areaOfPlot}-${index}`;
        return (
          <div key={uniqueKey} className={formStyles.section.summaryCard}>
            <h4 className={formStyles.section.cardTitle}>
              รายการที่ {index + 1}
            </h4>
            <div className={formStyles.section.summaryDetailGrid}>
              <SummaryItem label="สายพันธุ์ยาง" value={detail.specie} />
              <SummaryItem
                label="พื้นที่แปลง (ไร่)"
                value={detail.areaOfPlot.toFixed(2)}
              />
              <SummaryItem
                label="จำนวนต้นยางทั้งหมด (ต้น)"
                value={detail.numberOfRubber}
              />
              <SummaryItem
                label="จำนวนต้นยางที่กรีดได้ (ต้น)"
                value={detail.numberOfTapping}
              />
              <SummaryItem label="อายุต้นยาง (ปี)" value={detail.ageOfRubber} />
              <SummaryItem
                label="ปีที่เริ่มกรีด"
                value={formatThaiDate(detail.yearOfTapping, "year")}
              />
              <SummaryItem
                label="เดือนที่เริ่มกรีด"
                value={formatThaiDate(detail.monthOfTapping, "month")}
              />
              <SummaryItem
                label="ผลผลิตรวม (กก./ปี)"
                value={detail.totalProduction.toFixed(2)}
              />
            </div>
          </div>
        );
      })}

      <div className="mt-6">
        <div className={formStyles.checkbox.wrapper}>
          <input
            id="confirm"
            name="confirm"
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
            className={formStyles.checkbox.input}
          />
          <label htmlFor="confirm" className={formStyles.checkbox.label}>
            ข้าพเจ้ายืนยันว่าข้อมูลที่กรอกมีความถูกต้องและครบถ้วน
            และพร้อมส่งข้อมูลเพื่อขอรับรองมาตรฐานจีเอพี
          </label>
        </div>
        <div className={formStyles.alert.warning}>
          <strong>หมายเหตุ:</strong> เมื่อส่งข้อมูลแล้วจะไม่สามารถแก้ไขได้
          กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนส่ง
        </div>
      </div>
    </div>
  );
};
