import dynamic from "next/dynamic";
import React from "react";

const DynamicMapViewer = dynamic(() => import("./MapViewer"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
        <span className="text-gray-600 text-sm">กำลังโหลดแผนที่...</span>
      </div>
    </div>
  ),
});

interface Props {
  location: any;
  height?: string;
  width?: string;
}

const Wrapper: React.FC<Props> = ({ location, height, width }) => {
  return <DynamicMapViewer location={location} height={height} width={width} />;
};

export default Wrapper;
