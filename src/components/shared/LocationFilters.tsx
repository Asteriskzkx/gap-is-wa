"use client";

import PrimaryAutoComplete from "@/components/ui/PrimaryAutoComplete";
import PrimaryButton from "@/components/ui/PrimaryButton";
import thaiProvinceData from "@/data/thai-provinces.json";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Props {
  provinceId?: number | null;
  districtId?: number | null;
  subDistrictId?: number | null;
  onProvinceChange: (value: number | null) => void;
  onDistrictChange: (value: number | null) => void;
  onSubDistrictChange: (value: number | null) => void;
  onSearch: (payload: {
    provinceId?: number | null;
    districtId?: number | null;
    subDistrictId?: number | null;
  }) => void;
  onReset: () => void;
  currentTab: "pending" | "completed";
  onTabChange: (tab: "pending" | "completed") => void;
}

export default function LocationFilters({
  provinceId = null,
  districtId = null,
  subDistrictId = null,
  onProvinceChange,
  onDistrictChange,
  onSubDistrictChange,
  onSearch,
  onReset,
  currentTab,
  onTabChange,
}: Props) {
  const [provinces] = useState<any[]>(
    thaiProvinceData.map((p: any) => ({ id: p.id, name_th: p.name_th }))
  );
  const [districts, setDistricts] = useState<any[]>([]);
  const [subDistricts, setSubDistricts] = useState<any[]>([]);

  const provinceOptions = provinces.map((p) => ({
    label: p.name_th,
    value: p.id,
  }));
  const districtOptions = districts.map((d: any) => ({
    label: d.name_th,
    value: d.id,
  }));
  const subDistrictOptions = subDistricts.map((s: any) => ({
    label: s.name_th,
    value: s.id,
  }));

  // sync districts when provinceId changes
  useEffect(() => {
    if (provinceId) {
      const prov = thaiProvinceData.find((p: any) => p.id === provinceId);
      if (prov && prov.amphure) {
        setDistricts(prov.amphure || []);
      } else {
        setDistricts([]);
      }
      setSubDistricts([]);
      // reset child selections
      onDistrictChange(null);
      onSubDistrictChange(null);
    } else {
      setDistricts([]);
      setSubDistricts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceId]);

  useEffect(() => {
    if (districtId) {
      const district = districts.find((d) => d.id === districtId);
      if (district && district.tambon) {
        setSubDistricts(district.tambon || []);
      } else {
        setSubDistricts([]);
      }
      onSubDistrictChange(null);
    } else {
      setSubDistricts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtId, districts]);

  // detect committee role to hide certain tab buttons
  const { data: session } = useSession();
  const roleFromSession = (session as any)?.user?.role as string | undefined;
  const normalizedRole = roleFromSession
    ? roleFromSession.toLowerCase()
    : undefined;
  const isCommittee =
    normalizedRole === "committee" ||
    ((session as any)?.user?.roleData?.committeeId !== undefined &&
      (session as any)?.user?.roleData?.committeeId !== null);

  return (
    <div className="flex flex-col w-full">
      {/* First row: responsive grid - 3 columns on sm+ (province, district, subdistrict) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full items-center">
        <div className="w-full sm:w-full">
          <label
            className="block text-sm text-gray-600 mb-1"
            htmlFor="province-search"
          >
            จังหวัด
          </label>
          <PrimaryAutoComplete
            id="province-search"
            value={provinceId}
            options={provinceOptions}
            onChange={(v) => onProvinceChange(v || null)}
            placeholder="เลือกจังหวัด"
          />
        </div>

        <div className="w-full sm:w-full">
          <label
            className="block text-sm text-gray-600 mb-1"
            htmlFor="district-search"
          >
            อำเภอ/เขต
          </label>
          <PrimaryAutoComplete
            id="district-search"
            value={districtId}
            options={districtOptions}
            onChange={(v) => onDistrictChange(v || null)}
            placeholder="เลือกอำเภอ/เขต"
            disabled={!provinceId}
          />
        </div>

        <div className="w-full sm:w-full">
          <label
            className="block text-sm text-gray-600 mb-1"
            htmlFor="subdistrict-search"
          >
            ตำบล/แขวง
          </label>
          <PrimaryAutoComplete
            id="subdistrict-search"
            value={subDistrictId}
            options={subDistrictOptions}
            onChange={(v) => onSubDistrictChange(v || null)}
            placeholder="เลือกตำบล/แขวง"
            disabled={!districtId}
          />
        </div>
      </div>

      {/* Second row: centered search/reset buttons */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="justify-self-end">
          <PrimaryButton
            label="ค้นหา"
            icon="pi pi-search"
            onClick={() => onSearch({ provinceId, districtId, subDistrictId })}
          />
        </div>
        <div>
          <PrimaryButton
            label="ล้างค่า"
            icon="pi pi-refresh"
            color="secondary"
            onClick={onReset}
          />
        </div>
      </div>

      {/* Third row: tab buttons */}
      {!isCommittee && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <PrimaryButton
            label="รอสรุปผล"
            icon="pi pi-clock"
            color={currentTab === "pending" ? "success" : "secondary"}
            onClick={() => onTabChange("pending")}
          />
          <PrimaryButton
            label="เสร็จสิ้น"
            icon="pi pi-check-circle"
            color={currentTab === "completed" ? "success" : "secondary"}
            onClick={() => onTabChange("completed")}
          />
        </div>
      )}
    </div>
  );
}
