import { PrimaryButton } from "@/components/ui";
import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
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
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mx-auto"></div>
              <p className="mt-3 text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          ) : farmDetails ? (
            <div className="space-y-6">
              {/* ข้อมูลทั่วไป */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  ที่ตั้งสวนยาง
                </h4>
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
                </div>
              </div>

              {/* รายละเอียดการปลูก */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  รายละเอียดการปลูก
                </h4>
                {farmDetails.plantingDetails &&
                farmDetails.plantingDetails.length > 0 ? (
                  <div className="space-y-4">
                    {farmDetails.plantingDetails.map((detail, index) => (
                      <div
                        key={detail.plantingDetailId}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <p className="font-medium text-gray-900 mb-3">
                          แปลงที่ {index + 1}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">พันธุ์ยางพารา:</p>
                            <p className="font-medium">{detail.specie}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">พื้นที่แปลง (ไร่):</p>
                            <p className="font-medium">{detail.areaOfPlot}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">จำนวนต้น:</p>
                            <p className="font-medium">
                              {detail.numberOfRubber}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">จำนวนต้นที่กรีด:</p>
                            <p className="font-medium">
                              {detail.numberOfTapping}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">อายุยางพารา (ปี):</p>
                            <p className="font-medium">{detail.ageOfRubber}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">
                              ปริมาณผลผลิต (กก./ปี):
                            </p>
                            <p className="font-medium">
                              {detail.totalProduction}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    ไม่มีข้อมูลรายละเอียดการปลูก
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              ไม่พบข้อมูลสวนยางพารา
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
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
