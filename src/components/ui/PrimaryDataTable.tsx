"use client";

import React, { useState } from "react";
import {
  DataTable,
  DataTablePageEvent,
  DataTableSortEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { PaginatorTemplate } from "primereact/paginator";

interface PrimaryDataTableColumn {
  readonly field: string;
  readonly header: string;
  readonly body?: (rowData: any) => React.ReactNode;
  readonly sortable?: boolean;
  readonly style?: React.CSSProperties;
  readonly headerStyle?: React.CSSProperties;
  readonly className?: string;
}

interface PrimaryDataTableProps {
  readonly value: any[];
  readonly columns: PrimaryDataTableColumn[];
  readonly loading?: boolean;
  readonly paginator?: boolean;
  readonly rows?: number;
  readonly totalRecords?: number;
  readonly lazy?: boolean;
  readonly onPage?: (event: DataTablePageEvent) => void;
  readonly emptyMessage?: string;
  readonly className?: string;
  readonly rowClassName?: (data: any) => string;
  readonly onRowClick?: (event: any) => void;
  readonly selectionMode?: "single" | "multiple";
  readonly selection?: any;
  readonly onSelectionChange?: (e: any) => void;
  readonly dataKey?: string;
  readonly sortMode?: "single" | "multiple";
  readonly sortField?: string;
  readonly sortOrder?: 1 | -1 | 0 | null;
  readonly multiSortMeta?: Array<{
    field: string;
    order: 1 | -1 | 0 | null;
  }>;
  readonly onSort?: (event: DataTableSortEvent) => void;
  readonly first?: number;
}

const CurrentPageReport = (options: any) => {
  return (
    <span className="text-sm text-gray-700 mx-3">
      แสดง {options.first} ถึง {options.last} จาก {options.totalRecords} รายการ
    </span>
  );
};

/**
 * PrimaryDataTable - ตารางข้อมูลหลักที่ใช้ในระบบ GAP
 * รองรับ pagination, lazy loading, sorting และ multi-sorting
 *
 * @example
 * <PrimaryDataTable
 *   value={data}
 *   columns={[
 *     { field: 'id', header: 'รหัส', sortable: true },
 *     { field: 'name', header: 'ชื่อ', body: (rowData) => <span>{rowData.name}</span>, sortable: true }
 *   ]}
 *   paginator
 *   rows={10}
 *   totalRecords={100}
 *   lazy
 *   onPage={handlePageChange}
 *   sortMode="multiple"
 *   onSort={handleSort}
 * />
 */
export default function PrimaryDataTable({
  value,
  columns,
  loading = false,
  paginator = false,
  rows = 10,
  totalRecords,
  lazy = false,
  onPage,
  emptyMessage = "ไม่พบข้อมูล",
  className = "",
  rowClassName,
  onRowClick,
  selectionMode,
  selection,
  onSelectionChange,
  dataKey = "id",
  sortMode = "single",
  sortField,
  sortOrder,
  multiSortMeta,
  onSort,
  first: propFirst = 0,
}: PrimaryDataTableProps) {
  const [first, setFirst] = useState(propFirst);

  // Update first when propFirst changes
  React.useEffect(() => {
    setFirst(propFirst);
  }, [propFirst]);

  const handlePageChange = (event: DataTablePageEvent) => {
    setFirst(event.first);
    if (onPage) {
      onPage(event);
    }
  };

  const paginatorTemplate: PaginatorTemplate = {
    layout:
      "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport",
    CurrentPageReport,
  };

  // คำนวณจำนวน records ที่ใช้แสดง
  const actualTotalRecords = totalRecords ?? value.length;

  return (
    <div className={`primary-datatable-wrapper ${className}`}>
      <DataTable
        value={value}
        loading={loading}
        paginator={paginator}
        rows={rows}
        first={first}
        totalRecords={actualTotalRecords}
        lazy={lazy}
        onPage={handlePageChange}
        paginatorTemplate={paginatorTemplate}
        emptyMessage={
          <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
        }
        rowClassName={rowClassName}
        onRowClick={onRowClick}
        selectionMode={selectionMode as any}
        selection={selection}
        onSelectionChange={onSelectionChange}
        dataKey={dataKey}
        sortMode={sortMode}
        sortField={sortField}
        sortOrder={sortOrder}
        multiSortMeta={multiSortMeta}
        onSort={onSort}
        removableSort
        className="w-full"
        pt={{
          table: { className: "w-full" },
          thead: { className: "bg-gray-50" },
          tbody: { className: "bg-white divide-y divide-gray-200" },
          headerRow: { className: "border-b border-gray-200" },
          bodyRow: { className: "border-b border-gray-200" },
        }}
      >
        {columns.map((col) => (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            body={col.body}
            sortable={col.sortable}
            style={col.style}
            headerStyle={col.headerStyle}
            className={col.className}
            pt={{
              headerCell: {
                className:
                  "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
              },
              bodyCell: {
                className: "px-6 py-4 text-sm text-gray-900",
              },
            }}
          />
        ))}
      </DataTable>
    </div>
  );
}
