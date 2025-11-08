"use client";

import React, { useState, useEffect } from "react";
import { formStyles } from "@/styles/formStyles";
import { useFormStepper } from "@/hooks/useFormStepper";
import { useRubberFarmEditForm } from "@/hooks/useRubberFarmEditForm";
import { useThailandAddressForForm } from "@/hooks/useThailandAddressForForm";
import { StepIndicator } from "./farmer/StepIndicator";
import { FarmSelectionStep } from "./farmer/FarmSelectionStep";
import { FarmInfoStep } from "./farmer/FarmInfoStep";
import { PlantingDetailsStep } from "./farmer/PlantingDetailsStep";
import { EditConfirmationStep } from "./farmer/EditConfirmationStep";
import { AlertMessage } from "./farmer/AlertMessage";
import { PrimaryButton } from "./ui";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";

export default function RubberFarmEditForm() {
  const maxSteps = 4; // เพิ่มเป็น 4 steps: เลือกฟาร์ม, ข้อมูลฟาร์ม, รายละเอียดการปลูก, ยืนยัน
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Custom step labels for Edit Form
  const editFormStepLabels = [
    "เลือกสวนยาง",
    "ข้อมูลสวนยาง",
    "รายละเอียดการปลูก",
    "ยืนยันข้อมูล",
  ];

  // Custom Hooks
  const {
    rubberFarm,
    setRubberFarm,
    plantingDetails,
    farms,
    selectedFarmId,
    setSelectedFarmId,
    farmsPagination,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    multiSortMeta,
    setMultiSortMeta,
    isLoadingFarmData,
    updateFarmData,
    updatePlantingDetail,
    addPlantingDetail,
    removePlantingDetail,
    validateFarmData,
    validatePlantingDetails,
    fetchFarmerFarms,
    fetchFarmDetails,
    handleSubmit,
    isLoading,
    error,
    setError,
    success,
    farmerId,
  } = useRubberFarmEditForm();

  const { step, nextStep, prevStep, isFirstStep, isLastStep } =
    useFormStepper(maxSteps);

  const { provinces, amphures, tambons, isLoadingProvinces } =
    useThailandAddressForForm(rubberFarm.provinceId, rubberFarm.amphureId);

  // Fetch farm details when farm is selected
  useEffect(() => {
    if (selectedFarmId && provinces.length > 0 && !isLoadingProvinces) {
      const loadFarmDetails = async () => {
        const addressData = await fetchFarmDetails(selectedFarmId, provinces);
        // Address data will be handled by the hook
      };
      loadFarmDetails();
    }
  }, [selectedFarmId, provinces.length, isLoadingProvinces]);

  // Handler functions
  const handleNextStep = () => {
    if (step === 1 && !selectedFarmId) {
      setError("กรุณาเลือกสวนยางที่ต้องการแก้ไข");
      return;
    }
    if (step === 2 && !validateFarmData()) return;
    if (step === 3 && !validatePlantingDetails()) return;

    if (step < maxSteps) {
      nextStep();
      setError("");
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      prevStep();
      setError("");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

  // Handle page change for DataTable
  const onPageChange = (event: DataTablePageEvent) => {
    if (farmerId) {
      fetchFarmerFarms(farmerId, event.first, event.rows, {
        sortField,
        sortOrder:
          sortOrder === 1 ? "asc" : sortOrder === -1 ? "desc" : undefined,
        multiSortMeta: multiSortMeta.filter(
          (item) => item.order === 1 || item.order === -1
        ) as Array<{ field: string; order: number }>,
      });
    }
  };

  // Handle sort change
  const onSortChange = (event: DataTableSortEvent) => {
    if (event.multiSortMeta) {
      const validMultiSort = event.multiSortMeta.filter(
        (item) => item.order !== undefined
      ) as Array<{ field: string; order: 1 | -1 | 0 | null }>;
      setMultiSortMeta(validMultiSort);
      const validSortMeta = validMultiSort.filter(
        (item) => item.order === 1 || item.order === -1
      ) as Array<{ field: string; order: number }>;
      if (farmerId) {
        fetchFarmerFarms(
          farmerId,
          farmsPagination.first,
          farmsPagination.rows,
          {
            multiSortMeta: validSortMeta,
          }
        );
      }
    } else {
      setSortField(event.sortField);
      const validOrder = event.sortOrder !== undefined ? event.sortOrder : null;
      setSortOrder(validOrder);
      if (farmerId) {
        fetchFarmerFarms(
          farmerId,
          farmsPagination.first,
          farmsPagination.rows,
          {
            sortField: event.sortField,
            sortOrder: event.sortOrder === 1 ? "asc" : "desc",
          }
        );
      }
    }
  };

  return (
    <div className={formStyles.container}>
      {/* Header */}
      <div className={formStyles.header.wrapper}>
        <h1 className={formStyles.header.title}>แก้ไขข้อมูลสวนยางพารา</h1>
        <p className={formStyles.header.description}>
          แก้ไขข้อมูลสวนยางพาราและรายละเอียดการปลูกที่ได้รับการรับรองมาตรฐานจีเอพี
        </p>
      </div>

      {/* Step Progress Indicator */}
      <StepIndicator
        currentStep={step}
        maxSteps={maxSteps}
        stepLabels={editFormStepLabels}
      />

      {/* Error Message */}
      {error && <AlertMessage type="error" message={error} />}

      {/* Success Message */}
      {success && (
        <AlertMessage
          type="success"
          message="อัปเดตข้อมูลสำเร็จ กำลังนำคุณไปยังหน้าหลัก..."
        />
      )}

      <form onSubmit={handleFormSubmit}>
        {/* Step 1: Farm Selection */}
        {step === 1 && (
          <FarmSelectionStep
            farms={farms}
            selectedFarmId={selectedFarmId}
            onFarmSelect={setSelectedFarmId}
            isLoading={isLoading}
            farmsPagination={farmsPagination}
            multiSortMeta={multiSortMeta}
            onPageChange={onPageChange}
            onSortChange={onSortChange}
          />
        )}

        {/* Step 2: Farm Information */}
        {step === 2 && (
          <FarmInfoStep
            rubberFarm={rubberFarm}
            provinces={provinces}
            amphures={amphures}
            tambons={tambons}
            updateFarmData={updateFarmData}
            onLocationChange={handleLocationChange}
          />
        )}

        {/* Step 3: Planting Details */}
        {step === 3 && (
          <PlantingDetailsStep
            plantingDetails={plantingDetails}
            updatePlantingDetail={updatePlantingDetail}
            addPlantingDetail={addPlantingDetail}
            removePlantingDetail={removePlantingDetail}
          />
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <EditConfirmationStep
            rubberFarm={rubberFarm}
            plantingDetails={plantingDetails}
            isConfirmed={isConfirmed}
            onConfirmChange={setIsConfirmed}
          />
        )}

        {/* Navigation Buttons */}
        <div className={formStyles.navigation.wrapper}>
          {!isFirstStep ? (
            <PrimaryButton
              label="ย้อนกลับ"
              variant="outlined"
              color="secondary"
              icon="pi pi-arrow-left"
              onClick={handlePrevStep}
              type="button"
            />
          ) : (
            <div />
          )}

          {!isLastStep ? (
            <PrimaryButton
              label="ถัดไป"
              color="success"
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={handleNextStep}
              type="button"
            />
          ) : (
            <PrimaryButton
              label={isLoading ? "กำลังบันทึก..." : "บันทึกและส่งข้อมูล"}
              color="success"
              icon="pi pi-check"
              iconPos="right"
              type="submit"
              disabled={isLoading || success}
              loading={isLoading}
            />
          )}
        </div>
      </form>
    </div>
  );
}
