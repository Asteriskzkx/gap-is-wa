# InspectionItemService

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> InspectionItemService</td>
    <td><b>รหัส:</b> 44</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการทางตรรกะทางธุรกิจกับข้อมูล InspectionItem และประสานงานกับรีโพซิทอรี/บริการที่เกี่ยวข้อง</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง InspectionItem / Inspection Item (`createInspectionItem`)</li>
  <li>ดึงข้อมูล InspectionItem / Inspection Items By Inspection Id (`getInspectionItemsByInspectionId`)</li>
  <li>อัปเดต InspectionItem / Inspection Item Result (`updateInspectionItemResult`)</li>
  <li>ลบ InspectionItem / Inspection Item (`deleteInspectionItem`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditLogService</li>
  <li>InspectionItemRepository</li>
  <li>RequirementRepository</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseService~InspectionItemModel~</li>
  <li>Association: ใช้งาน AuditLogService</li>
  <li>Association: ใช้งาน InspectionItemRepository</li>
  <li>Association: ใช้งาน RequirementRepository</li>
  <li>Association: ถูกใช้งานโดย InspectionItemController</li>
</ul>
    </td>
  </tr>
</table>

