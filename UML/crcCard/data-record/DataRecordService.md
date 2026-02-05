# DataRecordService

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> DataRecordService</td>
    <td><b>รหัส:</b> 52</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการทางตรรกะทางธุรกิจกับข้อมูล DataRecord และประสานงานกับรีโพซิทอรี/บริการที่เกี่ยวข้อง</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง DataRecord / Data Record (`createDataRecord`)</li>
  <li>ดึงข้อมูล DataRecord / Data Record By Inspection Id (`getDataRecordByInspectionId`)</li>
  <li>อัปเดต DataRecord / Data Record (`updateDataRecord`)</li>
  <li>ลบ DataRecord / Data Record (`deleteDataRecord`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditLogService</li>
  <li>DataRecordRepository</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseService~DataRecordModel~</li>
  <li>Association: ใช้งาน AuditLogService</li>
  <li>Association: ใช้งาน DataRecordRepository</li>
  <li>Association: ถูกใช้งานโดย DataRecordController</li>
</ul>
    </td>
  </tr>
</table>

