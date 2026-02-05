# AuditorInspectionController

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> AuditorInspectionController</td>
    <td><b>รหัส:</b> 35</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่รับคำขอ (request) และส่งคำตอบ (response) สำหรับการจัดการข้อมูล AuditorInspection</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง AuditorInspection / Auditor Inspection (`createAuditorInspection`)</li>
  <li>ดึงข้อมูล AuditorInspection / Auditor Inspections By Auditor Id (`getAuditorInspectionsByAuditorId`)</li>
  <li>ดึงข้อมูล AuditorInspection / Auditor Inspections By Inspection Id (`getAuditorInspectionsByInspectionId`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditorInspectionService</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseController~AuditorInspectionModel~</li>
  <li>Association: ใช้งาน AuditorInspectionService</li>
</ul>
    </td>
  </tr>
</table>

