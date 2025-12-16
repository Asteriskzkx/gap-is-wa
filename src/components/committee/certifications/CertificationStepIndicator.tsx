import React from "react";
import { formStyles } from "@/styles/formStyles";

interface Props {
  readonly currentStep: number;
  readonly maxSteps: number;
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

  return (
    <div className="mb-6">
      <div className={formStyles.stepIndicator.desktopWrapper}>
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
    </div>
  );
}
