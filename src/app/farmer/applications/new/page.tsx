"use client";

import React from "react";
import RubberFarmRegistrationForm from "@/components/RubberFarmRegistrationForm";
import FarmerLayout from "@/components/layout/FarmerLayout";

export default function RubberFarmApplication() {
  return (
    <FarmerLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <RubberFarmRegistrationForm />
      </div>
    </FarmerLayout>
  );
}
