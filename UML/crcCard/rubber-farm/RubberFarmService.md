# RubberFarmService

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> RubberFarmService</td>
    <td><b>รหัส:</b> 9</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการทางตรรกะทางธุรกิจกับข้อมูล RubberFarm และประสานงานกับรีโพซิทอรี/บริการที่เกี่ยวข้อง</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง RubberFarm / Rubber Farm With Details (`createRubberFarmWithDetails`)</li>
  <li>ดึงข้อมูล RubberFarm / Rubber Farms By Farmer Id (`getRubberFarmsByFarmerId`)</li>
  <li>ดึงข้อมูล RubberFarm / Rubber Farms By Farmer Id With Pagination (`getRubberFarmsByFarmerIdWithPagination`)</li>
  <li>ดึงข้อมูล RubberFarm / Rubber Farm With Details (`getRubberFarmWithDetails`)</li>
  <li>อัปเดต RubberFarm / Rubber Farm (`updateRubberFarm`)</li>
  <li>อัปเดต RubberFarm / Rubber Farm With Details (`updateRubberFarmWithDetails`)</li>
  <li>ลบ RubberFarm / Rubber Farm (`deleteRubberFarm`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditLogService</li>
  <li>InspectionRepository</li>
  <li>PlantingDetailRepository</li>
  <li>RubberFarmRepository</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseService~RubberFarmModel~</li>
  <li>Association: ใช้งาน AuditLogService</li>
  <li>Association: ใช้งาน InspectionRepository</li>
  <li>Association: ใช้งาน PlantingDetailRepository</li>
  <li>Association: ใช้งาน RubberFarmRepository</li>
  <li>Association: ถูกใช้งานโดย RubberFarmController</li>
</ul>
    </td>
  </tr>
</table>

