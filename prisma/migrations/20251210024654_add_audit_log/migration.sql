-- CreateTable
CREATE TABLE "AuditLog" (
    "auditLogId" SERIAL NOT NULL,
    "tableName" VARCHAR(100) NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "recordId" INTEGER NOT NULL,
    "userId" INTEGER,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("auditLogId")
);

-- CreateIndex
CREATE INDEX "AuditLog_tableName_recordId_idx" ON "AuditLog"("tableName", "recordId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
