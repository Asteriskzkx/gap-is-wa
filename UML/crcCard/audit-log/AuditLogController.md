# AuditLogController

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> AuditLogController</td>
    <td><b>รหัส:</b> 68</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่รับคำขอ (request) และส่งคำตอบ (response) สำหรับการจัดการข้อมูล AuditLog</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>ดึงข้อมูล AuditLog / All Logs (`getAllLogs`)</li>
  <li>ดึงข้อมูล AuditLog / Logs With Pagination (`getLogsWithPagination`)</li>
  <li>ดึงข้อมูล AuditLog / Record History (`getRecordHistory`)</li>
  <li>ดึงข้อมูล AuditLog / User Activity (`getUserActivity`)</li>
  <li>ดึงข้อมูล AuditLog / Logs By Action (`getLogsByAction`)</li>
  <li>ดึงข้อมูล AuditLog / Logs By Date Range (`getLogsByDateRange`)</li>
  <li>ลบ AuditLog / Log (`deleteLog`)</li>
  <li>ลบ AuditLog / Old Logs (`deleteOldLogs`)</li>
  <li>ลบ AuditLog / Record Logs (`deleteRecordLogs`)</li>
  <li>ลบ AuditLog / All Logs (`deleteAllLogs`)</li>
  <li>นับ/สรุปจำนวน Old Logs (`countOldLogs`)</li>
  <li>ดึงข้อมูล AuditLog / Stats (`getStats`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditLogService</li>
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
  <li>Association: ใช้งาน AuditLogService</li>
</ul>
    </td>
  </tr>
</table>

