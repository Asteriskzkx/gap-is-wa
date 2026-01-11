"use client";

import CommitteeLayout from "@/components/layout/CommitteeLayout";
import { ProgressSpinner } from "primereact/progressspinner";
import { useCommitteeProfile } from "@/hooks/useCommitteeProfile";
import RoleProfilePage from "@/components/profile/RoleProfilePage";

export default function CommitteeProfilePage() {
  const { user, loading, error, applyUpdate } = useCommitteeProfile();

  if (loading) {
    return (
      <CommitteeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <ProgressSpinner className="w-20 h-20" />
        </div>
      </CommitteeLayout>
    );
  }

  if (error) {
    return (
      <CommitteeLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-red-600">
            {error}
          </div>
        </div>
      </CommitteeLayout>
    );
  }

  if (!user) {
    return (
      <CommitteeLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            ไม่พบข้อมูลผู้ใช้
          </div>
        </div>
      </CommitteeLayout>
    );
  }

  return (
    <CommitteeLayout>
      <RoleProfilePage role="COMMITTEE" user={user} onSaved={applyUpdate} />
    </CommitteeLayout>
  );
}
