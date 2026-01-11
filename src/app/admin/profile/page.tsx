"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import { ProgressSpinner } from "primereact/progressspinner";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import RoleProfilePage from "@/components/profile/RoleProfilePage";

export default function AdminProfilePage() {
  const { user, loading, error, applyUpdate } = useAdminProfile();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <ProgressSpinner className="w-20 h-20" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-red-600">
            {error}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            ไม่พบข้อมูลผู้ใช้
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <RoleProfilePage role="ADMIN" user={user} onSaved={applyUpdate} />
    </AdminLayout>
  );
}
