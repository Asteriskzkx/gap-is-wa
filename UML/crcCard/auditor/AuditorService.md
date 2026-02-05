# AuditorService

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> AuditorService</td>
    <td><b>รหัส:</b> 26</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการทางตรรกะทางธุรกิจกับข้อมูล Auditor และประสานงานกับรีโพซิทอรี/บริการที่เกี่ยวข้อง</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>เข้าสู่ระบบ Auditor (`login`)</li>
  <li>ลงทะเบียน Auditor (`registerAuditor`)</li>
  <li>ดึงข้อมูล Auditor / Auditor By User Id (`getAuditorByUserId`)</li>
  <li>อัปเดต Auditor / Auditor Profile (`updateAuditorProfile`)</li>
  <li>ดึงข้อมูล Auditor / Inspection Types (`getInspectionTypes`)</li>
  <li>ดึงข้อมูล Auditor / Auditor List Except (`getAuditorListExcept`)</li>
  <li>ดึงข้อมูล Auditor / Available Rubber Farms (`getAvailableRubberFarms`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditLogService</li>
  <li>AuditorRepository</li>
  <li>CertificateRepository</li>
  <li>FarmerService</li>
  <li>InspectionRepository</li>
  <li>InspectionTypeMasterRepository</li>
  <li>RubberFarmRepository</li>
  <li>UserService</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseService~AuditorModel~</li>
  <li>Association: ใช้งาน AuditLogService</li>
  <li>Association: ใช้งาน AuditorRepository</li>
  <li>Association: ใช้งาน CertificateRepository</li>
  <li>Association: ใช้งาน FarmerService</li>
  <li>Association: ใช้งาน InspectionRepository</li>
  <li>Association: ใช้งาน InspectionTypeMasterRepository</li>
  <li>Association: ใช้งาน RubberFarmRepository</li>
  <li>Association: ใช้งาน UserService</li>
  <li>Association: ถูกใช้งานโดย AuditorController</li>
  <li>Association: ถูกใช้งานโดย InspectionService</li>
</ul>
    </td>
  </tr>
</table>

