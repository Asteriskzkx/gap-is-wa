"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/ui";
import { useRubberFarmForm } from "@/hooks/useRubberFarmForm";
import { useFormStepper } from "@/hooks/useFormStepper";
import { useThailandAddressForForm } from "@/hooks/useThailandAddressForForm";
import { useAddressSync } from "@/hooks/useAddressSync";
import { StepIndicator } from "@/components/farmer/StepIndicator";
import { AlertMessage } from "@/components/farmer/AlertMessage";
import { FarmInfoStep } from "@/components/farmer/FarmInfoStep";
import { PlantingDetailsStep } from "@/components/farmer/PlantingDetailsStep";
import { ConfirmationStep } from "@/components/farmer/ConfirmationStep";
import { formStyles } from "@/styles/formStyles";

export default function RubberFarmRegistrationForm() {
  const router = useRouter();
  const maxSteps = 3;

  // Custom Hooks
  const {
    rubberFarm,
    setRubberFarm,
    plantingDetails,
    updateFarmData,
    updatePlantingDetail,
    addPlantingDetail,
    removePlantingDetail,
    validateFarmData,
    validatePlantingDetails,
    handleSubmit,
    isLoading,
    error,
    setError,
    success,
    isConfirmed,
    setIsConfirmed,
  } = useRubberFarmForm();

  const { step, nextStep, prevStep, isFirstStep, isLastStep } =
    useFormStepper(maxSteps);

  const { provinces, amphures, tambons } = useThailandAddressForForm(
    rubberFarm.provinceId,
    rubberFarm.amphureId
  );

  // Sync address names when IDs change
  useAddressSync(rubberFarm, setRubberFarm, provinces, amphures, tambons);

  // Handler functions
  const handleNextStep = () => {
    if (step === 1 && !validateFarmData()) return;
    if (step === 2 && !validatePlantingDetails()) return;

    setError(""); // Clear error before moving to next step
    if (step < maxSteps) {
      nextStep();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      // Reset confirmation checkbox when leaving step 3
      if (step === 3) {
        setIsConfirmed(false);
      }
      prevStep();
      setError("");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ตรวจสอบว่าได้ tick checkbox ยืนยันข้อมูลแล้วหรือยัง
    if (!isConfirmed) {
      setError("กรุณายืนยันความถูกต้องของข้อมูลก่อนส่ง");
      return;
    }

    await handleSubmit();
  };

  const handleLocationChange = (location: {
    type: string;
    coordinates: [number, number];
  }) => {
    setRubberFarm({
      ...rubberFarm,
      location,
    });
  };

  return (
    <div className={formStyles.container}>
      {/* Header */}
      <div className={formStyles.header.wrapper}>
        <h1 className={formStyles.header.title}>ยื่นขอใบรับรองแหล่งผลิต</h1>
        <p className={formStyles.header.description}>
          กรอกข้อมูลสวนยางพาราและรายละเอียดการปลูกเพื่อขอรับรองมาตรฐานจีเอพี
        </p>
      </div>

      {/* Step Progress Indicator */}
      <StepIndicator currentStep={step} maxSteps={maxSteps} />

      {/* Error Message */}
      {error && <AlertMessage type="error" message={error} />}

      {/* Success Message */}
      {success && (
        <AlertMessage
          type="success"
          message="บันทึกข้อมูลสำเร็จ กำลังนำคุณไปยังหน้าติดตามสถานะ..."
        />
      )}

      <form onSubmit={handleFormSubmit}>
        {/* Step 1: ข้อมูลสวนยาง */}
        {step === 1 && (
          <FarmInfoStep
            rubberFarm={rubberFarm}
            provinces={provinces}
            amphures={amphures}
            tambons={tambons}
            updateFarmData={updateFarmData}
            onLocationChange={handleLocationChange}
            isEditMode={false}
          />
        )}

        {/* Step 2: รายละเอียดการปลูก */}
        {step === 2 && (
          <PlantingDetailsStep
            plantingDetails={plantingDetails}
            updatePlantingDetail={updatePlantingDetail}
            addPlantingDetail={addPlantingDetail}
            removePlantingDetail={removePlantingDetail}
          />
        )}

        {/* Step 3: ยืนยันข้อมูล */}
        {step === 3 && (
          <ConfirmationStep
            rubberFarm={rubberFarm}
            plantingDetails={plantingDetails}
            isConfirmed={isConfirmed}
            onConfirmChange={setIsConfirmed}
          />
        )}

        {/* Navigation Buttons */}
        <div className={formStyles.navigation.wrapper}>
          {isFirstStep ? (
            <PrimaryButton
              label="กลับไปหน้าหลัก"
              variant="outlined"
              color="secondary"
              icon="pi pi-arrow-left"
              type="button"
              onClick={() => router.push("/farmer/dashboard")}
            />
          ) : (
            <PrimaryButton
              label="ย้อนกลับ"
              variant="outlined"
              icon="pi pi-arrow-left"
              type="button"
              onClick={handlePrevStep}
            />
          )}

          {isLastStep ? (
            <PrimaryButton
              label="ยืนยันและส่งข้อมูล"
              color="success"
              type="submit"
              disabled={isLoading || success}
            />
          ) : (
            <PrimaryButton
              label="ถัดไป"
              color="success"
              icon="pi pi-arrow-right"
              iconPos="right"
              type="button"
              onClick={handleNextStep}
            />
          )}
        </div>
      </form>
    </div>
  );
}
