import React from "react";
import { formStyles } from "@/styles/formStyles";
import { formatThaiDate } from "@/utils/dateFormatter";

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

interface RubberFarm {
  rubberFarmId: number;
  villageName: string;
  moo: number;
  road: string;
  alley: string;
  subDistrict: string;
  district: string;
  province: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

interface EditConfirmationStepProps {
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

export const EditConfirmationStep: React.FC<EditConfirmationStepProps> = ({
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
      <h2 className={formStyles.section.title}>ตรวจสอบและยืนยันข้อมูล</h2>
      <p className={formStyles.formField.hint}>
        กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนทำการบันทึก
      </p>

      <div className={formStyles.section.summaryCard}>
        <h3 className={formStyles.section.summaryTitle}>ข้อมูลสวนยาง</h3>
        <div className={formStyles.section.summaryGrid}>
          <SummaryItem
            label="รหัสสวน"
            value={`RF${rubberFarm.rubberFarmId.toString().padStart(5, "0")}`}
          />
          <SummaryItem label="หมู่บ้าน/ชุมชน" value={rubberFarm.villageName} />
          <SummaryItem label="หมู่ที่" value={rubberFarm.moo} />
          <SummaryItem label="ถนน" value={rubberFarm.road} />
          <SummaryItem label="ซอย" value={rubberFarm.alley} />
          <SummaryItem label="ตำบล/แขวง" value={rubberFarm.subDistrict} />
          <SummaryItem label="อำเภอ/เขต" value={rubberFarm.district} />
          <SummaryItem label="จังหวัด" value={rubberFarm.province} />
          <SummaryItem
            label="พิกัด (ละติจูด, ลองจิจูด)"
            value={`${rubberFarm.location.coordinates[1].toFixed(
              6
            )}, ${rubberFarm.location.coordinates[0].toFixed(6)}`}
          />
        </div>
      </div>

      <h3 className={formStyles.section.summaryTitle}>รายละเอียดการปลูก</h3>
      {validPlantingDetails.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-700">ไม่มีรายละเอียดการปลูก</p>
        </div>
      ) : (
        validPlantingDetails.map((detail, index) => {
          const uniqueKey = `${detail.specie}-${detail.areaOfPlot}-${index}`;
          return (
            <div key={uniqueKey} className={formStyles.section.summaryCard}>
              <h4 className={formStyles.section.cardTitle}>
                รายการที่ {index + 1}
                {detail.plantingDetailId > 0 && (
                  <span className="text-sm text-gray-500 ml-2">
                    (ID: {detail.plantingDetailId})
                  </span>
                )}
              </h4>
              <div className={formStyles.section.summaryDetailGrid}>
                <SummaryItem label="พันธุ์ยางพารา" value={detail.specie} />
                <SummaryItem
                  label="พื้นที่แปลง (ไร่)"
                  value={detail.areaOfPlot}
                />
                <SummaryItem
                  label="จำนวนต้นยางทั้งหมด (ต้น)"
                  value={detail.numberOfRubber}
                />
                <SummaryItem
                  label="จำนวนต้นกรีดที่กรีดได้ (ต้น)"
                  value={detail.numberOfTapping}
                />
                <SummaryItem
                  label="อายุต้นยาง (ปี)"
                  value={detail.ageOfRubber}
                />
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
                  value={detail.totalProduction}
                />
              </div>
            </div>
          );
        })
      )}

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
            ข้าพเจ้ายืนยันว่าข้อมูลข้างต้นถูกต้องและครบถ้วน
          </label>
        </div>
        <div className={formStyles.alert.warning}>
          ⚠️ ข้อมูลจะถูกบันทึกและส่งไปยังระบบ
          กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน
        </div>
      </div>
    </div>
  );
};
