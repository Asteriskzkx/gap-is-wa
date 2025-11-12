"use client";

import React from "react";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";

interface Paginator {
  total: number;
  limit: number;
  offset: number;
}

interface Props {
  results: any[];
  paginator: Paginator;
  loading?: boolean;
  onPageChange: (offset: number, limit?: number) => void;
  onSortChange: (payload: {
    sortField?: string | null;
    sortOrder?: number | null;
    multiSortMeta?: any;
  }) => void;
}

export default function InspectionsTable({
  results,
  paginator,
  loading = false,
  onPageChange,
  onSortChange,
}: Props) {
  const dateBody = (row: any) => {
    if (!row?.inspectionDateAndTime) return "-";
    const d = new Date(row.inspectionDateAndTime);
    return d.toLocaleString();
  };

  const chiefBody = (row: any) => {
    return row?.auditorChief?.firstName
      ? `${row.auditorChief.firstName} ${row.auditorChief.lastName || ""}`
      : row?.auditorChief || "-";
  };

  const columns = [
    { field: "inspectionNo", header: "Inspection #", sortable: true },
    {
      field: "inspectionDateAndTime",
      header: "Date/Time",
      body: dateBody,
      sortable: true,
    },
    { field: "inspectionType.typeName", header: "Type" },
    { field: "auditorChief", header: "Chief", body: chiefBody },
    { field: "inspectionStatus", header: "Status" },
    { field: "inspectionResult", header: "Result" },
  ];

  const handlePage = (e: any) => {
    onPageChange(e.first ?? 0, e.rows);
  };

  const handleSort = (e: any) => {
    onSortChange({
      sortField: e.sortField,
      sortOrder: e.sortOrder,
      multiSortMeta: e.multiSortMeta,
    });
  };

  return (
    <div className="mt-4">
      <PrimaryDataTable
        value={results}
        columns={columns}
        loading={loading}
        paginator
        rows={paginator.limit}
        totalRecords={paginator.total}
        lazy
        onPage={handlePage}
        onSort={handleSort}
        sortMode="multiple"
        first={paginator.offset}
        className="bg-white rounded-md shadow-sm p-4"
      />
    </div>
  );
}
