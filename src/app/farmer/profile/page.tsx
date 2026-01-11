"use client";

import FarmerLayout from "@/components/layout/FarmerLayout";
import { ProgressSpinner } from "primereact/progressspinner";
import { useFarmerProfile } from "@/hooks/useFarmerProfile";
import RoleProfilePage from "@/components/profile/RoleProfilePage";

export default function FarmerProfilePage() {
  const { user, loading, error, applyUpdate } = useFarmerProfile();

  if (loading) {
    return (
      <FarmerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <ProgressSpinner className="w-20 h-20" />
        </div>
      </FarmerLayout>
    );
  }

  if (error) {
    return (
      <FarmerLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-red-600">
            {error}
          </div>
        </div>
      </FarmerLayout>
    );
  }

  if (!user) {
    return (
      <FarmerLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            ไม่พบข้อมูลผู้ใช้
          </div>
        </div>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout>
      <RoleProfilePage role="FARMER" user={user} onSaved={applyUpdate} />
    </FarmerLayout>
  );
}
