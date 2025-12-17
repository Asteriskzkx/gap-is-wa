import AdminLayout from "@/components/layout/AdminLayout";

export default function AdminReportPage() {
  return (
    <AdminLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ตรวจสอบรายงาน</h1>
          <p className="mt-1 text-sm text-gray-500">
            ตรวจสอบรายงานสรุปข้อมูลต่างๆ
            ที่เกี่ยวข้องกับการจัดการข้อมูลทางการเกษตรผลผลิตยางพารา
          </p>
        </div>
        {/* Content Area */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700">
            ที่นี่คุณสามารถตรวจสอบรายงานต่างๆ ได้ตามความต้องการ
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
