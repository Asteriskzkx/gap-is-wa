import React from "react";
import { formStyles } from "@/styles/formStyles";

interface Props {
  readonly currentStep: number;
  readonly maxSteps?: number;
  readonly labels?: string[];
}

const defaultLabels = ["เลือกการตรวจ", "ออกใบรับรอง"];

export default function CertificationStepIndicator({
  currentStep,
  maxSteps = 2,
  labels = defaultLabels,
}: Props) {
  const getCircle = (s: number) => {
    const base = formStyles.stepIndicator.stepCircle.base;
    if (s === currentStep)
      return `${base} ${formStyles.stepIndicator.stepCircle.active}`;
    if (s < currentStep)
      return `${base} ${formStyles.stepIndicator.stepCircle.completed}`;
    return `${base} ${formStyles.stepIndicator.stepCircle.inactive}`;
  };

  const getLabel = (s: number) => {
    const base = formStyles.stepIndicator.stepLabel.base;
    if (s === currentStep)
      return `${base} ${formStyles.stepIndicator.stepLabel.active}`;
    if (s < currentStep)
      return `${base} ${formStyles.stepIndicator.stepLabel.completed}`;
    return `${base} ${formStyles.stepIndicator.stepLabel.inactive}`;
  };

  const getMobileCircle = (s: number) => {
    const base = formStyles.stepIndicator.mobileCircle.base;
    if (s === currentStep)
      return `${base} ${formStyles.stepIndicator.mobileCircle.active}`;
    if (s < currentStep)
      return `${base} ${formStyles.stepIndicator.mobileCircle.completed}`;
    return `${base} ${formStyles.stepIndicator.mobileCircle.inactive}`;
  };

  return (
    <div className="mb-6">
      {/* Desktop Version */}
      <div className="hidden md:block">
        <div className={formStyles.stepIndicator.stepContainer}>
          {Array.from({ length: maxSteps }, (_, i) => i + 1).map((s, idx) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={getCircle(s)}>
                  {s < currentStep ? <i className="pi pi-check text-lg" /> : s}
                </div>
                <div className="mt-2 text-center">
                  <div className={getLabel(s)}>ขั้นตอนที่ {s}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {labels[idx]}
                  </div>
                </div>
              </div>
              {idx < maxSteps - 1 && (
                <div className={formStyles.stepIndicator.progressLine.base}>
                  <div
                    className={`${formStyles.stepIndicator.progressLine.bar} ${
                      s < currentStep
                        ? formStyles.stepIndicator.progressLine.completed
                        : formStyles.stepIndicator.progressLine.inactive
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
            {Array.from({ length: maxSteps }, (_, i) => i + 1).map((s, idx) => (
              <React.Fragment key={s}>
                <div className={getMobileCircle(s)}>
                  {s < currentStep ? <i className="pi pi-check text-xs" /> : s}
                </div>
                {idx < maxSteps - 1 && (
                  <div
                    className={
                      s < currentStep
                        ? formStyles.stepIndicator.mobileProgressLine.completed
                        : formStyles.stepIndicator.mobileProgressLine.inactive
                    }
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">
            ขั้นตอนที่ {currentStep}: {labels[currentStep - 1]}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {currentStep} จาก {maxSteps} ขั้นตอน
          </div>
        </div>
      </div>
    </div>
  );
}
