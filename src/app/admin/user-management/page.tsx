"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import React, { useEffect } from "react";

export default function AdminUserManagementPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  type User = {
    userId: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };

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

  const roleTemplate = (rowData: User) => (
    <Dropdown
      value={users.find((user) => user.userId === rowData.userId)?.role}
      options={["ADMIN", "FARMER", "AUDITOR", "COMMITTEE"]}
      onChange={(e) => handleRoleChange(rowData.userId, e.value)}
      placeholder="Select a Role"
      filter 
    ></Dropdown>
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
              header
              paginator
              paginatorLeft
              rows={10}
              stripedRows
              resizableColumns
              emptyMessage="No users found."
              className="p-4"
            >
              <Column field="userId" header="ID" sortable></Column>
              <Column field="name" header="Name" sortable></Column>
              <Column field="email" header="Email" sortable></Column>
              <Column field="role" header="Role" body={roleTemplate} sortable></Column>
              <Column
                field="createdAt"
                body={dateTemplate}
                header="Create Date"
              ></Column>
            </DataTable>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
