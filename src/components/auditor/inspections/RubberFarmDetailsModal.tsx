import { PrimaryButton, PrimaryDataTable } from "@/components/ui";
import { formatThaiDate } from "@/utils/dateFormatter";
import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import DynamicMapViewer from "@/components/maps/DynamicMapViewer";

export interface PlantingDetail {
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

export interface RubberFarmDetails {
  rubberFarmId: number;
  villageName: string;
  moo: number;
  road: string;
  alley: string;
  subDistrict: string;
  district: string;
  province: string;
  productDistributionType: string;
  location: any;
  plantingDetails: PlantingDetail[];
}

interface RubberFarmDetailsModalProps {
  farmDetails: RubberFarmDetails | null;
  loading: boolean;
  onClose: () => void;
}

export const RubberFarmDetailsModal: React.FC<RubberFarmDetailsModalProps> = ({
  farmDetails,
  loading,
  onClose,
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    // Save current overflow value
    const originalOverflow = document.body.style.overflow;
    // Prevent scrolling
    document.body.style.overflow = "hidden";

    // Restore on cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg max-w-8xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-[10000]">
          <h3 className="text-lg font-semibold text-gray-900">
            รายละเอียดสวนยางพารา
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mx-auto"></div>
              <p className="mt-3 text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {!loading && farmDetails && (
            <div className="space-y-6">
              {/* ข้อมูลทั่วไป */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">หมู่บ้าน/ชุมชน:</p>
                    <p className="font-medium">{farmDetails.villageName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">หมู่ที่:</p>
                    <p className="font-medium">{farmDetails.moo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ถนน:</p>
                    <p className="font-medium">
                      {farmDetails.road || "ไม่ระบุ"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ซอย:</p>
                    <p className="font-medium">
                      {farmDetails.alley || "ไม่ระบุ"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ตำบล/แขวง:</p>
                    <p className="font-medium">{farmDetails.subDistrict}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">อำเภอ/เขต:</p>
                    <p className="font-medium">{farmDetails.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">จังหวัด:</p>
                    <p className="font-medium">{farmDetails.province}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      รูปแบบการจำหน่ายผลผลิต:
                    </p>
                    <p className="font-medium">
                      {farmDetails.productDistributionType}
                    </p>
                  </div>
                </div>
              </div>

              {/* แผนที่ */}
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  แผนที่ตั้งสวน
                </h4>
                <div className="w-full">
                  <DynamicMapViewer
                    location={farmDetails.location}
                    height="320px"
                    width="100%"
                  />
                </div>
              </div>

              {/* รายละเอียดการปลูก */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  รายละเอียดการปลูก
                </h4>
                {farmDetails.plantingDetails &&
                farmDetails.plantingDetails.length > 0 ? (
                  <div className="overflow-x-auto">
                    <PrimaryDataTable
                      value={farmDetails.plantingDetails}
                      columns={[
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
                          body: (rowData: any) =>
                            formatThaiDate(rowData.yearOfTapping, "year"),
                          headerAlign: "center" as const,
                          bodyAlign: "center" as const,
                          style: { width: "10%" },
                        },
                        {
                          field: "monthOfTapping",
                          header: "เดือนที่เริ่มกรีด",
                          body: (rowData: any) =>
                            formatThaiDate(rowData.monthOfTapping, "month"),
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
                      ]}
                      loading={loading}
                      paginator={false}
                      emptyMessage="ไม่มีข้อมูลรายละเอียดการปลูก"
                      className="w-full"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    ไม่มีข้อมูลรายละเอียดการปลูก
                  </p>
                )}
              </div>
            </div>
          )}

          {!loading && !farmDetails && (
            <div className="text-center py-8 text-gray-500">
              ไม่พบข้อมูลสวนยางพารา
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 z-[10000]">
          <PrimaryButton
            label="ปิด"
            onClick={onClose}
            color="secondary"
            fullWidth
          ></PrimaryButton>
        </div>
      </div>
    </div>
  );
};
