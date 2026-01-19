"use client";

import FarmerLayout from "@/components/layout/FarmerLayout";
import DynamicMapViewer from "@/components/maps/DynamicMapViewer";
import PrimaryAutoComplete from "@/components/ui/PrimaryAutoComplete";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";
import thaiProvinceData from "@/data/thai-provinces.json";
import { useFarmerRubberFarms } from "@/hooks/useFarmerRubberFarms";
import { CONTAINER, HEADER, SPACING, SPINNER } from "@/styles/auditorClasses";
import { formatThaiDate } from "@/utils/dateFormatter";
import { useMemo, useState } from "react";

const ActionButtons = ({ onOpen }: { onOpen: () => void }) => {
  return (
    <div className="flex justify-center gap-2">
      <PrimaryButton
        icon="pi pi-eye"
        color="info"
        onClick={onOpen}
        rounded
        text
      />
    </div>
  );
};

const formatFarmId = (row: any) =>
  row.farmId ||
  (row.rubberFarmId
    ? `RF${row.rubberFarmId.toString().padStart(5, "0")}`
    : "-");

const formatFarmLocation = (farm: any) => {
  const v = (val: any) =>
    (val || val === 0) && val !== "-" && val !== "" ? val : null;
  return (
    [
      v(farm?.villageName),
      v(farm?.moo) ? `หมู่ ${farm.moo}` : null,
      v(farm?.road),
      v(farm?.alley),
    ]
      .filter(Boolean)
      .join(" ") || "-"
  );
};

const displayValue = (value: any, fallback = "ไม่ระบุ") =>
  value || value === 0 ? value : fallback;

export default function Page() {
  const {
    items,
    loading,
    totalRecords,
    lazyParams,
    selectedProvinceId,
    selectedDistrictId,
    selectedSubDistrictId,
    setSelectedProvinceId,
    setSelectedDistrictId,
    setSelectedSubDistrictId,
    applyFilters,
    clearFilters,
    handlePageChange,
    handleSort,
    openDetails,
    closeDetails,
    farmDetails,
    detailsLoading,
    isShowDetails,
  } = useFarmerRubberFarms(10);

  const [provinces] = useState<any[]>(
    (thaiProvinceData as any).map((p: any) => ({
      id: p.id,
      name_th: p.name_th,
    }))
  );
  const [districts, setDistricts] = useState<any[]>([]);
  const [subDistricts, setSubDistricts] = useState<any[]>([]);

  const columns = useMemo(
    () => [
      {
        field: "farmId",
        header: "รหัสสวน",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (row: any) => formatFarmId(row),
        style: { width: "12%" },
      },
      {
        field: "location",
        header: "สถานที่",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        body: (row: any) => formatFarmLocation(row),
        style: { width: "30%" },
      },
      {
        field: "province",
        header: "จังหวัด",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        style: { width: "18%" },
      },
      {
        field: "district",
        header: "อำเภอ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        style: { width: "18%" },
      },
      {
        field: "subDistrict",
        header: "ตำบล",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        style: { width: "17%" },
      },
      {
        field: "actions",
        header: "",
        sortable: false,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        mobileAlign: "right" as const,
        mobileHideLabel: true,
        body: (row: any) => (
          <ActionButtons onOpen={() => openDetails(row.rubberFarmId)} />
        ),
        style: { width: "5%" },
      },
    ],
    [openDetails],
  );

  const plantingColumns = useMemo(
    () => [
      {
        field: "specie",
        header: "พันธุ์ยางพารา",
        body: (rowData: any) => rowData.specie,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        style: { width: "11%" },
      },
      {
        field: "areaOfPlot",
        header: "พื้นที่แปลง (ไร่)",
        body: (rowData: any) => rowData.areaOfPlot,
        headerAlign: "center" as const,
        bodyAlign: "right" as const,
        style: { width: "11%" },
      },
      {
        field: "numberOfRubber",
        header: "จำนวนต้นยางทั้งหมด (ต้น)",
        body: (rowData: any) => rowData.numberOfRubber,
        headerAlign: "center" as const,
        bodyAlign: "right" as const,
        style: { width: "16%" },
      },
      {
        field: "numberOfTapping",
        header: "จำนวนต้นยางที่กรีดได้ (ต้น)",
        body: (rowData: any) => rowData.numberOfTapping,
        headerAlign: "center" as const,
        bodyAlign: "right" as const,
        style: { width: "17%" },
      },
      {
        field: "ageOfRubber",
        header: "อายุต้นยาง (ปี)",
        body: (rowData: any) => rowData.ageOfRubber,
        headerAlign: "center" as const,
        bodyAlign: "right" as const,
        style: { width: "11%" },
      },
      {
        field: "yearOfTapping",
        header: "ปีที่เริ่มกรีด",
        body: (rowData: any) => formatThaiDate(rowData.yearOfTapping, "year"),
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        style: { width: "10%" },
      },
      {
        field: "monthOfTapping",
        header: "เดือนที่เริ่มกรีด",
        body: (rowData: any) => formatThaiDate(rowData.monthOfTapping, "month"),
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        style: { width: "11%" },
      },
      {
        field: "totalProduction",
        header: "ผลผลิตรวม (กก./ปี)",
        body: (rowData: any) => rowData.totalProduction,
        headerAlign: "center" as const,
        bodyAlign: "right" as const,
        style: { width: "13%" },
      },
    ],
    [],
  );

  return (
    <FarmerLayout>
      <div className={CONTAINER.page}>
        {!isShowDetails ? (
          <>
            <div className={SPACING.mb8}>
              <h1 className={HEADER.title}>สวนยางพารา</h1>
              <p className={HEADER.subtitle}>
                รายการสวนยางพาราที่ลงทะเบียนไว้ทั้งหมด
              </p>
            </div>

            <div className={CONTAINER.card}>
              <div className={CONTAINER.cardPadding}>
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
                        onClick={() => {
                          clearFilters();
                          setDistricts([]);
                          setSubDistricts([]);
                        }}
                      />
                    </div>
                  </div>
                </div>

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
                  dataKey="rubberFarmId"
                  emptyMessage="ไม่พบข้อมูลสวนยางพารา"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-center">
              <div>
                <PrimaryButton
                  label="ย้อนกลับ"
                  icon="pi pi-arrow-left"
                  color="secondary"
                  onClick={closeDetails}
                />
              </div>
              <div className="text-xl font-bold text-gray-700 break-words">
                รายละเอียดสวนยางพารา
                {farmDetails?.rubberFarmId
                  ? ` (${formatFarmId(farmDetails)})`
                  : ""}
              </div>
            </div>

            <div className={CONTAINER.card}>
              <div className={CONTAINER.cardPadding}>
                {detailsLoading && (
                  <div className={SPINNER.wrapper}>
                    <div className={SPINNER.spinner}></div>
                    <p className={SPINNER.text}>กำลังโหลดข้อมูล...</p>
                  </div>
                )}

                {!detailsLoading && farmDetails && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        ข้อมูลสวนยาง
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            หมู่บ้าน/ชุมชน:
                          </p>
                          <p className="font-medium">
                            {displayValue(farmDetails.villageName)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">หมู่ที่:</p>
                          <p className="font-medium">
                            {displayValue(farmDetails.moo)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ถนน:</p>
                          <p className="font-medium">
                            {displayValue(farmDetails.road)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ซอย:</p>
                          <p className="font-medium">
                            {displayValue(farmDetails.alley)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ตำบล/แขวง:</p>
                          <p className="font-medium">
                            {displayValue(farmDetails.subDistrict)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">อำเภอ/เขต:</p>
                          <p className="font-medium">
                            {displayValue(farmDetails.district)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">จังหวัด:</p>
                          <p className="font-medium">
                            {displayValue(farmDetails.province)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            รูปแบบการจำหน่ายผลผลิต:
                          </p>
                          <p className="font-medium">
                            {displayValue(farmDetails.productDistributionType)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        แผนที่ตั้งสวน
                      </h4>
                      {farmDetails.location?.type ? (
                        <DynamicMapViewer
                          location={farmDetails.location}
                          height="320px"
                          width="100%"
                        />
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          ไม่มีข้อมูลแผนที่
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        รายละเอียดการปลูก
                      </h4>
                      <div className="overflow-x-auto">
                        <PrimaryDataTable
                          value={farmDetails.plantingDetails || []}
                          columns={plantingColumns}
                          loading={detailsLoading}
                          paginator={false}
                          emptyMessage="ไม่มีข้อมูลรายละเอียดการปลูก"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!detailsLoading && !farmDetails && (
                  <div className="text-center py-8 text-gray-500">
                    ไม่พบข้อมูลสวนยางพารา
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </FarmerLayout>
  );
}
