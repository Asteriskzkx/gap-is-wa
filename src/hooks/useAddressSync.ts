import { useEffect } from "react";
import { RubberFarm } from "@/hooks/useRubberFarmForm";
import { Province, Amphure, Tambon } from "@/hooks/useThailandAddressForForm";

export const useAddressSync = (
  rubberFarm: RubberFarm,
  setRubberFarm: React.Dispatch<React.SetStateAction<RubberFarm>>,
  provinces: Province[],
  amphures: Amphure[],
  tambons: Tambon[]
) => {
  // อัปเดตชื่อจังหวัดเมื่อเลือกจังหวัด
  useEffect(() => {
    if (rubberFarm.provinceId > 0) {
      const selectedProvince = provinces.find(
        (province) => province.id === rubberFarm.provinceId
      );
      if (selectedProvince) {
        setRubberFarm((prev) => ({
          ...prev,
          province: selectedProvince.name_th,
          amphureId: 0,
          tambonId: 0,
          district: "",
          subDistrict: "",
        }));
      }
    }
  }, [rubberFarm.provinceId, provinces, setRubberFarm]);

  // อัปเดตชื่ออำเภอเมื่อเลือกอำเภอ
  useEffect(() => {
    if (rubberFarm.amphureId > 0) {
      const selectedAmphure = amphures.find(
        (amphure) => amphure.id === rubberFarm.amphureId
      );
      if (selectedAmphure) {
        setRubberFarm((prev) => ({
          ...prev,
          district: selectedAmphure.name_th,
          tambonId: 0,
          subDistrict: "",
        }));
      }
    }
  }, [rubberFarm.amphureId, amphures, setRubberFarm]);

  // อัปเดตชื่อตำบลเมื่อเลือกตำบล
  useEffect(() => {
    if (rubberFarm.tambonId > 0) {
      const selectedTambon = tambons.find(
        (tambon) => tambon.id === rubberFarm.tambonId
      );
      if (selectedTambon) {
        setRubberFarm((prev) => ({
          ...prev,
          subDistrict: selectedTambon.name_th,
        }));
      }
    }
  }, [rubberFarm.tambonId, tambons, setRubberFarm]);
};
