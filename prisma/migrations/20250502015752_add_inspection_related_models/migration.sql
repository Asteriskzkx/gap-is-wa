-- CreateTable
CREATE TABLE "Inspection" (
    "inspectionId" SERIAL NOT NULL,
    "inspectionNo" INTEGER NOT NULL,
    "inspectionDateAndTime" TIMESTAMP(3) NOT NULL,
    "inspectionType" TEXT NOT NULL,
    "inspectionStatus" TEXT NOT NULL,
    "inspectionResult" TEXT NOT NULL,
    "auditorChiefId" INTEGER NOT NULL,
    "rubberFarmId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("inspectionId")
);

-- CreateTable
CREATE TABLE "AuditorInspection" (
    "auditorInspectionId" SERIAL NOT NULL,
    "auditorId" INTEGER NOT NULL,
    "inspectionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditorInspection_pkey" PRIMARY KEY ("auditorInspectionId")
);

-- CreateTable
CREATE TABLE "InspectionItem" (
    "inspectionItemId" SERIAL NOT NULL,
    "inspectionId" INTEGER NOT NULL,
    "inspectionItemNo" INTEGER NOT NULL,
    "inspectionItemName" TEXT NOT NULL,
    "inspectionItemResult" TEXT NOT NULL,
    "otherConditions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionItem_pkey" PRIMARY KEY ("inspectionItemId")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "requirementId" SERIAL NOT NULL,
    "inspectionItemId" INTEGER NOT NULL,
    "requirementNo" INTEGER NOT NULL,
    "requirementName" TEXT NOT NULL,
    "requirementLevel" TEXT NOT NULL,
    "requirementLevelNo" TEXT NOT NULL,
    "evaluationResult" TEXT NOT NULL,
    "evaluationMethod" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("requirementId")
);

-- CreateTable
CREATE TABLE "DataRecord" (
    "dataRecordId" SERIAL NOT NULL,
    "inspectionId" INTEGER NOT NULL,
    "species" JSONB NOT NULL,
    "waterSystem" JSONB NOT NULL,
    "fertilizers" JSONB NOT NULL,
    "previouslyCultivated" JSONB NOT NULL,
    "plantDisease" JSONB NOT NULL,
    "relatedPlants" JSONB NOT NULL,
    "moreInfo" TEXT NOT NULL,
    "map" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataRecord_pkey" PRIMARY KEY ("dataRecordId")
);

-- CreateTable
CREATE TABLE "AdviceAndDefect" (
    "adviceAndDefectId" SERIAL NOT NULL,
    "inspectionId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "adviceList" JSONB NOT NULL,
    "defectList" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdviceAndDefect_pkey" PRIMARY KEY ("adviceAndDefectId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuditorInspection_auditorId_inspectionId_key" ON "AuditorInspection"("auditorId", "inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "DataRecord_inspectionId_key" ON "DataRecord"("inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "AdviceAndDefect_inspectionId_key" ON "AdviceAndDefect"("inspectionId");

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_auditorChiefId_fkey" FOREIGN KEY ("auditorChiefId") REFERENCES "Auditor"("auditorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_rubberFarmId_fkey" FOREIGN KEY ("rubberFarmId") REFERENCES "RubberFarm"("rubberFarmId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditorInspection" ADD CONSTRAINT "AuditorInspection_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "Auditor"("auditorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditorInspection" ADD CONSTRAINT "AuditorInspection_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("inspectionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionItem" ADD CONSTRAINT "InspectionItem_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("inspectionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_inspectionItemId_fkey" FOREIGN KEY ("inspectionItemId") REFERENCES "InspectionItem"("inspectionItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataRecord" ADD CONSTRAINT "DataRecord_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("inspectionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdviceAndDefect" ADD CONSTRAINT "AdviceAndDefect_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("inspectionId") ON DELETE CASCADE ON UPDATE CASCADE;
