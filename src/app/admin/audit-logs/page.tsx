"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import PrimaryAutoComplete from "@/components/ui/PrimaryAutoComplete";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";
import PrimaryInputNumber from "@/components/ui/PrimaryInputNumber";
import { useAdminAuditLogs } from "@/hooks/useAdminAuditLogs";
import { CONTAINER, HEADER, SPACING } from "@/styles/auditorClasses";
import { Dialog } from "primereact/dialog";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const ActionCell = ({ action }: { action: string }) => {
  const colorMap: Record<string, string> = {
    CREATE: "text-green-600 font-semibold",
    UPDATE: "text-blue-600 font-semibold",
    DELETE: "text-red-600 font-semibold",
  };
  const labelMap: Record<string, string> = {
    CREATE: "เพิ่มข้อมูล (CREATE)",
    UPDATE: "แก้ไขข้อมูล (UPDATE)",
    DELETE: "ลบข้อมูล (DELETE)",
  };
  return (
    <span className={colorMap[action] || ""}>{labelMap[action] || action}</span>
  );
};

const TableNameCell = ({ tableName }: { tableName: string }) => {
  const tableLabelMap: Record<string, string> = {
    User: "ผู้ใช้ (User)",
    Farmer: "เกษตรกร (Farmer)",
    Auditor: "ผู้ตรวจประเมิน (Auditor)",
    Committee: "คณะกรรมการ (Committee)",
    Admin: "ผู้ดูแลระบบ (Admin)",
    RubberFarm: "แปลงสวนยางพารา (RubberFarm)",
    PlantingDetail: "รายละเอียดการปลูก (PlantingDetail)",
    Inspection: "การตรวจประเมิน (Inspection)",
    DataRecord: "ข้อมูลประจำสวนยาง (DataRecord)",
    AdviceAndDefect: "การให้คำปรึกษาและข้อบกพร่อง (AdviceAndDefect)",
    Certificate: "ใบรับรอง (Certificate)",
  };
  return <>{tableLabelMap[tableName] || tableName}</>;
};

export default function AuditLogsPage() {
  const {
    items,
    loading,
    totalRecords,
    lazyParams,
    tableName,
    setTableName,
    recordId,
    setRecordId,
    userId,
    setUserId,
    action,
    setAction,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    applyFilters,
    clearFilters,
    handlePageChange,
    handleSort,
    deleteOldLogs,
    countOldLogs,
  } = useAdminAuditLogs(10);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number | null>(90);
  const [estimatedCount, setEstimatedCount] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDeleteDialog = async () => {
    setShowDeleteDialog(true);
    if (selectedDays) {
      const count = await countOldLogs(selectedDays);
      setEstimatedCount(count);
    }
  };

  const handleDaysChange = async (value: number | null) => {
    setSelectedDays(value);
    if (value) {
      const count = await countOldLogs(value);
      setEstimatedCount(count);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDays) {
      toast.error("กรุณาระบุจำนวนวัน");
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteOldLogs(selectedDays);
      if (result.success) {
        toast.success(
          `ลบข้อมูลเก่าที่เก่ากว่า ${selectedDays} วันสำเร็จ (ลบไปทั้งหมด ${result.deletedCount} รายการ)`
        );
        setShowDeleteDialog(false);
      } else {
        toast.error("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Error deleting old logs:", error);
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setIsDeleting(false);
    }
  };

  // Table name options
  const tableNameOptions = useMemo(
    () => [
      { label: "ผู้ใช้ (User)", value: "User" },
      { label: "เกษตรกร (Farmer)", value: "Farmer" },
      { label: "ผู้ตรวจประเมิน (Auditor)", value: "Auditor" },
      { label: "คณะกรรมการ (Committee)", value: "Committee" },
      { label: "ผู้ดูแลระบบ (Admin)", value: "Admin" },
      { label: "แปลงสวนยางพารา (RubberFarm)", value: "RubberFarm" },
      { label: "รายละเอียดการปลูก (PlantingDetail)", value: "PlantingDetail" },
      { label: "การตรวจประเมิน (Inspection)", value: "Inspection" },
      { label: "ข้อมูลประจำสวนยาง (DataRecord)", value: "DataRecord" },
      {
        label: "การให้คำปรึกษาและข้อบกพร่อง (AdviceAndDefect)",
        value: "AdviceAndDefect",
      },
      { label: "ใบรับรอง (Certificate)", value: "Certificate" },
    ],
    []
  );

  // Action options
  const actionOptions = useMemo(
    () => [
      { label: "เพิ่มข้อมูล (CREATE)", value: "CREATE" },
      { label: "แก้ไขข้อมูล (UPDATE)", value: "UPDATE" },
      { label: "ลบข้อมูล (DELETE)", value: "DELETE" },
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        field: "auditLogId",
        header: "รหัส",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        style: { width: "9%" },
      },
      {
        field: "tableName",
        header: "ตาราง",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        body: (r: any) => <TableNameCell tableName={r.tableName} />,
        style: { width: "32%" },
      },
      {
        field: "action",
        header: "การดำเนินการ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        body: (r: any) => <ActionCell action={r.action} />,
        style: { width: "17%" },
      },
      {
        field: "recordId",
        header: "รหัสข้อมูลในตาราง",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        style: { width: "16%" },
      },
      {
        field: "userId",
        header: "รหัสผู้ใช้",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (r: any) => r.userId ?? "-",
        style: { width: "11%" },
      },
      //   {
      //     field: "oldData",
      //     header: "ข้อมูลเก่า",
      //     sortable: false,
      //     headerAlign: "center" as const,
      //     bodyAlign: "left" as const,
      //     body: (r: any) =>
      //       r.oldData ? (
      //         <pre className="text-xs overflow-auto max-w-xs">
      //           {JSON.stringify(r.oldData, null, 2)}
      //         </pre>
      //       ) : (
      //         "-"
      //       ),
      //     style: { width: "20%" },
      //   },
      //   {
      //     field: "newData",
      //     header: "ข้อมูลใหม่",
      //     sortable: false,
      //     headerAlign: "center" as const,
      //     bodyAlign: "left" as const,
      //     body: (r: any) =>
      //       r.newData ? (
      //         <pre className="text-xs overflow-auto max-w-xs">
      //           {JSON.stringify(r.newData, null, 2)}
      //         </pre>
      //       ) : (
      //         "-"
      //       ),
      //     style: { width: "20%" },
      //   },
      {
        field: "createdAt",
        header: "วันที่ดำเนินการ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (r: any) =>
          r.createdAt
            ? new Date(r.createdAt).toLocaleString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
        style: { width: "15%" },
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className={CONTAINER.page}>
        <div className={SPACING.mb8}>
          <h1 className={HEADER.title}>ตรวจสอบเหตุการณ์ในระบบ</h1>
          <p className={HEADER.subtitle}>
            ตรวจสอบความเคลื่อนไหวและกิจกรรมต่างๆ ในระบบ
          </p>
        </div>

        <div className={CONTAINER.card}>
          <div className={CONTAINER.cardPadding}>
            {/* Filters */}
            <div className={SPACING.mb6}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <div className="w-full">
                  <label
                    htmlFor="tableName"
                    className="block text-sm  text-gray-600 mb-1"
                  >
                    ตาราง
                  </label>
                  <PrimaryAutoComplete
                    id="tableName"
                    value={tableName}
                    options={tableNameOptions}
                    onChange={setTableName}
                    placeholder="เลือกตาราง"
                  />
                </div>

                <div className="w-full">
                  <label
                    htmlFor="recordId"
                    className="block text-sm  text-gray-600 mb-1"
                  >
                    รหัสข้อมูลในตาราง
                  </label>
                  <PrimaryInputNumber
                    id="recordId"
                    value={recordId}
                    onChange={setRecordId}
                    placeholder="ระบุรหัสข้อมูลในตาราง"
                    min={0}
                    maxFractionDigits={0}
                  />
                </div>

                <div className="w-full">
                  <label
                    htmlFor="userId"
                    className="block text-sm  text-gray-600 mb-1"
                  >
                    รหัสผู้ใช้
                  </label>
                  <PrimaryInputNumber
                    id="userId"
                    value={userId}
                    onChange={setUserId}
                    placeholder="ระบุรหัสผู้ใช้"
                    min={0}
                    maxFractionDigits={0}
                  />
                </div>

                <div className="w-full">
                  <label
                    htmlFor="action"
                    className="block text-sm  text-gray-600 mb-1"
                  >
                    การดำเนินการ
                  </label>
                  <PrimaryAutoComplete
                    id="action"
                    value={action}
                    options={actionOptions}
                    onChange={setAction}
                    placeholder="เลือกการดำเนินการ"
                  />
                </div>

                <div className="w-full">
                  <label
                    htmlFor="fromDate"
                    className="block text-sm  text-gray-600 mb-1"
                  >
                    วันที่เริ่มต้น
                  </label>
                  <PrimaryCalendar
                    id="fromDate"
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="เลือกวันที่เริ่มต้น"
                  />
                </div>

                <div className="w-full">
                  <label
                    htmlFor="toDate"
                    className="block text-sm  text-gray-600 mb-1"
                  >
                    วันที่สิ้นสุด
                  </label>
                  <PrimaryCalendar
                    id="toDate"
                    value={endDate}
                    onChange={setEndDate}
                    placeholder="เลือกวันที่สิ้นสุด"
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <div className="pr-3">
                  <PrimaryButton
                    label="ล้างข้อมูลเก่า"
                    icon="pi pi-trash"
                    onClick={handleOpenDeleteDialog}
                    color="danger"
                  />
                </div>
                <div className="flex gap-3">
                  <PrimaryButton
                    label="ค้นหา"
                    icon="pi pi-search"
                    onClick={applyFilters}
                  />
                  <PrimaryButton
                    label="ล้างตัวกรอง"
                    icon="pi pi-refresh"
                    onClick={clearFilters}
                    color="secondary"
                  />
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div>
              <PrimaryDataTable
                value={items}
                columns={columns}
                loading={loading}
                lazy
                paginator
                rows={lazyParams.rows}
                totalRecords={totalRecords}
                first={lazyParams.first}
                onPage={handlePageChange}
                onSort={handleSort}
                sortField={lazyParams.sortField}
                sortOrder={lazyParams.sortOrder}
                sortMode="multiple"
                multiSortMeta={lazyParams.multiSortMeta}
                rowsPerPageOptions={[10, 25, 50]}
                dataKey="auditLogId"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Old Logs Dialog */}
      <Dialog
        header="ล้างข้อมูลเก่า"
        visible={showDeleteDialog}
        style={{ width: "500px" }}
        onHide={() => setShowDeleteDialog(false)}
        footer={
          <div className="flex justify-end gap-2">
            <PrimaryButton
              label="ยกเลิก"
              icon="pi pi-times"
              onClick={() => setShowDeleteDialog(false)}
              color="secondary"
              outlined
              disabled={isDeleting}
            />
            <PrimaryButton
              label="ยืนยันการลบ"
              icon="pi pi-check"
              onClick={handleConfirmDelete}
              color="danger"
              loading={isDeleting}
              disabled={!selectedDays || estimatedCount === 0}
            />
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="pi pi-exclamation-triangle text-yellow-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>คำเตือน:</strong> การลบข้อมูลเก่า จะไม่สามารถกู้คืนได้
                  กรุณาพิจารณาอย่างรอบคอบก่อนดำเนินการ
                </p>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="deleteDays"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              ลบข้อมูลที่เก่ากว่า (วัน)
            </label>
            <PrimaryInputNumber
              id="deleteDays"
              value={selectedDays}
              onChange={handleDaysChange}
              placeholder="ระบุจำนวนวัน"
              min={1}
              max={3650}
            />
            <p className="mt-1 text-sm text-gray-500">
              ตัวอย่าง: 90 = ลบข้อมูลที่เก่ากว่า 90 วัน (เก็บไว้แค่ 90
              วันล่าสุด)
            </p>
          </div>

          {selectedDays && estimatedCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">
                <strong>จำนวนที่จะถูกลบ:</strong>{" "}
                <span className="text-lg font-bold">{estimatedCount}</span>{" "}
                รายการ
              </p>
              <p className="text-xs text-red-600 mt-1">
                ข้อมูลที่สร้างก่อนวันที่{" "}
                {new Date(
                  Date.now() - selectedDays * 24 * 60 * 60 * 1000
                ).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}

          {selectedDays && estimatedCount === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800">
                ไม่พบข้อมูลที่เก่ากว่า {selectedDays} วัน
              </p>
            </div>
          )}
        </div>
      </Dialog>
    </AdminLayout>
  );
}
