"use client";

import { useParams } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminEditForm from "@/components/form/AdminEditForm";
import FarmerEditForm from "@/components/form/FarmerEditForm";
import AuditorEditForm from "@/components/form/AuditorEditForm";
import CommitteeEditForm from "@/components/form/CommitteeEditForm";
import BasicEditForm from "@/components/form/BasicEditForm";
import { ProgressSpinner } from "primereact/progressspinner";
import { useUserDetail } from "@/hooks/useUserDetail";

export default function EditUserPage() {
  const { id } = useParams();
  const userId = id ? parseInt(id as string, 10) : null;
  const { user, loading, error } = useUserDetail(userId);

  if (!id || loading || error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <ProgressSpinner className="w-20 h-20" />
        </div>
      </AdminLayout>
    );
  }

  if (!user) return <p>User not found.</p>;

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Render UI based on role */}
        {/* TODO: Add Form into all component and integrate the ui :D */}
        {user.role === "ADMIN" && <AdminEditForm user={user} />}
        {user.role === "FARMER" && <FarmerEditForm user={user} />}
        {user.role === "AUDITOR" && <AuditorEditForm user={user} />}
        {user.role === "COMMITTEE" && <CommitteeEditForm user={user} />}
        {user.role === "BASIC" && <BasicEditForm user={user} />}
      </div>
    </AdminLayout>
  );
}
