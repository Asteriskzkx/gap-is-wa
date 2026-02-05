# InspectionService

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> InspectionService</td>
    <td><b>รหัส:</b> 40</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการทางตรรกะทางธุรกิจกับข้อมูล Inspection และประสานงานกับรีโพซิทอรี/บริการที่เกี่ยวข้อง</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง Inspection / Inspection (`createInspection`)</li>
  <li>นัดหมาย Inspection (`scheduleInspection`)</li>
  <li>ดึงข้อมูล Inspection / Inspections By Rubber Farm Id (`getInspectionsByRubberFarmId`)</li>
  <li>ดึงข้อมูล Inspection / Inspections By Auditor Id (`getInspectionsByAuditorId`)</li>
  <li>ดึงข้อมูล Inspection / All With Pagination (`getAllWithPagination`)</li>
  <li>ดึงข้อมูล Inspection / Ready To Issue Inspections (`getReadyToIssueInspections`)</li>
  <li>อัปเดต Inspection / Inspection Status (`updateInspectionStatus`)</li>
  <li>อัปเดต Inspection / Inspection Result (`updateInspectionResult`)</li>
  <li>เพิ่ม Auditor To Inspection (`addAuditorToInspection`)</li>
  <li>นำออก Auditor From Inspection (`removeAuditorFromInspection`)</li>
  <li>ลบ Inspection / Inspection (`deleteInspection`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AdviceAndDefectRepository</li>
  <li>AuditLogService</li>
  <li>AuditorInspectionRepository</li>
  <li>AuditorService</li>
  <li>DataRecordRepository</li>
  <li>InspectionItemRepository</li>
  <li>InspectionRepository</li>
  <li>InspectionTypeMasterRepository</li>
  <li>RequirementRepository</li>
  <li>RubberFarmRepository</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseService~InspectionModel~</li>
  <li>Association: ใช้งาน AdviceAndDefectRepository</li>
  <li>Association: ใช้งาน AuditLogService</li>
  <li>Association: ใช้งาน AuditorInspectionRepository</li>
  <li>Association: ใช้งาน AuditorService</li>
  <li>Association: ใช้งาน DataRecordRepository</li>
  <li>Association: ใช้งาน InspectionItemRepository</li>
  <li>Association: ใช้งาน InspectionRepository</li>
  <li>Association: ใช้งาน InspectionTypeMasterRepository</li>
  <li>Association: ใช้งาน RequirementRepository</li>
  <li>Association: ใช้งาน RubberFarmRepository</li>
  <li>Association: ถูกใช้งานโดย InspectionController</li>
</ul>
    </td>
  </tr>
</table>

