# InspectionTypeMasterRepository

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> InspectionTypeMasterRepository</td>
    <td><b>รหัส:</b> 37</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการกับฐานข้อมูลสำหรับข้อมูล InspectionTypeMaster เช่น การเพิ่ม การค้นหา การอัปเดต และการลบ</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง InspectionTypeMaster (`create`)</li>
  <li>ค้นหาข้อมูล InspectionTypeMaster ตาม Id (`findById`)</li>
  <li>ดึงข้อมูลทั้งหมด InspectionTypeMaster (`findAll`)</li>
  <li>อัปเดต InspectionTypeMaster (`update`)</li>
  <li>ลบ InspectionTypeMaster (`delete`)</li>
  <li>ค้นหาข้อมูล InspectionTypeMaster ตาม Inspection Type Id (`findByInspectionTypeId`)</li>
  <li>นับ/สรุปจำนวน Inspections This Month (`countInspectionsThisMonth`)</li>
  <li>ค้นหา Inspection Items By Type Id (`findInspectionItemsByTypeId`)</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseRepository~InspectionTypeMasterModel~</li>
  <li>Association: ถูกใช้งานโดย AuditorService</li>
  <li>Association: ถูกใช้งานโดย InspectionService</li>
</ul>
    </td>
  </tr>
</table>

