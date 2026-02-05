# RubberFarmRepository

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> RubberFarmRepository</td>
    <td><b>รหัส:</b> 10</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการกับฐานข้อมูลสำหรับข้อมูล RubberFarm เช่น การเพิ่ม การค้นหา การอัปเดต และการลบ</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง RubberFarm (`create`)</li>
  <li>ค้นหาข้อมูล RubberFarm ตาม Id (`findById`)</li>
  <li>ค้นหาข้อมูล RubberFarm ตาม Farmer Id (`findByFarmerId`)</li>
  <li>ค้นหาข้อมูล RubberFarm ตาม Rubber Farm Id (`findByRubberFarmId`)</li>
  <li>ดึงข้อมูลทั้งหมด RubberFarm (`findAll`)</li>
  <li>ดึงข้อมูลทั้งหมด With Farmer Details (`findAllWithFarmerDetails`)</li>
  <li>อัปเดต RubberFarm (`update`)</li>
  <li>อัปเดต RubberFarm / With Lock (`updateWithLock`)</li>
  <li>ลบ RubberFarm (`delete`)</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseRepository~RubberFarmModel~</li>
  <li>Association: ถูกใช้งานโดย AuditorService</li>
  <li>Association: ถูกใช้งานโดย InspectionService</li>
  <li>Association: ถูกใช้งานโดย RubberFarmService</li>
</ul>
    </td>
  </tr>
</table>

