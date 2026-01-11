"use client";

import AuditorLayout from "@/components/layout/AuditorLayout";
import { ProgressSpinner } from "primereact/progressspinner";
import { useAuditorProfile } from "@/hooks/useAuditorProfile";
import RoleProfilePage from "@/components/profile/RoleProfilePage";

export default function AuditorProfilePage() {
  const { user, loading, error, applyUpdate } = useAuditorProfile();

  if (loading) {
    return (
      <AuditorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <ProgressSpinner className="w-20 h-20" />
        </div>
      </AuditorLayout>
    );
  }

  if (error) {
    return (
      <AuditorLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-red-600">
            {error}
          </div>
        </div>
      </AuditorLayout>
    );
  }

  if (!user) {
    return (
      <AuditorLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            ไม่พบข้อมูลผู้ใช้
          </div>
        </div>
      </AuditorLayout>
    );
  }

  return (
    <AuditorLayout>
      <RoleProfilePage role="AUDITOR" user={user} onSaved={applyUpdate} />
    </AuditorLayout>
  );
}
