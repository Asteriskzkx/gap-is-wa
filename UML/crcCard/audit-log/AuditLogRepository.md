# AuditLogRepository

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> AuditLogRepository</td>
    <td><b>รหัส:</b> 66</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการกับฐานข้อมูลสำหรับข้อมูล AuditLog เช่น การเพิ่ม การค้นหา การอัปเดต และการลบ</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง AuditLog (`create`)</li>
  <li>ค้นหาข้อมูล AuditLog ตาม Id (`findById`)</li>
  <li>ดึงข้อมูลทั้งหมด AuditLog (`findAll`)</li>
  <li>ดึงข้อมูลทั้งหมด With Pagination (`findAllWithPagination`)</li>
  <li>อัปเดต AuditLog (`update`)</li>
  <li>ลบ AuditLog (`delete`)</li>
  <li>ค้นหาข้อมูล AuditLog ตาม Table And Record Id (`findByTableAndRecordId`)</li>
  <li>ค้นหาข้อมูล AuditLog ตาม User Id (`findByUserId`)</li>
  <li>ค้นหาข้อมูล AuditLog ตาม Action (`findByAction`)</li>
  <li>ค้นหาข้อมูล AuditLog ตาม Date Range (`findByDateRange`)</li>
  <li>ลบ AuditLog / Older Than (`deleteOlderThan`)</li>
  <li>ลบ AuditLog / By Table And Record Id (`deleteByTableAndRecordId`)</li>
  <li>ลบ AuditLog / All (`deleteAll`)</li>
  <li>นับ/สรุปจำนวน AuditLog (`count`)</li>
  <li>นับ/สรุปจำนวน Older Than (`countOlderThan`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>ฐานข้อมูล (Prisma Client)</li>
</ul>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>แอตทริบิวต์:</b><br/>
      ไม่มี (เป็นคลาสรีโพซิทอรี)
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Generalization (a-kind-of): สืบทอด BaseRepository~AuditLogModel~</li>
  <li>Association: ถูกใช้งานโดย AuditLogService</li>
</ul>
    </td>
  </tr>
</table>

