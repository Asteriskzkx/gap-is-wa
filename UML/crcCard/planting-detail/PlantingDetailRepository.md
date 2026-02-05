# PlantingDetailRepository

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> PlantingDetailRepository</td>
    <td><b>รหัส:</b> 58</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการกับฐานข้อมูลสำหรับข้อมูล PlantingDetail เช่น การเพิ่ม การค้นหา การอัปเดต และการลบ</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง PlantingDetail (`create`)</li>
  <li>สร้าง PlantingDetail / Many (`createMany`)</li>
  <li>ค้นหาข้อมูล PlantingDetail ตาม Id (`findById`)</li>
  <li>ค้นหาข้อมูล PlantingDetail ตาม Rubber Farm Id (`findByRubberFarmId`)</li>
  <li>ดึงข้อมูลทั้งหมด PlantingDetail (`findAll`)</li>
  <li>อัปเดต PlantingDetail (`update`)</li>
  <li>อัปเดต PlantingDetail / With Lock (`updateWithLock`)</li>
  <li>ลบ PlantingDetail (`delete`)</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseRepository~PlantingDetailModel~</li>
  <li>Association: ถูกใช้งานโดย PlantingDetailService</li>
  <li>Association: ถูกใช้งานโดย RubberFarmService</li>
</ul>
    </td>
  </tr>
</table>

