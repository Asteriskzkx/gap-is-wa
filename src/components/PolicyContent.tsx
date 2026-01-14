import React from "react";

export const PolicyContent: React.FC = () => {
  return (
      <div className="mx-auto max-w-4xl rounded-2xl bg-gray-50 p-8 shadow-sm md:p-12 space-y-8">

        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-green-800">
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className="text-sm text-slate-500">
            (Privacy Policy ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562)
          </p>
        </header>

        {/* Intro */}
        <p className="text-slate-700 leading-relaxed">
          นโยบายความเป็นส่วนตัวฉบับนี้จัดทำขึ้นสำหรับ{" "}
          <strong className="font-semibold text-slate-900">
            ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพารา
            ตามมาตรฐานการปฏิบัติทางการเกษตรที่ดี (Good Agricultural Practices: GAP)
          </strong>{" "}
          (ต่อไปนี้เรียกว่า “ระบบ”) เพื่ออธิบายแนวทางการเก็บรวบรวม ใช้ เปิดเผย
          และคุ้มครองข้อมูลส่วนบุคคลของผู้ใช้งานให้เป็นไปตาม
          พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
        </p>

        {/* Section */}
        <section className="space-y-3">
          <h2 className="section-title">1. คำนิยาม</h2>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            <li><strong>ข้อมูลส่วนบุคคล</strong> หมายถึง ข้อมูลเกี่ยวกับบุคคลซึ่งสามารถระบุตัวบุคคลนั้นได้</li>
            <li><strong>เจ้าของข้อมูลส่วนบุคคล</strong> หมายถึง บุคคลซึ่งเป็นเจ้าของข้อมูลส่วนบุคคล</li>
            <li><strong>ผู้ควบคุมข้อมูลส่วนบุคคล</strong> หมายถึง หน่วยงานหรือผู้ดูแลระบบ</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="section-title">2. ประเภทของข้อมูลส่วนบุคคลที่เก็บรวบรวม</h2>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            <li>ข้อมูลระบุตัวตน เช่น ชื่อ–นามสกุล เลขประจำตัวประชาชน</li>
            <li>ข้อมูลการติดต่อ เช่น ที่อยู่ หมายเลขโทรศัพท์ และอีเมล</li>
            <li>ข้อมูลด้านการเกษตร เช่น ข้อมูลแปลงปลูก ผลผลิต และการปฏิบัติตาม GAP</li>
            <li>ข้อมูลการใช้งานระบบ เช่น ชื่อผู้ใช้ IP Address และประวัติการใช้งาน</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="section-title">3. ฐานทางกฎหมายในการประมวลผลข้อมูล</h2>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            <li>การปฏิบัติภารกิจเพื่อประโยชน์สาธารณะ</li>
            <li>การปฏิบัติตามสัญญาหรือภารกิจที่เกี่ยวข้อง</li>
            <li>ประโยชน์โดยชอบด้วยกฎหมาย</li>
            <li>ความยินยอมของเจ้าของข้อมูล</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="section-title">4. วัตถุประสงค์ในการใช้ข้อมูล</h2>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            <li>บริหารจัดการข้อมูลผลผลิตยางพารา</li>
            <li>ตรวจสอบการปฏิบัติตามมาตรฐาน GAP</li>
            <li>วิเคราะห์และจัดทำรายงาน</li>
            <li>ติดต่อและสนับสนุนผู้ใช้งาน</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="section-title">5. การเปิดเผยข้อมูลส่วนบุคคล</h2>
          <p className="text-slate-700">
            ระบบจะไม่เปิดเผยข้อมูลส่วนบุคคลแก่บุคคลภายนอก
            เว้นแต่ได้รับความยินยอมหรือเป็นไปตามที่กฎหมายกำหนด
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="section-title">6. การโอนข้อมูลไปต่างประเทศ</h2>
          <p className="text-slate-700">
            ระบบจะดำเนินการโอนข้อมูลเฉพาะประเทศหรือองค์กรที่มีมาตรฐานการคุ้มครองข้อมูลที่เพียงพอ
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="section-title">7. ระยะเวลาในการเก็บรักษาข้อมูล</h2>
          <p className="text-slate-700">
            ระบบจะเก็บรักษาข้อมูลไว้เท่าที่จำเป็น และลบหรือทำลายเมื่อพ้นระยะเวลา
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="section-title">8. สิทธิของเจ้าของข้อมูล</h2>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            <li>ขอเข้าถึงและขอรับสำเนาข้อมูล</li>
            <li>ขอแก้ไขหรือขอลบข้อมูล</li>
            <li>ขอระงับหรือคัดค้านการประมวลผล</li>
            <li>ถอนความยินยอม</li>
          </ul>
        </section>

        {/* Highlight */}
        <section className="rounded-xl border-l-4 border-green-500 bg-green-50 p-4 text-green-900">
          ระบบมีมาตรการรักษาความมั่นคงปลอดภัยของข้อมูล
          เช่น การควบคุมสิทธิ์ การเข้ารหัส และการตรวจสอบการใช้งานระบบ
        </section>

        {/* Contact */}
        <section className="rounded-xl bg-slate-100 p-4 space-y-1 text-sm">
          <p className="font-semibold text-slate-800 text-base">ช่องทางการติดต่อ</p>
          <p className="text-sm"><strong>หน่วยงาน:</strong> การยางแห่งประเทศไทย ( Rubber Authority of Thailand ) </p>
          <p className="text-sm"><strong>ที่อยู่:</strong> เลขที่ 67/25 ถนนบางขุนนนท์ แขวงบางขุนนนท์ เขตบางกอกน้อย กรุงเทพมหานคร 10700</p>
          <p className="text-sm"><strong>โทรศัพท์:</strong> 0-2433-2222</p>
          <p className="text-sm"><strong>โทรสาร:</strong> 0-2433-6490</p>
        </section>

        {/* Footer */}
        <footer className="pt-6 text-center text-xs text-slate-500">
          เอกสารฉบับนี้จัดทำขึ้นเพื่อปฏิบัติตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
        </footer>

      </div>
  );
};

export default PolicyContent;
