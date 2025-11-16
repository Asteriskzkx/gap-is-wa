"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import { useRouter } from "next/navigation";
import { FilterMatchMode } from "primereact/api";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

export default function AdminUserManagementPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [roleFilter, setRoleFilter] = React.useState<string | null>(null);
  const [deleteVisible, setDeleteVisible] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [visibleAddUserDialog, setVisibleAddUserDialog] = React.useState(false);

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

  const router = useRouter();
  const toast = useRef<Toast | null>(null);

  const showSuccess = () => {
    if (!toast.current) return; // guard for initial render/unmount
    toast.current.show({
      severity: "success",
      summary: "Success delete user",
      detail: "ลบผู้ใช้สำเร็จ",
      life: 3000,
    });
  };

  const showError = () => {
    if (!toast.current) return; // guard for initial render/unmount
    toast.current.show({
      severity: "error",
      summary: "Error delete user",
      detail: "ลบผู้ใช้ไม่สำเร็จ",
      life: 3000,
    });
  }


  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/users", { cache: "no-store" });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const tableHeader = (
    <div className="flex items-center flex-col md:flex-row justify-between gap-2">
      <InputText
        value={globalFilter}
        onChange={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
        placeholder="Search by name, email or role"
      ></InputText>

      <Dropdown
        value={roleFilter}
        options={roleOptions}
        onChange={(e) => setRoleFilter(e.value)}
        placeholder="Filter by role"
        showClear
      ></Dropdown>
      <div className="flex gap-2 w-auto h-10">
        <Button
          label="รีเฟรช"
          icon="pi pi-refresh"
          onClick={fetchUsers}
          className="w-full hover:bg-gray-200 p-button-sm px-4 text-nowrap "
        />
        <Button
          label="เพิ่มผู้ใช้"
          icon="pi pi-plus"
          onClick={() => setVisibleAddUserDialog(true)}
          className="w-full p-button-sm px-4 text-nowrap p-button-success"
        />
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
            <p className="text-gray-700">
              ที่นี่คุณสามารถจัดการข้อมูลผู้ใช้ในระบบได้อย่างมีประสิทธิภาพ เช่น
              การเพิ่มผู้ใช้ใหม่ การลบผู้ใช้ที่ไม่ใช้งาน
              หรือการแก้ไขข้อมูลผู้ใช้ที่มีอยู่
            </p>
            <DataTable
              value={users}
              header={tableHeader}
              globalFilter={globalFilter}
              globalFilterFields={["name", "email", "role"]}
              filters={
                roleFilter
                  ? {
                      role: {
                        value: roleFilter,
                        matchMode: FilterMatchMode.EQUALS,
                      },
                    }
                  : {}
              } // added
              loading={loading}
              paginator
              paginatorLeft
              paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
              rows={10}
              rowsPerPageOptions={[10, 25, 50, 100]}
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
                      await fetchUsers(); 
                      showSuccess();
                      
                    } catch (error) {
                      console.error("Delete failed:", error);
                      showError();
                    }
                  }}
                />
              </div>
            </Dialog>

            <Dialog
              header="เพิ่มผู้ใช้ใหม่"
              visible={visibleAddUserDialog}
              style={{ width: "40rem" }}
              onHide={() => setVisibleAddUserDialog(false)}
            >
              {/* AddUserForm component */}
              <div className="w-full h-96 flex items-center justify-center text-gray-500">
                กำลังพัฒนาฟีเจอร์นี้... สำหรับ 4 User 
              </div>

            </Dialog>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
