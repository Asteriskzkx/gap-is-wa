"use client";

import React from "react";
import RubberFarmEditForm from "@/components/RubberFarmEditForm";
import FarmerLayout from "@/components/layout/FarmerLayout";

export default function EditRubberFarmApplication() {
  return (
    <FarmerLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <RubberFarmEditForm />
      </div>
    </FarmerLayout>
  );
}
