import React from "react";
import { useRouter } from "next/navigation";
import { PrimaryDataTable, PrimaryButton } from "@/components/ui";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";

interface RubberFarm {
  rubberFarmId: number;
  farmerId: number;
  villageName: string;
  moo: number;
  province: string;
  district: string;
  subDistrict: string;
}

interface FarmSelectionStepProps {
  farms: RubberFarm[];
  selectedFarmId: number | null;
  onFarmSelect: (farmId: number | null) => void;
  isLoading: boolean;
  farmsPagination: {
    first: number;
    rows: number;
    totalRecords: number;
  };
  multiSortMeta: Array<{
    field: string;
    order: 1 | -1 | 0 | null;
  }>;
  onPageChange: (event: DataTablePageEvent) => void;
  onSortChange: (event: DataTableSortEvent) => void;
}

export const FarmSelectionStep: React.FC<FarmSelectionStepProps> = ({
  farms,
  selectedFarmId,
  onFarmSelect,
  isLoading,
  farmsPagination,
  multiSortMeta,
  onPageChange,
  onSortChange,
}) => {
  const router = useRouter();

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
        เลือกสวนยางที่ต้องการแก้ไข
      </h2>

      {isLoading && farms.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
        </div>
      ) : farms.length === 0 && farmsPagination.totalRecords === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-700 mb-3">
            คุณยังไม่มีสวนยางในระบบ กรุณาลงทะเบียนสวนยางก่อน
          </p>
          <PrimaryButton
            label="ลงทะเบียนสวนยาง"
            color="warning"
            onClick={() => router.push("/farmer/applications/new")}
            type="button"
          />
        </div>
      ) : (
        <PrimaryDataTable
          value={farms}
          columns={[
            {
              field: "farmId",
              header: "รหัสสวน",
              body: (rowData: any) =>
                rowData.farmId ||
                `RF${rowData.rubberFarmId.toString().padStart(5, "0")}`,
              sortable: true,
              headerAlign: "center" as const,
              bodyAlign: "center" as const,
              style: { width: "10%" },
            },
            {
              field: "location",
              header: "สถานที่",
              body: (rowData: any) =>
                rowData.location ||
                `${rowData.villageName} หมู่ ${rowData.moo}`,
              sortable: true,
              headerAlign: "center" as const,
              bodyAlign: "left" as const,
              style: { width: "30%" },
            },
            {
              field: "province",
              header: "จังหวัด",
              body: (rowData: any) => rowData.province,
              sortable: true,
              headerAlign: "center" as const,
              bodyAlign: "left" as const,
              style: { width: "20%" },
            },
            {
              field: "district",
              header: "อำเภอ",
              body: (rowData: any) => rowData.district,
              sortable: true,
              headerAlign: "center" as const,
              bodyAlign: "left" as const,
              style: { width: "20%" },
            },
            {
              field: "subDistrict",
              header: "ตำบล",
              body: (rowData: any) => rowData.subDistrict,
              sortable: true,
              headerAlign: "center" as const,
              bodyAlign: "left" as const,
              style: { width: "20%" },
            },
          ]}
          loading={isLoading}
          paginator
          rows={farmsPagination.rows}
          totalRecords={farmsPagination.totalRecords}
          first={farmsPagination.first}
          lazy
          onPage={onPageChange}
          sortMode="multiple"
          multiSortMeta={multiSortMeta}
          onSort={onSortChange}
          emptyMessage="ไม่พบข้อมูลสวนยางพารา"
          selectionMode="single"
          selection={farms.find((f) => f.rubberFarmId === selectedFarmId)}
          onSelectionChange={(e) => onFarmSelect(e.value?.rubberFarmId || null)}
          dataKey="rubberFarmId"
        />
      )}
    </div>
  );
};
