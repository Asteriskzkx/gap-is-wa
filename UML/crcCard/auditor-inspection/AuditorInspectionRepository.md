# AuditorInspectionRepository

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> AuditorInspectionRepository</td>
    <td><b>รหัส:</b> 33</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการกับฐานข้อมูลสำหรับข้อมูล AuditorInspection เช่น การเพิ่ม การค้นหา การอัปเดต และการลบ</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง AuditorInspection (`create`)</li>
  <li>ค้นหาข้อมูล AuditorInspection ตาม Id (`findById`)</li>
  <li>ค้นหาข้อมูล AuditorInspection ตาม Auditor Id (`findByAuditorId`)</li>
  <li>ค้นหาข้อมูล AuditorInspection ตาม Inspection Id (`findByInspectionId`)</li>
  <li>ดึงข้อมูลทั้งหมด AuditorInspection (`findAll`)</li>
  <li>อัปเดต AuditorInspection (`update`)</li>
  <li>ลบ AuditorInspection (`delete`)</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseRepository~AuditorInspectionModel~</li>
  <li>Association: ถูกใช้งานโดย AuditorInspectionService</li>
  <li>Association: ถูกใช้งานโดย InspectionService</li>
</ul>
    </td>
  </tr>
</table>

