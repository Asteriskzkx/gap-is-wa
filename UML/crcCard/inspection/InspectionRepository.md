# InspectionRepository

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> InspectionRepository</td>
    <td><b>รหัส:</b> 39</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการกับฐานข้อมูลสำหรับข้อมูล Inspection เช่น การเพิ่ม การค้นหา การอัปเดต และการลบ</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง Inspection (`create`)</li>
  <li>ค้นหาข้อมูล Inspection ตาม Id (`findById`)</li>
  <li>ค้นหาข้อมูล Inspection ตาม Rubber Farm Id (`findByRubberFarmId`)</li>
  <li>ค้นหาข้อมูล Inspection ตาม Auditor Id (`findByAuditorId`)</li>
  <li>ค้นหาข้อมูล Inspection ตาม Auditor Id With Pagination (`findByAuditorIdWithPagination`)</li>
  <li>ดึงข้อมูลทั้งหมด Inspection (`findAll`)</li>
  <li>ดึงข้อมูลทั้งหมด With Pagination (`findAllWithPagination`)</li>
  <li>อัปเดต Inspection (`update`)</li>
  <li>อัปเดต Inspection / With Lock (`updateWithLock`)</li>
  <li>ลบ Inspection (`delete`)</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseRepository~InspectionModel~</li>
  <li>Association: ถูกใช้งานโดย AuditorService</li>
  <li>Association: ถูกใช้งานโดย InspectionService</li>
  <li>Association: ถูกใช้งานโดย RubberFarmService</li>
</ul>
    </td>
  </tr>
</table>

