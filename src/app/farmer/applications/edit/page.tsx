"use client";

import React from "react";
import RubberFarmEditForm from "@/components/RubberFarmEditForm";
import FarmerLayout from "@/components/layout/FarmerLayout";

export default function EditRubberFarmApplication() {
  return (
    <FarmerLayout>
      <div className="max-w-3xl mx-auto">
        <RubberFarmEditForm />
      </div>
    </FarmerLayout>
  );
}
