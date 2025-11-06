import AdminLayout from "@/components/layout/AdminLayout";

export default function AdminUserManagementPage() {
  return (
    <>
      <AdminLayout>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              จัดการผู้ใช้ในระบบ
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              จัดการข้อมูลผู้ใช้ในระบบ เช่น การเพิ่ม ลบ หรือแก้ไขข้อมูลผู้ใช้
            </p>
          </div>
          {/* Content Area */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700">
              ที่นี่คุณสามารถจัดการข้อมูลผู้ใช้ในระบบได้อย่างมีประสิทธิภาพ เช่น
              การเพิ่มผู้ใช้ใหม่ การลบผู้ใช้ที่ไม่ใช้งาน
              หรือการแก้ไขข้อมูลผู้ใช้ที่มีอยู่
            </p>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
