# InspectionController

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> InspectionController</td>
    <td><b>รหัส:</b> 41</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่รับคำขอ (request) และส่งคำตอบ (response) สำหรับการจัดการข้อมูล Inspection</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>นัดหมาย Inspection (`scheduleInspection`)</li>
  <li>สร้าง Inspection / Inspection (`createInspection`)</li>
  <li>ดึงข้อมูล Inspection / Inspections By Rubber Farm (`getInspectionsByRubberFarm`)</li>
  <li>ดึงข้อมูล Inspection / Inspections By Auditor (`getInspectionsByAuditor`)</li>
  <li>ดึงข้อมูล Inspection / All (`getAll`)</li>
  <li>ดึงข้อมูล Inspection / Ready To Issue (`getReadyToIssue`)</li>
  <li>อัปเดต Inspection / Inspection Status (`updateInspectionStatus`)</li>
  <li>อัปเดต Inspection / Inspection Result (`updateInspectionResult`)</li>
  <li>เพิ่ม Auditor To Inspection (`addAuditorToInspection`)</li>
  <li>นำออก Auditor From Inspection (`removeAuditorFromInspection`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>InspectionService</li>
</ul>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>แอตทริบิวต์:</b><br/>
      ไม่มี (เป็นคลาสคอนโทรลเลอร์)
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Generalization (a-kind-of): สืบทอด BaseController~InspectionModel~</li>
  <li>Association: ใช้งาน InspectionService</li>
</ul>
    </td>
  </tr>
</table>

