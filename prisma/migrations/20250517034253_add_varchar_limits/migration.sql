/*
  Warnings:

  - You are about to alter the column `namePrefix` on the `Admin` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `firstName` on the `Admin` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `Admin` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `namePrefix` on the `Auditor` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `firstName` on the `Auditor` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `Auditor` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `pdfFileUrl` on the `Certificate` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `namePrefix` on the `Committee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `firstName` on the `Committee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `Committee` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `moreInfo` on the `DataRecord` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `namePrefix` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `firstName` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `identificationNumber` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(13)`.
  - You are about to alter the column `gender` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `houseNo` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `villageName` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `road` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `alley` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `subDistrict` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `district` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `provinceName` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `zipCode` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(5)`.
  - You are about to alter the column `phoneNumber` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `mobilePhoneNumber` on the `Farmer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `inspectionType` on the `Inspection` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `inspectionStatus` on the `Inspection` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `inspectionResult` on the `Inspection` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `inspectionItemName` on the `InspectionItem` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `inspectionItemResult` on the `InspectionItem` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `specie` on the `PlantingDetail` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `requirementName` on the `Requirement` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `requirementLevel` on the `Requirement` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `requirementLevelNo` on the `Requirement` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `evaluationResult` on the `Requirement` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `evaluationMethod` on the `Requirement` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `note` on the `Requirement` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `villageName` on the `RubberFarm` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `road` on the `RubberFarm` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `alley` on the `RubberFarm` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `subDistrict` on the `RubberFarm` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `district` on the `RubberFarm` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `province` on the `RubberFarm` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `hashedPassword` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(60)`.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.

*/
-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "namePrefix" SET DATA TYPE VARCHAR(25),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Auditor" ALTER COLUMN "namePrefix" SET DATA TYPE VARCHAR(25),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Certificate" ALTER COLUMN "pdfFileUrl" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Committee" ALTER COLUMN "namePrefix" SET DATA TYPE VARCHAR(25),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "DataRecord" ALTER COLUMN "moreInfo" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Farmer" ALTER COLUMN "namePrefix" SET DATA TYPE VARCHAR(25),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "identificationNumber" SET DATA TYPE VARCHAR(13),
ALTER COLUMN "gender" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "houseNo" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "villageName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "road" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "alley" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "subDistrict" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "district" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "provinceName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "zipCode" SET DATA TYPE VARCHAR(5),
ALTER COLUMN "phoneNumber" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "mobilePhoneNumber" SET DATA TYPE VARCHAR(10);

-- AlterTable
ALTER TABLE "Inspection" ALTER COLUMN "inspectionType" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "inspectionStatus" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "inspectionResult" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "InspectionItem" ALTER COLUMN "inspectionItemName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "inspectionItemResult" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "PlantingDetail" ALTER COLUMN "specie" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Requirement" ALTER COLUMN "requirementName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "requirementLevel" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "requirementLevelNo" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "evaluationResult" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "evaluationMethod" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "note" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "RubberFarm" ALTER COLUMN "villageName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "road" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "alley" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "subDistrict" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "district" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "province" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "hashedPassword" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(200);
