import { useState, useEffect } from "react";
import thaiProvinceData from "@/data/thai-provinces.json";

export interface Tambon {
  id: number;
  name_th: string;
  name_en: string;
  zip_code: number;
}

export interface Amphure {
  id: number;
  name_th: string;
  name_en: string;
  tambons: Tambon[];
}

export interface Province {
  id: number;
  name_th: string;
  name_en: string;
  amphures: Amphure[];
}

export const useThailandAddressForForm = (
  provinceId: number,
  amphureId: number
) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);

  // โหลดข้อมูลจังหวัด อำเภอ ตำบล
  useEffect(() => {
    try {
      setIsLoadingProvinces(true);

      const formatTambon = (tam: any): Tambon => ({
        id: tam.id,
        name_th: tam.name_th,
        name_en: tam.name_en,
        zip_code: tam.zip_code,
      });

      const formatAmphure = (amp: any): Amphure => ({
        id: amp.id,
        name_th: amp.name_th,
        name_en: amp.name_en,
        tambons: amp.tambon.map(formatTambon),
      });

      const formattedProvinces = thaiProvinceData.map((province) => ({
        id: province.id,
        name_th: province.name_th,
        name_en: province.name_en,
        amphures: province.amphure.map(formatAmphure),
      }));

      setProvinces(formattedProvinces);
    } catch (err) {
      console.error("Error loading provinces:", err);
    } finally {
      setIsLoadingProvinces(false);
    }
  }, []);

  // อัปเดตอำเภอเมื่อเลือกจังหวัด
  useEffect(() => {
    if (provinceId > 0) {
      const selectedProvince = provinces.find(
        (province) => province.id === provinceId
      );
      if (selectedProvince) {
        setAmphures(selectedProvince.amphures);
      }
    } else {
      setAmphures([]);
      setTambons([]);
    }
  }, [provinceId, provinces]);

  // อัปเดตตำบลเมื่อเลือกอำเภอ
  useEffect(() => {
    if (amphureId > 0) {
      const selectedAmphure = amphures.find(
        (amphure) => amphure.id === amphureId
      );
      if (selectedAmphure) {
        setTambons(selectedAmphure.tambons);
      }
    } else {
      setTambons([]);
    }
  }, [amphureId, amphures]);

  return {
    provinces,
    amphures,
    tambons,
    isLoadingProvinces,
  };
};
