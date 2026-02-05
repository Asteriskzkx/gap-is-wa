# AdviceAndDefectService

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> AdviceAndDefectService</td>
    <td><b>รหัส:</b> 56</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการทางตรรกะทางธุรกิจกับข้อมูล AdviceAndDefect และประสานงานกับรีโพซิทอรี/บริการที่เกี่ยวข้อง</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง AdviceAndDefect / Advice And Defect (`createAdviceAndDefect`)</li>
  <li>ดึงข้อมูล AdviceAndDefect / Advice And Defect By Inspection Id (`getAdviceAndDefectByInspectionId`)</li>
  <li>อัปเดต AdviceAndDefect / Advice And Defect (`updateAdviceAndDefect`)</li>
  <li>ลบ AdviceAndDefect / Advice And Defect (`deleteAdviceAndDefect`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AdviceAndDefectRepository</li>
  <li>AuditLogService</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseService~AdviceAndDefectModel~</li>
  <li>Association: ใช้งาน AdviceAndDefectRepository</li>
  <li>Association: ใช้งาน AuditLogService</li>
  <li>Association: ถูกใช้งานโดย AdviceAndDefectController</li>
</ul>
    </td>
  </tr>
</table>

