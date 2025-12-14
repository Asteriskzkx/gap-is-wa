"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import PrimaryAutoComplete from "@/components/ui/PrimaryAutoComplete";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";
import PrimaryInputNumber from "@/components/ui/PrimaryInputNumber";
import { useAdminAuditLogs } from "@/hooks/useAdminAuditLogs";
import { CONTAINER, HEADER, SPACING } from "@/styles/auditorClasses";
import { useMemo } from "react";

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
  } = useAdminAuditLogs(10);

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
        body: (r: any) => {
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
          return tableLabelMap[r.tableName] || r.tableName;
        },
        style: { width: "32%" },
      },
      {
        field: "action",
        header: "การดำเนินการ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        body: (r: any) => {
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
            <span className={colorMap[r.action] || ""}>
              {labelMap[r.action] || r.action}
            </span>
          );
        },
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

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="justify-self-end">
                  <PrimaryButton
                    label="ค้นหา"
                    icon="pi pi-search"
                    onClick={applyFilters}
                  />
                </div>
                <div>
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
                // sortField={lazyParams.sortField}
                // sortOrder={lazyParams.sortOrder}
                sortMode="multiple"
                multiSortMeta={lazyParams.multiSortMeta}
                rowsPerPageOptions={[10, 25, 50]}
                dataKey="auditLogId"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
