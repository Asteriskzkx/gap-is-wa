import React from "react";
import * as Icons from "@/components/icons/"; // adjust the path if needed

export default function IconGallery() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Icon Preview</h1>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
        {Object.entries(Icons).map(([name, IconComponent]) => (
          <div key={name} className="flex flex-col items-center space-y-2">
            <IconComponent className="h-10 w-10 text-gray-700" />
            <span className="text-sm text-center">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
