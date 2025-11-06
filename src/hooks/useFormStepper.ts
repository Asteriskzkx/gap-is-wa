import { useState } from "react";

export const useFormStepper = (maxSteps: number) => {
  const [step, setStep] = useState(1);

  const nextStep = () => {
    if (step < maxSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= maxSteps) {
      setStep(stepNumber);
    }
  };

  return {
    step,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep: step === 1,
    isLastStep: step === maxSteps,
    maxSteps,
  };
};
