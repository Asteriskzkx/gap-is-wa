-- CreateTable
CREATE TABLE "Certificate" (
    "certificateId" SERIAL NOT NULL,
    "inspectionId" INTEGER NOT NULL,
    "pdfFileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("certificateId")
);

-- CreateTable
CREATE TABLE "CommitteeCertificate" (
    "committeeCertificateId" SERIAL NOT NULL,
    "committeeId" INTEGER NOT NULL,
    "certificateId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommitteeCertificate_pkey" PRIMARY KEY ("committeeCertificateId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_inspectionId_key" ON "Certificate"("inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeCertificate_committeeId_certificateId_key" ON "CommitteeCertificate"("committeeId", "certificateId");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("inspectionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeCertificate" ADD CONSTRAINT "CommitteeCertificate_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("committeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeCertificate" ADD CONSTRAINT "CommitteeCertificate_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate"("certificateId") ON DELETE RESTRICT ON UPDATE CASCADE;
