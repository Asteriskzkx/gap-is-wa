-- CreateTable
CREATE TABLE "File" (
    "fileId" SERIAL NOT NULL,
    "tableReference" VARCHAR(100) NOT NULL,
    "idReference" INTEGER NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100),
    "url" VARCHAR(1024) NOT NULL,
    "size" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("fileId")
);

-- CreateIndex
CREATE INDEX "File_tableReference_idReference_idx" ON "File"("tableReference", "idReference");
