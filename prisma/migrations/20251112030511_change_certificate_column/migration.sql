/*
  Warnings:

  - You are about to drop the column `pdfFileUrl` on the `Certificate` table. All the data in the column will be lost.
  - Added the required column `expiryDate` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "pdfFileUrl",
ADD COLUMN     "activeFlag" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cancelRequestFlag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiryDate" TIMESTAMP(3) NOT NULL;
