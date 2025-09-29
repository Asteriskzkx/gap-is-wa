"use client";

import React from "react";
import RubberFarmEditForm from "@/components/RubberFarmEditForm";
import FarmerLayout from "@/components/layout/FarmerLayout";

export default function EditRubberFarmApplication() {
  return (
    <FarmerLayout selectedPath="/farmer/applications/edit">
      <RubberFarmEditForm />
    </FarmerLayout>
  );
}
