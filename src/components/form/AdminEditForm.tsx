import { InputText } from "primereact/inputtext";
import React from "react";

type Props = {
  user: { userId: string; name: string; email: string; role: string };
};

export default function AdminEditForm(props: Props) {
  return (
    <>
      <div>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8 ">
            <h1 className="text-2xl font-bold text-gray-900">
              จัดการผู้ใช้ในระบบ
            </h1>
          </div>
          {/* Content Area */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-lg font-bold">
              หน้าแก้ไขข้อมูลผู้ดูแลระบบ ชื่อ : {props.user.name} ( UserID :{" "}
              {props.user.userId})
            </p>

            <form className="mt-4 space-y-4">
                <div>
                    
                </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
