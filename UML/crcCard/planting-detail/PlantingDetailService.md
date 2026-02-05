# PlantingDetailService

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> PlantingDetailService</td>
    <td><b>รหัส:</b> 59</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการทางตรรกะทางธุรกิจกับข้อมูล PlantingDetail และประสานงานกับรีโพซิทอรี/บริการที่เกี่ยวข้อง</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง PlantingDetail / Planting Detail (`createPlantingDetail`)</li>
  <li>ดึงข้อมูล PlantingDetail / Planting Details By Rubber Farm Id (`getPlantingDetailsByRubberFarmId`)</li>
  <li>อัปเดต PlantingDetail / Planting Detail (`updatePlantingDetail`)</li>
  <li>ลบ PlantingDetail (`delete`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditLogService</li>
  <li>PlantingDetailRepository</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseService~PlantingDetailModel~</li>
  <li>Association: ใช้งาน AuditLogService</li>
  <li>Association: ใช้งาน PlantingDetailRepository</li>
  <li>Association: ถูกใช้งานโดย PlantingDetailController</li>
</ul>
    </td>
  </tr>
</table>

