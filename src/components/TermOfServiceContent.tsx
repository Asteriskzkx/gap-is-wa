import React from "react";

export const TermsContent: React.FC = () => {
  return (
      <div className="mx-auto max-w-4xl rounded-2xl bg-gray-50 p-8 shadow-sm md:p-12 space-y-8">

        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-green-800">
            ข้อกำหนดและเงื่อนไขการใช้งาน
          </h1>
          <p className="text-sm text-slate-500">
            (Terms of Service)
          </p>
        </header>

        {/* Intro */}
        <p className="text-slate-700 leading-relaxed">
          ข้อกำหนดและเงื่อนไขการใช้งานฉบับนี้ใช้บังคับกับการเข้าใช้งาน
          <strong className="font-semibold text-slate-900">
            {" "}ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพารา
            ตามมาตรฐานการปฏิบัติทางการเกษตรที่ดี (Good Agricultural Practices: GAP)
          </strong>{" "}
          (ต่อไปนี้เรียกว่า “ระบบ”)  
          ผู้ใช้งานตกลงยอมรับข้อกำหนดและเงื่อนไขนี้โดยการเข้าใช้งานระบบ
          ไม่ว่าทั้งหมดหรือบางส่วน
        </p>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="section-title">1. การยอมรับข้อกำหนด</h2>
          <p className="text-slate-700">
            ผู้ใช้งานรับทราบและตกลงปฏิบัติตามข้อกำหนดและเงื่อนไขการใช้งานนี้
            รวมถึงกฎหมาย ระเบียบ และข้อบังคับที่เกี่ยวข้องทั้งหมด
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="section-title">2. คุณสมบัติของผู้ใช้งาน</h2>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            <li>เป็นบุคคลที่มีสิทธิ์เข้าใช้งานระบบตามที่หน่วยงานกำหนด</li>
            <li>ให้ข้อมูลที่ถูกต้อง ครบถ้วน และเป็นปัจจุบัน</li>
            <li>ไม่ใช้ระบบในลักษณะที่ขัดต่อกฎหมายหรือศีลธรรมอันดี</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="section-title">3. การใช้งานระบบ</h2>
          <ul className="list-disc pl-6 space-y-1 text-slate-700">
            <li>ผู้ใช้งานต้องรักษาความลับของชื่อผู้ใช้และรหัสผ่าน</li>
            <li>ห้ามเข้าถึง แก้ไข หรือรบกวนข้อมูลของผู้อื่นโดยไม่ได้รับอนุญาต</li>
            <li>ห้ามกระทำการใด ๆ ที่อาจส่งผลกระทบต่อความมั่นคงของระบบ</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="section-title">4. ข้อมูลและความถูกต้อง</h2>
          <p className="text-slate-700">
            ผู้ใช้งานรับรองว่าข้อมูลที่นำเข้าสู่ระบบเป็นข้อมูลที่ถูกต้อง
            หากเกิดความเสียหายอันเนื่องมาจากข้อมูลที่ไม่ถูกต้อง
            ระบบขอสงวนสิทธิ์ในการปฏิเสธความรับผิด
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="section-title">5. สิทธิในทรัพย์สินทางปัญญา</h2>
          <p className="text-slate-700">
            เนื้อหา ข้อมูล ระบบ และซอฟต์แวร์ทั้งหมดในระบบนี้
            เป็นทรัพย์สินทางปัญญาของหน่วยงานผู้ดูแลระบบ
            ห้ามทำซ้ำ ดัดแปลง หรือเผยแพร่โดยไม่ได้รับอนุญาต
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="section-title">6. การคุ้มครองข้อมูลส่วนบุคคล</h2>
          <p className="text-slate-700">
            ระบบดำเนินการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล
            ตามนโยบายความเป็นส่วนตัว (Privacy Policy)
            และพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="section-title">7. การระงับหรือยกเลิกการใช้งาน</h2>
          <p className="text-slate-700">
            ระบบขอสงวนสิทธิ์ในการระงับหรือยกเลิกการเข้าใช้งานของผู้ใช้งาน
            หากพบว่ามีการละเมิดข้อกำหนดและเงื่อนไขนี้
            โดยไม่จำเป็นต้องแจ้งให้ทราบล่วงหน้า
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="section-title">8. การจำกัดความรับผิด</h2>
          <p className="text-slate-700">
            ระบบไม่รับผิดชอบต่อความเสียหายใด ๆ
            ที่เกิดจากการใช้งานหรือไม่สามารถใช้งานระบบได้
            อันเนื่องมาจากเหตุสุดวิสัยหรือปัจจัยภายนอก
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3">
          <h2 className="section-title">9. การแก้ไขข้อกำหนด</h2>
          <p className="text-slate-700">
            ระบบขอสงวนสิทธิ์ในการแก้ไขหรือปรับปรุงข้อกำหนดและเงื่อนไขนี้
            โดยจะแจ้งให้ผู้ใช้งานทราบผ่านช่องทางที่เหมาะสม
          </p>
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
          การเข้าใช้งานระบบถือว่าผู้ใช้งานยอมรับข้อกำหนดและเงื่อนไขฉบับนี้แล้ว
        </footer>

      </div>
  );
};

export default TermsContent;
