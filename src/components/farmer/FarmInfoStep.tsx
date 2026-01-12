import React from "react";
import { formStyles } from "@/styles/formStyles";
import {
  PrimaryInputText,
  PrimaryInputNumber,
  PrimaryAutoComplete,
  PrimaryDropdown,
} from "@/components/ui";
import DynamicMapSelector from "@/components/maps/DynamicMap";
import { RubberFarm } from "@/hooks/useRubberFarmForm";

interface Province {
  id: number;
  name_th: string;
  name_en: string;
}

interface Amphure {
  id: number;
  name_th: string;
  name_en: string;
}

interface Tambon {
  id: number;
  name_th: string;
  name_en: string;
  zip_code: number;
}

interface FarmInfoStepProps {
  rubberFarm: RubberFarm;
  provinces: Province[];
  amphures: Amphure[];
  tambons: Tambon[];
  updateFarmData: (name: string, value: string | number) => void;
  onLocationChange: (location: {
    type: string;
    coordinates: [number, number];
  }) => void;
  isEditMode?: boolean;
}

export const FarmInfoStep: React.FC<FarmInfoStepProps> = ({
  rubberFarm,
  provinces,
  amphures,
  tambons,
  updateFarmData,
  onLocationChange,
  isEditMode = false,
}) => {
  const productDistributionOptions = [
    { label: "ก่อนเปิดกรีด", value: "ก่อนเปิดกรีด" },
    { label: "น้ำยางสด", value: "น้ำยางสด" },
    { label: "ยางก้อนถ้วย", value: "ยางก้อนถ้วย" },
  ];

  const handleProvinceChange = (value: any) => {
    const provinceId = Number(value) || 0;
    updateFarmData("provinceId", provinceId);
    updateFarmData(
      "province",
      provinces.find((p) => p.id === provinceId)?.name_th || ""
    );

    // Reset cascading fields
    updateFarmData("amphureId", 0);
    updateFarmData("district", "");
    updateFarmData("tambonId", 0);
    updateFarmData("subDistrict", "");
  };

  const handleAmphureChange = (value: any) => {
    const amphureId = Number(value) || 0;
    updateFarmData("amphureId", amphureId);
    updateFarmData(
      "district",
      amphures.find((a) => a.id === amphureId)?.name_th || ""
    );

    // Reset cascading field
    updateFarmData("tambonId", 0);
    updateFarmData("subDistrict", "");
  };

  const handleTambonChange = (value: any) => {
    const tambonId = Number(value) || 0;
    updateFarmData("tambonId", tambonId);
    updateFarmData(
      "subDistrict",
      tambons.find((t) => t.id === tambonId)?.name_th || ""
    );
  };

  return (
    <div className={formStyles.formSection}>
      <h2 className={formStyles.section.title}>ข้อมูลสวนยาง</h2>

      <div className={formStyles.formField.wrapper}>
        <div>
          <label htmlFor="villageName" className={formStyles.formField.label}>
            หมู่บ้าน/ชุมชน{" "}
            <span className={formStyles.formField.requiredMark}>*</span>
          </label>
          <PrimaryInputText
            id="villageName"
            name="villageName"
            value={rubberFarm.villageName}
            onChange={(value) => updateFarmData("villageName", value)}
            required
          />
        </div>

        <div>
          <label htmlFor="moo" className={formStyles.formField.label}>
            หมู่ที่ <span className={formStyles.formField.requiredMark}>*</span>
          </label>
          <PrimaryInputNumber
            id="moo"
            name="moo"
            value={rubberFarm.moo || null}
            onChange={(value) => updateFarmData("moo", value || 0)}
            min={1}
            max={1000}
            maxFractionDigits={0}
            required
          />
        </div>
      </div>

      <div className={formStyles.formField.wrapper}>
        <div>
          <label htmlFor="road" className={formStyles.formField.label}>
            ถนน <span className={formStyles.formField.requiredMark}>*</span>
          </label>
          <PrimaryInputText
            id="road"
            name="road"
            value={rubberFarm.road}
            onChange={(value) => updateFarmData("road", value)}
            required
          />
        </div>

        <div>
          <label htmlFor="alley" className={formStyles.formField.label}>
            ซอย <span className={formStyles.formField.requiredMark}>*</span>
          </label>
          <PrimaryInputText
            id="alley"
            name="alley"
            value={rubberFarm.alley}
            onChange={(value) => updateFarmData("alley", value)}
            required
          />
        </div>
      </div>

      <div className={formStyles.formField.wrapper}>
        <div>
          <label
            htmlFor="productDistributionType"
            className={formStyles.formField.label}
          >
            รูปแบบการจำหน่ายผลผลิต{" "}
            <span className={formStyles.formField.requiredMark}>*</span>
          </label>
          <PrimaryDropdown
            id="productDistributionType"
            name="productDistributionType"
            value={rubberFarm.productDistributionType}
            options={productDistributionOptions}
            onChange={(value) =>
              updateFarmData("productDistributionType", value)
            }
            placeholder="เลือกรูปแบบการจำหน่าย"
            required
            disabled={isEditMode}
          />
        </div>
      </div>

      <div className={formStyles.formField.wrapperThree}>
        <div>
          <label htmlFor="provinceId" className={formStyles.formField.label}>
            จังหวัด <span className={formStyles.formField.requiredMark}>*</span>
          </label>
          <PrimaryAutoComplete
            id="provinceId"
            name="provinceId"
            value={rubberFarm.provinceId || ""}
            options={provinces.map((province) => ({
              label: province.name_th,
              value: province.id,
            }))}
            onChange={handleProvinceChange}
            placeholder="เลือกจังหวัด"
            required
          />
        </div>

        <div>
          <label htmlFor="amphureId" className={formStyles.formField.label}>
            อำเภอ/เขต{" "}
            <span className={formStyles.formField.requiredMark}>*</span>
          </label>
          <PrimaryAutoComplete
            id="amphureId"
            name="amphureId"
            value={rubberFarm.amphureId || ""}
            options={amphures.map((amphure) => ({
              label: amphure.name_th,
              value: amphure.id,
            }))}
            onChange={handleAmphureChange}
            placeholder="เลือกอำเภอ/เขต"
            disabled={!rubberFarm.provinceId}
            required
          />
        </div>

        <div>
          <label htmlFor="tambonId" className={formStyles.formField.label}>
            ตำบล/แขวง{" "}
            <span className={formStyles.formField.requiredMark}>*</span>
          </label>
          <PrimaryAutoComplete
            id="tambonId"
            name="tambonId"
            value={rubberFarm.tambonId || ""}
            options={tambons.map((tambon) => ({
              label: tambon.name_th,
              value: tambon.id,
            }))}
            onChange={handleTambonChange}
            placeholder="เลือกตำบล/แขวง"
            disabled={!rubberFarm.amphureId}
            required
          />
        </div>
      </div>

      <div className="mt-8 mb-6">
        <div className="mb-4">
          <label htmlFor="location" className={formStyles.formField.label}>
            ตำแหน่งที่ตั้งสวนยาง{" "}
            <span className={formStyles.formField.requiredMark}>*</span>
          </label>
          <p className={formStyles.formField.hint}>
            คลิกบนแผนที่หรือใช้เครื่องมือวาดเพื่อระบุตำแหน่งที่ตั้งของสวนยางพารา
          </p>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <DynamicMapSelector
            location={rubberFarm.location as any}
            onChange={onLocationChange}
            height="500px"
          />
        </div>
      </div>
    </div>
  );
};
