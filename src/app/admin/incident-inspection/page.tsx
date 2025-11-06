import AdminLayout from "@/components/layout/AdminLayout";

export default function AdminIncidentInspectionPage() {
  return (
    <>
      <AdminLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              ตรวจสอบเหตุการณ์ในระบบ
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              ตรวจสอบและจัดการเหตุการณ์ต่างๆ ที่เกิดขึ้นในระบบ
              เพื่อให้การดำเนินงานเป็นไปอย่างราบรื่น
            </p>
          </div>
          {/* Content Area */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700">
              ที่นี่คุณสามารถตรวจสอบเหตุการณ์ต่างๆ ที่เกิดขึ้นในระบบ เช่น
              การแจ้งเตือนจากผู้ใช้ ปัญหาทางเทคนิค
              หรือเหตุการณ์ที่ต้องการการดำเนินการ
            </p>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
