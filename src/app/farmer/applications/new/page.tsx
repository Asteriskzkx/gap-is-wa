"use client";

import React from "react";
import RubberFarmRegistrationForm from "@/components/RubberFarmRegistrationForm";
import FarmerLayout from "@/components/layout/FarmerLayout";

export default function RubberFarmApplication() {
  return (
    <FarmerLayout>
      <div className="max-w-3xl mx-auto">
        <RubberFarmRegistrationForm />
      </div>
    </FarmerLayout>
  );
}
