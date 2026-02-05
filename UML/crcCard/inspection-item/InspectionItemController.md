# InspectionItemController

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> InspectionItemController</td>
    <td><b>รหัส:</b> 45</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่รับคำขอ (request) และส่งคำตอบ (response) สำหรับการจัดการข้อมูล InspectionItem</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง InspectionItem / Inspection Item (`createInspectionItem`)</li>
  <li>ดึงข้อมูล InspectionItem / Inspection Items By Inspection Id (`getInspectionItemsByInspectionId`)</li>
  <li>อัปเดต InspectionItem / Inspection Item Result (`updateInspectionItemResult`)</li>
  <li>อัปเดต InspectionItem / Inspection Item Results Bulk (`updateInspectionItemResultsBulk`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>InspectionItemService</li>
</ul>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>แอตทริบิวต์:</b><br/>
      ไม่มี (เป็นคลาสคอนโทรลเลอร์)
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Generalization (a-kind-of): สืบทอด BaseController~InspectionItemModel~</li>
  <li>Association: ใช้งาน InspectionItemService</li>
</ul>
    </td>
  </tr>
</table>

