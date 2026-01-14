import React from "react";

export const ContactContent: React.FC = () => {
  return (
      <div className="mx-auto max-w-4xl rounded-2xl bg-gray-50 p-8 shadow-sm md:p-12 space-y-8">

        {/* Contact */}
        <section className="rounded-xl p-4 space-y-1">
          <p className="font-semibold text-slate-800 text-lg">ช่องทางการติดต่อ</p>
          <p className="text-base"><strong>หน่วยงาน:</strong> การยางแห่งประเทศไทย ( Rubber Authority of Thailand ) </p>
          <p className="text-base"><strong>ที่อยู่:</strong> เลขที่ 67/25 ถนนบางขุนนนท์ แขวงบางขุนนนท์ เขตบางกอกน้อย กรุงเทพมหานคร 10700</p>
          <p className="text-base"><strong>โทรศัพท์:</strong> 0-2433-2222</p>
          <p className="text-base"><strong>โทรสาร:</strong> 0-2433-6490</p>
        </section>
      </div>
  );
};

export default ContactContent;
