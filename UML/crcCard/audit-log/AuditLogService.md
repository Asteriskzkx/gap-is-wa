# AuditLogService

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> AuditLogService</td>
    <td><b>รหัส:</b> 67</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการทางตรรกะทางธุรกิจกับข้อมูล AuditLog และประสานงานกับรีโพซิทอรี/บริการที่เกี่ยวข้อง</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>ดำเนินการเมธอด `logAction`</li>
  <li>ดึงข้อมูล AuditLog / Record History (`getRecordHistory`)</li>
  <li>ดึงข้อมูล AuditLog / User Activity (`getUserActivity`)</li>
  <li>ดึงข้อมูล AuditLog / Logs By Action (`getLogsByAction`)</li>
  <li>ดึงข้อมูล AuditLog / Logs By Date Range (`getLogsByDateRange`)</li>
  <li>ดึงข้อมูล AuditLog / All Logs (`getAllLogs`)</li>
  <li>ดึงข้อมูล AuditLog / Logs With Pagination (`getLogsWithPagination`)</li>
  <li>ลบ AuditLog / Log (`deleteLog`)</li>
  <li>ลบ AuditLog / Old Logs (`deleteOldLogs`)</li>
  <li>ลบ AuditLog / Record Logs (`deleteRecordLogs`)</li>
  <li>ลบ AuditLog / All Logs (`deleteAllLogs`)</li>
  <li>นับ/สรุปจำนวน Logs (`countLogs`)</li>
  <li>นับ/สรุปจำนวน Old Logs (`countOldLogs`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditLogRepository</li>
  <li>UserRepository</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseService~AuditLogModel~</li>
  <li>Association: ใช้งาน AuditLogRepository</li>
  <li>Association: ใช้งาน UserRepository</li>
  <li>Association: ถูกใช้งานโดย AdminService</li>
  <li>Association: ถูกใช้งานโดย AdviceAndDefectService</li>
  <li>Association: ถูกใช้งานโดย AuditLogController</li>
  <li>Association: ถูกใช้งานโดย AuditorService</li>
  <li>Association: ถูกใช้งานโดย CertificateService</li>
  <li>Association: ถูกใช้งานโดย CommitteeService</li>
  <li>Association: ถูกใช้งานโดย DataRecordService</li>
  <li>Association: ถูกใช้งานโดย FarmerService</li>
  <li>Association: ถูกใช้งานโดย InspectionItemService</li>
  <li>Association: ถูกใช้งานโดย InspectionService</li>
  <li>Association: ถูกใช้งานโดย PlantingDetailService</li>
  <li>Association: ถูกใช้งานโดย RequirementService</li>
  <li>Association: ถูกใช้งานโดย RubberFarmService</li>
  <li>Association: ถูกใช้งานโดย UserService</li>
</ul>
    </td>
  </tr>
</table>

