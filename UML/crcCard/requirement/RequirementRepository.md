# RequirementRepository

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> RequirementRepository</td>
    <td><b>รหัส:</b> 47</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการกับฐานข้อมูลสำหรับข้อมูล Requirement เช่น การเพิ่ม การค้นหา การอัปเดต และการลบ</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง Requirement (`create`)</li>
  <li>ค้นหาข้อมูล Requirement ตาม Id (`findById`)</li>
  <li>ค้นหาข้อมูล Requirement ตาม Inspection Item Id (`findByInspectionItemId`)</li>
  <li>ดึงข้อมูลทั้งหมด Requirement (`findAll`)</li>
  <li>อัปเดต Requirement (`update`)</li>
  <li>อัปเดต Requirement / With Lock (`updateWithLock`)</li>
  <li>ลบ Requirement (`delete`)</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseRepository~RequirementModel~</li>
  <li>Association: ถูกใช้งานโดย InspectionItemService</li>
  <li>Association: ถูกใช้งานโดย InspectionService</li>
  <li>Association: ถูกใช้งานโดย RequirementService</li>
</ul>
    </td>
  </tr>
</table>

