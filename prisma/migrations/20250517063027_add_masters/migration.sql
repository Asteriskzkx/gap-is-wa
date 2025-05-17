/*
  Warnings:

  - You are about to drop the column `inspectionType` on the `Inspection` table. All the data in the column will be lost.
  - You are about to drop the column `inspectionItemName` on the `InspectionItem` table. All the data in the column will be lost.
  - You are about to drop the column `requirementLevel` on the `Requirement` table. All the data in the column will be lost.
  - You are about to drop the column `requirementLevelNo` on the `Requirement` table. All the data in the column will be lost.
  - You are about to drop the column `requirementName` on the `Requirement` table. All the data in the column will be lost.
  - Added the required column `inspectionTypeId` to the `Inspection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inspectionItemMasterId` to the `InspectionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requirementMasterId` to the `Requirement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inspection" DROP COLUMN "inspectionType",
ADD COLUMN     "inspectionTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "InspectionItem" DROP COLUMN "inspectionItemName",
ADD COLUMN     "inspectionItemMasterId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Requirement" DROP COLUMN "requirementLevel",
DROP COLUMN "requirementLevelNo",
DROP COLUMN "requirementName",
ADD COLUMN     "requirementMasterId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "InspectionTypeMaster" (
    "inspectionTypeId" SERIAL NOT NULL,
    "typeName" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionTypeMaster_pkey" PRIMARY KEY ("inspectionTypeId")
);

-- CreateTable
CREATE TABLE "InspectionItemMaster" (
    "inspectionItemId" SERIAL NOT NULL,
    "inspectionTypeId" INTEGER NOT NULL,
    "itemNo" INTEGER NOT NULL,
    "itemName" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionItemMaster_pkey" PRIMARY KEY ("inspectionItemId")
);

-- CreateTable
CREATE TABLE "RequirementMaster" (
    "requirementId" SERIAL NOT NULL,
    "inspectionItemId" INTEGER NOT NULL,
    "requirementNo" INTEGER NOT NULL,
    "requirementName" VARCHAR(255) NOT NULL,
    "requirementLevel" VARCHAR(50) NOT NULL,
    "requirementLevelNo" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequirementMaster_pkey" PRIMARY KEY ("requirementId")
);

-- AddForeignKey
ALTER TABLE "InspectionItemMaster" ADD CONSTRAINT "InspectionItemMaster_inspectionTypeId_fkey" FOREIGN KEY ("inspectionTypeId") REFERENCES "InspectionTypeMaster"("inspectionTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementMaster" ADD CONSTRAINT "RequirementMaster_inspectionItemId_fkey" FOREIGN KEY ("inspectionItemId") REFERENCES "InspectionItemMaster"("inspectionItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_inspectionTypeId_fkey" FOREIGN KEY ("inspectionTypeId") REFERENCES "InspectionTypeMaster"("inspectionTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionItem" ADD CONSTRAINT "InspectionItem_inspectionItemMasterId_fkey" FOREIGN KEY ("inspectionItemMasterId") REFERENCES "InspectionItemMaster"("inspectionItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_requirementMasterId_fkey" FOREIGN KEY ("requirementMasterId") REFERENCES "RequirementMaster"("requirementId") ON DELETE RESTRICT ON UPDATE CASCADE;
