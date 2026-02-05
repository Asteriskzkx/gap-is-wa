# AuditorRepository

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> AuditorRepository</td>
    <td><b>รหัส:</b> 25</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการกับฐานข้อมูลสำหรับข้อมูล Auditor เช่น การเพิ่ม การค้นหา การอัปเดต และการลบ</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง Auditor (`create`)</li>
  <li>ค้นหาข้อมูล Auditor ตาม Id (`findById`)</li>
  <li>ค้นหาข้อมูล Auditor ตาม User Id (`findByUserId`)</li>
  <li>ดึงข้อมูลทั้งหมด Auditor (`findAll`)</li>
  <li>อัปเดต Auditor (`update`)</li>
  <li>ลบ Auditor (`delete`)</li>
  <li>อัปเดต Auditor / With Lock (`updateWithLock`)</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseRepository~AuditorModel~</li>
  <li>Association: ถูกใช้งานโดย AuditorService</li>
</ul>
    </td>
  </tr>
</table>

