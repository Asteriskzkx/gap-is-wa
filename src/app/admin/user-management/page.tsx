"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import { FilterMatchMode } from "primereact/api";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import React, { useEffect } from "react";

export default function AdminUserManagementPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [roleFilter, setRoleFilter] = React.useState<string | null>(null); // added

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/v1/users");
        const data = await res.json();
        console.log("Fetched users:", data);
        setUsers(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const dateTemplate = (rowData: User) => {
    if (!rowData.createdAt) return "";
    const date = new Date(rowData.createdAt);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/v1/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        throw new Error("Failed to update user role");
      }
      // Update local state after success
      setUsers((prevUsers: User[]) =>
        prevUsers.map((user) =>
          user.userId === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  // TODO: Working on this part to implement role tag instead of dropdown

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
  )

  // const roleTemplate = (rowData: User) => (
  //   <Dropdown
  //     value={users.find((user) => user.userId === rowData.userId)?.role}
  //     options={["ADMIN", "FARMER", "AUDITOR", "COMMITTEE"]}
  //     onChange={(e) => handleRoleChange(rowData.userId, e.value)}
  //     placeholder="Select a Role"
  //     filter
  //   ></Dropdown>
  // );

  const tableHeader = (
    <div className="flex items-center justify-between gap-2">
      <i className="pi pi-search" />
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
    </div>
  );

  return (
    <>
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
              filters={ roleFilter ? { role: { value: roleFilter, matchMode: FilterMatchMode.EQUALS } } : {} } // added
              loading={loading}
              paginator
              paginatorLeft
              paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
              rows={10}
              rowsPerPageOptions={[10, 25, 50 , 100]}
              tableStyle={{ minWidth: '50rem' }}
              stripedRows
              resizableColumns
              className="[&_.p-paginator_.p-dropdown]:!w-auto [&_.p-paginator_.p-dropdown]:min-w-[6rem]"
              emptyMessage="ไม่พบผู้ใช้ในระบบ."
              
            >
              <Column field="userId" header="ID" style={{ width: '5%' }} sortable></Column>
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
            </DataTable>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
