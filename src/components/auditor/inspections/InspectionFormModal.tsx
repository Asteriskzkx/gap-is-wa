import React from "react";
import { FaTimes } from "react-icons/fa";
import { InspectionItemForm, type InspectionItem } from "./InspectionItemForm";
import PrimaryButton from "@/components/ui/PrimaryButton";

interface InspectionFormModalProps {
  show: boolean;
  onClose: () => void;
  inspectionItems: InspectionItem[];
  currentItemIndex: number;
  saving: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => Promise<void>;
  onSaveAll: () => Promise<void>;
  onComplete: () => Promise<void>;
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
  allRequiredFieldsFilled: boolean;
}

export const InspectionFormModal: React.FC<InspectionFormModalProps> = ({
  show,
  onClose,
  inspectionItems,
  currentItemIndex,
  saving,
  onPrevious,
  onNext,
  onSave,
  onSaveAll,
  onComplete,
  updateRequirementEvaluation,
  updateOtherConditions,
  renderAdditionalFields,
  allRequiredFieldsFilled,
}) => {
  if (!show) return null;

  const currentItem = inspectionItems[currentItemIndex];
  const isLastItem = currentItemIndex === inspectionItems.length - 1;
  const progress = ((currentItemIndex + 1) / inspectionItems.length) * 100;

  // แสดงเลขรายการตรวจและชื่อจาก inspectionItemMaster
  const itemNo =
    currentItem?.inspectionItemMaster?.itemNo || currentItemIndex + 1;
  const itemName = currentItem?.inspectionItemMaster?.itemName || "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              การตรวจประเมิน
            </h3>
            <p className="text-sm text-gray-500">
              รายการที่ {itemNo} จาก {inspectionItems.length}: {itemName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 text-center">
            {Math.round(progress)}% เสร็จสิ้น
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentItem ? (
            <InspectionItemForm
              item={currentItem}
              itemIndex={currentItemIndex}
              updateRequirementEvaluation={updateRequirementEvaluation}
              updateOtherConditions={updateOtherConditions}
              renderAdditionalFields={renderAdditionalFields}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              ไม่พบข้อมูลรายการตรวจ
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            {/* Previous Button - Always enabled */}
            <PrimaryButton
              label="ก่อนหน้า"
              icon="pi pi-chevron-left"
              onClick={onPrevious}
              color="secondary"
              className="w-full md:w-auto"
            />

            {/* Middle Buttons */}
            <PrimaryButton
              label={saving ? "กำลังบันทึก..." : "บันทึกหน้านี้"}
              icon="pi pi-save"
              onClick={onSave}
              disabled={saving}
              loading={saving}
              color="info"
              tooltip="บันทึกเฉพาะรายการตรวจหน้านี้"
              className="w-full md:w-auto"
            />

            <PrimaryButton
              label={saving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
              icon="pi pi-check-circle"
              onClick={onSaveAll}
              disabled={saving}
              loading={saving}
              color="success"
              variant="outlined"
              tooltip="บันทึกทุกรายการตรวจที่กรอกข้อมูลแล้ว"
              className="w-full md:w-auto"
            />

            {isLastItem && (
              <PrimaryButton
                label="จบการตรวจประเมิน"
                icon="pi pi-check"
                onClick={onComplete}
                disabled={saving || !allRequiredFieldsFilled}
                color="success"
                className="w-full md:w-auto"
                tooltip={
                  allRequiredFieldsFilled
                    ? undefined
                    : "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน"
                }
              />
            )}

            {/* Next Button */}
            <PrimaryButton
              label="ถัดไป"
              icon="pi pi-chevron-right"
              iconPos="right"
              onClick={onNext}
              disabled={isLastItem}
              color="secondary"
              className="w-full md:w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
