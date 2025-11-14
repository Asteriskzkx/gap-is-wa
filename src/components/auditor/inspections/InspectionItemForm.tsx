import React from "react";
import PrimaryDropdown from "@/components/ui/PrimaryDropdown";

export interface Requirement {
  requirementId: number;
  requirementNo: number;
  evaluationResult: string;
  evaluationMethod: string;
  note: string;
  version?: number;
  requirementMaster?: {
    requirementName: string;
    requirementLevel: string;
    requirementLevelNo: string;
  };
}

export interface InspectionItem {
  inspectionItemId: number;
  inspectionId: number;
  inspectionItemMasterId: number;
  inspectionItemNo: number;
  inspectionItemResult: string;
  otherConditions: any;
  version?: number;
  inspectionItemMaster?: {
    itemNo: number;
    itemName: string;
  };
  requirements?: Requirement[];
}

interface InspectionItemFormProps {
  item: InspectionItem;
  itemIndex: number;
  updateRequirementEvaluation: (
    itemIndex: number,
    requirementIndex: number,
    field: string,
    value: string
  ) => void;
  updateOtherConditions: (
    itemIndex: number,
    field: string,
    value: string
  ) => void;
  renderAdditionalFields: (itemIndex: number) => React.ReactNode;
}

export const InspectionItemForm: React.FC<InspectionItemFormProps> = ({
  item,
  itemIndex,
  updateRequirementEvaluation,
  updateOtherConditions,
  renderAdditionalFields,
}) => {
  return (
    <div className="space-y-6">
      {/* รายการตรวจ */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          รายการตรวจที่ {item.inspectionItemMaster?.itemNo || "N/A"}:{" "}
          {item.inspectionItemMaster?.itemName || "ไม่มีชื่อ"}
        </h3>
      </div>

      {/* ข้อมูลเพิ่มเติม */}
      {renderAdditionalFields(itemIndex)}

      {/* ข้อกำหนด */}
      {item.requirements && item.requirements.length > 0 ? (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">ข้อกำหนด:</h4>
          {item.requirements.map((req, reqIndex) => (
            <div
              key={req.requirementId}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {req.requirementMaster?.requirementLevelNo ||
                    req.requirementNo}
                  . {req.requirementMaster?.requirementName || "ไม่มีชื่อ"}
                </p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded ${
                    req.requirementMaster?.requirementLevel === "ต้อง"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {req.requirementMaster?.requirementLevel || "N/A"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ผลการตรวจประเมิน */}
                <div>
                  <label
                    htmlFor={`eval-result-${req.requirementId}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ผลการตรวจประเมิน <span className="text-red-500">*</span>
                  </label>
                  <PrimaryDropdown
                    id={`eval-result-${req.requirementId}`}
                    value={req.evaluationResult}
                    options={[
                      { label: "ใช่ (ผ่าน)", value: "ใช่" },
                      { label: "ไม่ใช่ (ไม่ผ่าน)", value: "ไม่ใช่" },
                      { label: "ไม่เกี่ยวข้อง (NA)", value: "N/A" },
                    ]}
                    onChange={(value) =>
                      updateRequirementEvaluation(
                        itemIndex,
                        reqIndex,
                        "evaluationResult",
                        value
                      )
                    }
                    placeholder="เลือกผลการตรวจประเมิน"
                  />
                </div>

                {/* วิธีการตรวจประเมิน */}
                <div>
                  <label
                    htmlFor={`eval-method-${req.requirementId}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    วิธีการตรวจประเมิน <span className="text-red-500">*</span>
                  </label>
                  <PrimaryDropdown
                    id={`eval-method-${req.requirementId}`}
                    value={req.evaluationMethod}
                    options={[
                      { label: "พินิจ", value: "พินิจ" },
                      { label: "สัมภาษณ์", value: "สัมภาษณ์" },
                    ]}
                    onChange={(value) =>
                      updateRequirementEvaluation(
                        itemIndex,
                        reqIndex,
                        "evaluationMethod",
                        value
                      )
                    }
                    placeholder="เลือกวิธีการตรวจประเมิน"
                  />
                </div>
              </div>

              {/* หมายเหตุ */}
              <div className="mt-4">
                <label
                  htmlFor={`note-${req.requirementId}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  หมายเหตุ
                </label>
                <textarea
                  id={`note-${req.requirementId}`}
                  value={req.note || ""}
                  onChange={(e) =>
                    updateRequirementEvaluation(
                      itemIndex,
                      reqIndex,
                      "note",
                      e.target.value
                    )
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="เพิ่มหมายเหตุ (ถ้ามี)"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          ไม่มีข้อกำหนดสำหรับรายการตรวจนี้
        </div>
      )}
    </div>
  );
};
