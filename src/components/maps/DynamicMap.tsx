import dynamic from "next/dynamic";

// ใช้ dynamic import เพื่อโหลด MapSelector เฉพาะฝั่ง client
const DynamicMapSelector = dynamic(() => import("./MapSelector"), {
  ssr: false, // ห้ามทำ SSR สำหรับ component นี้
  loading: () => (
    <div className="h-96 w-full bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mb-2"></div>
        <span className="text-gray-600 text-sm">กำลังโหลดแผนที่...</span>
      </div>
    </div>
  ),
});

// Pass props correctly through the component
interface DynamicMapProps {
  location: any; // Using any for flexibility with different geometry types
  onChange: (location: any) => void;
  height?: string;
}

const DynamicMap: React.FC<DynamicMapProps> = ({
  location,
  onChange,
  height,
}) => {
  return (
    <DynamicMapSelector
      location={location}
      onChange={onChange}
      height={height}
    />
  );
};

export default DynamicMap;
