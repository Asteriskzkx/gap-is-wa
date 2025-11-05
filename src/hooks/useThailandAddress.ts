import { useState, useEffect, useMemo } from "react";

interface Tambon {
  id: number;
  name_th: string;
  name_en: string;
  zip_code: number;
}

interface Amphure {
  id: number;
  name_th: string;
  name_en: string;
  tambons: Tambon[];
}

interface Province {
  id: number;
  name_th: string;
  name_en: string;
  amphures: Amphure[];
}

interface UseThailandAddressReturn {
  provinces: Province[];
  amphures: Amphure[];
  tambons: Tambon[];
  provinceOptions: Array<{ label: string; value: number }>;
  amphureOptions: Array<{ label: string; value: number }>;
  tambonOptions: Array<{ label: string; value: number }>;
  isLoading: boolean;
  error: string | null;
  setProvinceId: (provinceId: number) => void;
  setAmphureId: (amphureId: number) => void;
  setTambonId: (tambonId: number) => void;
  getProvinceName: (provinceId: number) => string;
  getAmphureName: (amphureId: number) => string;
  getTambonName: (tambonId: number) => string;
  getZipCode: (tambonId: number) => string;
}

/**
 * Custom hook สำหรับจัดการข้อมูลที่อยู่ไทย (จังหวัด อำเภอ ตำบล)
 *
 * @example
 * const {
 *   provinceOptions,
 *   amphureOptions,
 *   tambonOptions,
 *   setProvinceId,
 *   setAmphureId,
 *   getZipCode,
 *   isLoading
 * } = useThailandAddress();
 */
export function useThailandAddress(): UseThailandAddressReturn {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(0);
  const [selectedAmphureId, setSelectedAmphureId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load provinces data
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setIsLoading(true);
        // Dynamic import to avoid blocking
        const thaiProvinceData = await import("@/data/thai-provinces.json");

        const formattedProvinces = thaiProvinceData.default.map(
          (province: any) => ({
            id: province.id,
            name_th: province.name_th,
            name_en: province.name_en,
            amphures: province.amphure.map((amp: any) => ({
              id: amp.id,
              name_th: amp.name_th,
              name_en: amp.name_en,
              tambons: amp.tambon.map((tam: any) => ({
                id: tam.id,
                name_th: tam.name_th,
                name_en: tam.name_en,
                zip_code: tam.zip_code,
              })),
            })),
          })
        );

        setProvinces(formattedProvinces);
        setError(null);
      } catch (err) {
        console.error("Error loading provinces:", err);
        setError("ไม่สามารถโหลดข้อมูลจังหวัดได้");
      } finally {
        setIsLoading(false);
      }
    };

    loadProvinces();
  }, []);

  // Update amphures when province changes
  useEffect(() => {
    if (selectedProvinceId > 0) {
      const selectedProvince = provinces.find(
        (province) => province.id === selectedProvinceId
      );
      if (selectedProvince) {
        setAmphures(selectedProvince.amphures);
      } else {
        setAmphures([]);
      }
    } else {
      setAmphures([]);
    }
    // Reset child selections
    setTambons([]);
  }, [selectedProvinceId, provinces]);

  // Update tambons when amphure changes
  useEffect(() => {
    if (selectedAmphureId > 0) {
      const selectedAmphure = amphures.find(
        (amphure) => amphure.id === selectedAmphureId
      );
      if (selectedAmphure) {
        setTambons(selectedAmphure.tambons);
      } else {
        setTambons([]);
      }
    } else {
      setTambons([]);
    }
  }, [selectedAmphureId, amphures]);

  // Memoized options
  const provinceOptions = useMemo(
    () =>
      provinces.map((province) => ({
        label: province.name_th,
        value: province.id,
      })),
    [provinces]
  );

  const amphureOptions = useMemo(
    () =>
      amphures.map((amphure) => ({
        label: amphure.name_th,
        value: amphure.id,
      })),
    [amphures]
  );

  const tambonOptions = useMemo(
    () =>
      tambons.map((tambon) => ({
        label: tambon.name_th,
        value: tambon.id,
      })),
    [tambons]
  );

  // Helper functions
  const getProvinceName = (provinceId: number): string => {
    const province = provinces.find((p) => p.id === provinceId);
    return province?.name_th || "";
  };

  const getAmphureName = (amphureId: number): string => {
    const amphure = amphures.find((a) => a.id === amphureId);
    return amphure?.name_th || "";
  };

  const getTambonName = (tambonId: number): string => {
    const tambon = tambons.find((t) => t.id === tambonId);
    return tambon?.name_th || "";
  };

  const getZipCode = (tambonId: number): string => {
    const tambon = tambons.find((t) => t.id === tambonId);
    return tambon?.zip_code.toString() || "";
  };

  return {
    provinces,
    amphures,
    tambons,
    provinceOptions,
    amphureOptions,
    tambonOptions,
    isLoading,
    error,
    setProvinceId: setSelectedProvinceId,
    setAmphureId: setSelectedAmphureId,
    setTambonId: () => {}, // Not needed but kept for API consistency
    getProvinceName,
    getAmphureName,
    getTambonName,
    getZipCode,
  };
}
