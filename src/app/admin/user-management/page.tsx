"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import { useRouter } from "next/navigation";
import { Column } from "primereact/column";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { AddUserDialog } from "@/components/admin/AddUserDialog";

type User = {
  userId: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

enum UserRole {
  BASIC = "BASIC",
  FARMER = "FARMER",
  AUDITOR = "AUDITOR",
  COMMITTEE = "COMMITTEE",
  ADMIN = "ADMIN",
}

const rowsPerPageOptions = [10, 25, 50, 100];
const DEBOUNCE_DELAY = 500; // milliseconds

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [visibleAddUserDialog, setVisibleAddUserDialog] = useState(false);

  // Server-side pagination state
  const [totalRecords, setTotalRecords] = useState(0);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  // Filter state - realtime with debounce
  const [searchInput, setSearchInput] = useState<string>("");
  const [roleInput, setRoleInput] = useState<string | null>(null);
  
  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const toast = useRef<Toast | null>(null);

  const showSuccessDelete = () => {
    if (!toast.current) return; // guard for initial render/unmount
    toast.current.show({
      severity: "success",
      summary: "Success delete user",
      detail: "ลบผู้ใช้สำเร็จ",
      life: 3000,
    });
  };

  const showSuccessCreated = () => {
    if (!toast.current) return; // guard for initial render/unmount
    toast.current.show({
      severity: "success",
      summary: "Success create user",
      detail: "สร้างผู้ใช้สำเร็จ",
      life: 3000,
    });
  };

  const showErrorCreated = () => {
    if (!toast.current) return; // guard for initial render/unmount
    toast.current.show({
      severity: "error",
      summary: "Error create user",
      detail: "สร้างผู้ใช้ไม่สำเร็จ",
      life: 3000,
    });
  }

  const showErrorDelete = () => {
    if (!toast.current) return; // guard for initial render/unmount
    toast.current.show({
      severity: "error",
      summary: "Error delete user",
      detail: "ลบผู้ใช้ไม่สำเร็จ",
      life: 3000,
    });
  }

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput]);

  // Current filters (memoized)
  const currentFilters = useMemo(() => ({
    search: debouncedSearch,
    role: roleInput,
  }), [debouncedSearch, roleInput]);

  // Build query string from filters and pagination
  const buildQueryString = useCallback((skip: number, take: number, filters: { search: string; role: string | null }) => {
    const params = new URLSearchParams();
    params.set("skip", skip.toString());
    params.set("take", take.toString());
    
    if (filters.search) params.set("search", filters.search);
    if (filters.role) params.set("role", filters.role);
    
    return params.toString();
  }, []);

  // Fetch users with server-side filtering and pagination
  const fetchUsers = useCallback(async (skip: number, take: number, filters: { search: string; role: string | null }) => {
    setLoading(true);
    try {
      const queryString = buildQueryString(skip, take, filters);
      const res = await fetch(`/api/v1/users?${queryString}`, { cache: "no-store" });
      const data = await res.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  // Initial load
  useEffect(() => {
    fetchUsers(0, rows, currentFilters);
  }, []);

  // Refetch when filters change (realtime with debounce)
  useEffect(() => {
    fetchUsers(0, rows, currentFilters);
    setFirst(0); // Reset to first page when filters change
  }, [currentFilters, rows, fetchUsers]);

  // Handle pagination change
  const handlePageChange = (event: DataTablePageEvent) => {
    setFirst(event.first);
    setRows(event.rows);
    fetchUsers(event.first, event.rows, currentFilters);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchInput("");
    setRoleInput(null);
    setDebouncedSearch("");
  };

  // Handle role change - immediate filter
  const handleRoleChange = (e: { value: string | null }) => {
    setRoleInput(e.value);
  };

  const dateTemplate = (rowData: User) => {
    if (!rowData.createdAt) return "";
    const date = new Date(rowData.createdAt);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // const handleRoleChange = async (userId: number, newRole: string) => {
  //   try {
  //     const res = await fetch(`/api/v1/users/${userId}/role`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ role: newRole }),
  //     });
  //     if (!res.ok) throw new Error("Failed to update user role");
  //     await fetchUsers(); // refresh หลังอัปเดต role
  //   } catch (error) {
  //     console.error("Error updating user role:", error);
  //   }
  // };

  const roleOptions = [
    ...Object.values(UserRole).map((role) => ({
      label: role,
      value: role,
    })),
  ];

  const getRoleSeverity = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return "danger";
      case UserRole.COMMITTEE:
        return "warning";
      case UserRole.AUDITOR:
        return "info";
      case UserRole.FARMER:
        return "success";
      default:
        return null;
    }
  };

  const roleTemplate = (rowData: User) => (
    <Tag severity={getRoleSeverity(rowData.role)} value={rowData.role}></Tag>
  );

  const MoreVertMenu = ({ rowData }: { rowData: User }) => {
    const rowMenuRef = React.useRef<Menu | null>(null);

    const menuItems = [
      {
        label: "Edit",
        icon: "pi pi-pencil",
        command: () =>
          router.push(`/admin/user-management/edit/${rowData.userId}`),
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        command: () => {
          setSelectedId(rowData.userId);
          setDeleteVisible(true);
        },
      },
    ];

    return (
      <>
        <Menu
          model={menuItems}
          popup
          ref={rowMenuRef}
          id={`menu_${rowData.userId}`}
        />
        <button
          className="p-button p-button-text p-button-plain"
          onClick={(e) => rowMenuRef.current?.toggle(e)}
        >
          <i className="pi pi-ellipsis-v"></i>
        </button>
      </>
    );
  };

  // Check if currently debouncing (search input differs from debounced value)
  const isDebouncing = searchInput !== debouncedSearch;

  const tableHeader = (
    <div className="flex flex-col gap-3">
      {/* Row 1: Filters and Actions */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search and Filter Group */}
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <InputText
            value={searchInput}
            onChange={(e) => setSearchInput((e.target as HTMLInputElement).value)}
            placeholder="ค้นหาชื่อหรืออีเมล..."
            style={{ width: '200px' }}
          />
          <Dropdown
            value={roleInput}
            options={roleOptions}
            onChange={handleRoleChange}
            placeholder="เลือก Role"
            showClear
            style={{ width: '200px' }}
          />
          <Button
            icon="pi pi-filter-slash"
            tooltip="ล้างตัวกรอง"
            onClick={handleClearFilters}
            className="p-button-sm p-button-outlined"
            disabled={loading}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            label="รีเฟรช"
            icon="pi pi-refresh"
            onClick={() => fetchUsers(first, rows, currentFilters)}
            className="p-button-sm p-button-outlined"
            disabled={loading}
          />
          <Button
            label="เพิ่มผู้ใช้"
            icon="pi pi-plus"
            onClick={() => setVisibleAddUserDialog(true)}
            className="p-button-sm p-button-success p-2"
          />
        </div>
      </div>
      
      {/* Row 2: Debouncing indicator */}
      {isDebouncing && (
        <div className="text-sm text-blue-600">
          <i className="pi pi-spin pi-spinner mr-1"></i>
          กำลังรอค้นหา...
        </div>
      )}
      
      {/* Row 3: Record count */}
      <div className="text-sm text-gray-500">
        แสดง {users.length} จาก {totalRecords.toLocaleString()} รายการ
      </div>
    </div>
  );
  


  return (
    <>
    <Toast ref={toast} />
      <AdminLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              จัดการผู้ใช้ในระบบ
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              จัดการข้อมูลผู้ใช้ในระบบ เช่น การเพิ่ม ลบ หรือแก้ไขข้อมูลผู้ใช้
            </p>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow p-6">
            <DataTable
              value={users}
              header={tableHeader}
              loading={loading}
              lazy
              paginator
              first={first}
              rows={rows}
              totalRecords={totalRecords}
              onPage={handlePageChange}
              paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
              rowsPerPageOptions={rowsPerPageOptions}
              tableStyle={{ minWidth: "50rem" }}
              stripedRows
              resizableColumns
              className="[&_.p-paginator_.p-dropdown]:!w-auto [&_.p-paginator_.p-dropdown]:min-w-[6rem]"
              emptyMessage="ไม่พบผู้ใช้ในระบบ."
            >
              <Column
                field="userId"
                header="ID"
                style={{ width: "5%" }}
                sortable
              ></Column>
              <Column field="name" header="Name" sortable></Column>
              <Column field="email" header="Email" sortable></Column>
              <Column
                field="role"
                header="Role"
                body={roleTemplate}
                sortable
              ></Column>
              <Column
                field="createdAt"
                body={dateTemplate}
                header="Create Date"
                sortable
              ></Column>
              <Column
                field=""
                body={(rowData) => <MoreVertMenu rowData={rowData} />}
                style={{ width: "2%" }}
                header=""
              />
            </DataTable>
            <Dialog
              header="ยืนยันการลบ"
              visible={deleteVisible}
              style={{ width: "25rem" }}
              onHide={() => setDeleteVisible(false)}
            >
              <p className="m-0">ต้องการลบผู้ใช้ชื่อ : <span className="text-red font-bold">{users.find(u => u.userId === selectedId)?.name ?? "-"}</span> ใช่ไหม?</p>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  label="ยกเลิก"
                  icon="pi pi-times"
                  severity="secondary"
                  className="p-2 flex-1"
                  onClick={() => setDeleteVisible(false)}
                />

                <Button
                  label="ลบ"
                  icon="pi pi-trash"
                  severity="danger"
                  className="p-2 flex-1"
                  onClick={async () => {
                    try {
                      await fetch(`/api/v1/users/${selectedId}`, {
                        method: "DELETE",
                      });
                      setDeleteVisible(false);
                      await fetchUsers(first, rows, currentFilters); 
                      showSuccessDelete();
                      
                    } catch (error) {
                      console.error("Delete failed:", error);
                      showErrorDelete();
                    }
                  }}
                />
              </div>
            </Dialog>

            <AddUserDialog
              visible={visibleAddUserDialog}
              onHide={() => setVisibleAddUserDialog(false)}
              onCreated={async () => {
                await fetchUsers(first, rows, currentFilters);
              }}
              showSuccess={showSuccessCreated}
              showError={showErrorCreated}
            />
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
