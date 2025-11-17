import { useEffect, useMemo, useState } from "react";

type FlatAddress = {
  province: string;
  district: string; // amphure
  subDistrict: string; // tambon
  zipCode: string;
};

function normalizeLocalData(data: any): FlatAddress[] {
  if (!Array.isArray(data)) return [];

  // Case 1: Already flat array
  if (data.length && data[0].province && data[0].district && data[0].subDistrict) {
    return data.map((i: any) => ({
      province: String(i.province).trim(),
      district: String(i.district).trim(),
      subDistrict: String(i.subDistrict).trim(),
      zipCode: String(i.zipCode ?? "").trim(),
    }));
  }

  // Case 2: Tree structure with fields: name_th, amphure[], tambon[], zip_code
  if (data.length && data[0].amphure) {
    const out: FlatAddress[] = [];
    for (const p of data) {
      const pName = (p.name_th ?? p.name ?? "").trim();
      for (const a of p.amphure ?? p.amphures ?? []) {
        const aName = (a.name_th ?? a.name ?? "").trim();
        for (const t of a.tambon ?? a.tambons ?? []) {
          const tName = (t.name_th ?? t.name ?? "").trim();
          const zip = String(t.zip_code ?? t.zipCode ?? "").trim();
          out.push({ province: pName, district: aName, subDistrict: tName, zipCode: zip });
        }
      }
    }
    return out;
  }

  // Fallback: unknown shape
  return [];
}

function uniq(sortedArr: string[]): string[] {
  const out: string[] = [];
  let prev = "\u0000";
  for (const s of sortedArr) {
    if (s !== prev) out.push(s);
    prev = s;
  }
  return out;
}

export default function useThaiAddress() {
  const [raw, setRaw] = useState<FlatAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Load from local JSON first
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import("@/data/thai-provinces.json");
        const local = normalizeLocalData((mod as any).default ?? mod);
        if (!mounted) return;
        setRaw(local);
      } catch (e: any) {
        if (!mounted) return;
        setError("Failed to load local provinces");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Optionally merge from API if available (non-fatal on error)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/thai-address");
        if (!res.ok) return;
        const data = await res.json();
        const merged = normalizeLocalData(data);
        if (cancelled || !merged.length) return;
        // Merge and dedupe
        const key = (i: FlatAddress) => `${i.province}|${i.district}|${i.subDistrict}`;
        setRaw((prev) => {
          const map = new Map<string, FlatAddress>();
          for (const i of prev) map.set(key(i), i);
          for (const i of merged) map.set(key(i), i);
          return Array.from(map.values());
        });
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const provinces = useMemo(() => {
    const arr = raw.map((i) => i.province).filter(Boolean).sort((a, b) => a.localeCompare(b));
    return uniq(arr);
  }, [raw]);

  const getDistricts = (province: string) => {
    if (!province) return [] as string[];
    const arr = raw
      .filter((i) => i.province === province)
      .map((i) => i.district)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return uniq(arr);
  };

  const getSubDistricts = (province: string, district: string) => {
    if (!province || !district) return [] as string[];
    const arr = raw
      .filter((i) => i.province === province && i.district === district)
      .map((i) => i.subDistrict)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return uniq(arr);
  };

  const getZipCode = (province: string, district: string, subDistrict: string) => {
    const found = raw.find(
      (i) => i.province === province && i.district === district && i.subDistrict === subDistrict
    );
    return found?.zipCode ?? "";
  };

  return {
    isLoading,
    error,
    provinces,
    getDistricts,
    getSubDistricts,
    getZipCode,
  };
}
