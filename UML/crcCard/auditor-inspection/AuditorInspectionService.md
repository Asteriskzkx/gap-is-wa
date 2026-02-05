# AuditorInspectionService

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> AuditorInspectionService</td>
    <td><b>รหัส:</b> 34</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการทางตรรกะทางธุรกิจกับข้อมูล AuditorInspection และประสานงานกับรีโพซิทอรี/บริการที่เกี่ยวข้อง</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง AuditorInspection / Auditor Inspection (`createAuditorInspection`)</li>
  <li>ดึงข้อมูล AuditorInspection / Auditor Inspections By Auditor Id (`getAuditorInspectionsByAuditorId`)</li>
  <li>ดึงข้อมูล AuditorInspection / Auditor Inspections By Inspection Id (`getAuditorInspectionsByInspectionId`)</li>
  <li>ลบ AuditorInspection / Auditor Inspection (`deleteAuditorInspection`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditorInspectionRepository</li>
</ul>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>แอตทริบิวต์:</b><br/>
      ไม่มี (เป็นคลาสเซอร์วิส)
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Generalization (a-kind-of): สืบทอด BaseService~AuditorInspectionModel~</li>
  <li>Association: ใช้งาน AuditorInspectionRepository</li>
  <li>Association: ถูกใช้งานโดย AuditorInspectionController</li>
</ul>
    </td>
  </tr>
</table>

