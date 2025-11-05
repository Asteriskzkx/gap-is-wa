import React from "react";

export const LoadingIndicator: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="h-24 bg-gray-200 rounded"></div>
      <div className="h-24 bg-gray-200 rounded"></div>
      <div className="h-24 bg-gray-200 rounded"></div>
      <div className="h-24 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export const TableLoadingIndicator: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-10 bg-gray-200 rounded mb-4"></div>
    <div className="h-12 bg-gray-200 rounded mb-4"></div>
    <div className="h-12 bg-gray-200 rounded mb-4"></div>
    <div className="h-12 bg-gray-200 rounded"></div>
  </div>
);
