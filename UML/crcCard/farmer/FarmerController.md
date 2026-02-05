# FarmerController

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> FarmerController</td>
    <td><b>รหัส:</b> 23</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่รับคำขอ (request) และส่งคำตอบ (response) สำหรับการจัดการข้อมูล Farmer</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>เข้าสู่ระบบ Farmer (`login`)</li>
  <li>ลงทะเบียน Farmer (`registerFarmer`)</li>
  <li>ดึงข้อมูล Farmer / Current Farmer (`getCurrentFarmer`)</li>
  <li>ดึงข้อมูล Farmer / Farmer Profile (`getFarmerProfile`)</li>
  <li>อัปเดต Farmer / Farmer Profile (`updateFarmerProfile`)</li>
  <li>ดึงข้อมูล Farmer / Farmers By District (`getFarmersByDistrict`)</li>
  <li>ดึงข้อมูล Farmer / Farmers By Province (`getFarmersByProvince`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>FarmerService</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseController~FarmerModel~</li>
  <li>Association: ใช้งาน FarmerService</li>
</ul>
    </td>
  </tr>
</table>

