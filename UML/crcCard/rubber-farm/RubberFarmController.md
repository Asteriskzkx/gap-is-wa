# RubberFarmController

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> RubberFarmController</td>
    <td><b>รหัส:</b> 8</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่รับคำขอ (request) และส่งคำตอบ (response) สำหรับการจัดการข้อมูล RubberFarm</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง RubberFarm / Rubber Farm With Details (`createRubberFarmWithDetails`)</li>
  <li>ดึงข้อมูล RubberFarm / Rubber Farms By Farmer Id (`getRubberFarmsByFarmerId`)</li>
  <li>ดึงข้อมูล RubberFarm / Rubber Farm With Details (`getRubberFarmWithDetails`)</li>
  <li>อัปเดต RubberFarm / Rubber Farm (`updateRubberFarm`)</li>
  <li>อัปเดต RubberFarm / Rubber Farm With Details (`updateRubberFarmWithDetails`)</li>
  <li>ลบ RubberFarm / Rubber Farm (`deleteRubberFarm`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>RubberFarmService</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseController~RubberFarmModel~</li>
  <li>Association: ใช้งาน RubberFarmService</li>
</ul>
    </td>
  </tr>
</table>

