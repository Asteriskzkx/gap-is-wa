import React from "react";
import { formStyles } from "@/styles/formStyles";

interface StepIndicatorProps {
  currentStep: number;
  maxSteps: number;
  stepLabels?: string[]; // Optional custom labels
}

const defaultStepLabels = ["ข้อมูลสวนยาง", "รายละเอียดการปลูก", "ยืนยันข้อมูล"];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  maxSteps,
  stepLabels = defaultStepLabels, // Use default if not provided
}) => {
  const getStepCircleClass = (step: number) => {
    const base = formStyles.stepIndicator.stepCircle.base;
    if (step === currentStep)
      return `${base} ${formStyles.stepIndicator.stepCircle.active}`;
    if (step < currentStep)
      return `${base} ${formStyles.stepIndicator.stepCircle.completed}`;
    return `${base} ${formStyles.stepIndicator.stepCircle.inactive}`;
  };

  const getStepLabelClass = (step: number) => {
    const base = formStyles.stepIndicator.stepLabel.base;
    if (step === currentStep)
      return `${base} ${formStyles.stepIndicator.stepLabel.active}`;
    if (step < currentStep)
      return `${base} ${formStyles.stepIndicator.stepLabel.completed}`;
    return `${base} ${formStyles.stepIndicator.stepLabel.inactive}`;
  };

  const getMobileStepCircleClass = (step: number) => {
    const base = formStyles.stepIndicator.mobileCircle.base;
    if (step === currentStep)
      return `${base} ${formStyles.stepIndicator.mobileCircle.active}`;
    if (step < currentStep)
      return `${base} ${formStyles.stepIndicator.mobileCircle.completed}`;
    return `${base} ${formStyles.stepIndicator.mobileCircle.inactive}`;
  };

  return (
    <div className="mb-8">
      {/* Desktop Version */}
      <div className="hidden md:block">
        <div className={formStyles.stepIndicator.stepContainer}>
          {Array.from({ length: maxSteps }, (_, i) => i + 1).map((s, index) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={getStepCircleClass(s)}>
                  {s < currentStep ? <i className="pi pi-check text-lg" /> : s}
                </div>

                <div className="mt-2 text-center">
                  <div className={getStepLabelClass(s)}>ขั้นตอนที่ {s}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stepLabels[index]}
                  </div>
                </div>
              </div>

              {index < maxSteps - 1 && (
                <div className="flex items-center flex-1 px-4">
                  <div
                    className={`h-1 w-full rounded-full transition-all duration-300 ${
                      s < currentStep ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            {Array.from({ length: maxSteps }, (_, i) => i + 1).map(
              (s, index) => (
                <React.Fragment key={s}>
                  <div className={getMobileStepCircleClass(s)}>
                    {s < currentStep ? (
                      <i className="pi pi-check text-xs" />
                    ) : (
                      s
                    )}
                  </div>
                  {index < maxSteps - 1 && (
                    <div
                      className={
                        s < currentStep
                          ? formStyles.stepIndicator.mobileProgressLine
                              .completed
                          : formStyles.stepIndicator.mobileProgressLine.inactive
                      }
                    />
                  )}
                </React.Fragment>
              )
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">
            ขั้นตอนที่ {currentStep}: {stepLabels[currentStep - 1]}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {currentStep} จาก {maxSteps} ขั้นตอน
          </div>
        </div>
      </div>
    </div>
  );
};
