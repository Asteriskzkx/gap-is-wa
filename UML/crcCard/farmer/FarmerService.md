# FarmerService

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> FarmerService</td>
    <td><b>รหัส:</b> 22</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการทางตรรกะทางธุรกิจกับข้อมูล Farmer และประสานงานกับรีโพซิทอรี/บริการที่เกี่ยวข้อง</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>เข้าสู่ระบบ Farmer (`login`)</li>
  <li>ลงทะเบียน Farmer (`registerFarmer`)</li>
  <li>ดึงข้อมูล Farmer / Farmer By User Id (`getFarmerByUserId`)</li>
  <li>อัปเดต Farmer / Farmer Profile (`updateFarmerProfile`)</li>
  <li>ดึงข้อมูล Farmer / Farmers By District (`getFarmersByDistrict`)</li>
  <li>ดึงข้อมูล Farmer / Farmers By Province (`getFarmersByProvince`)</li>
  <li>ดำเนินการเมธอด `validateIdentificationNumber`</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditLogService</li>
  <li>FarmerRepository</li>
  <li>UserService</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseService~FarmerModel~</li>
  <li>Association: ใช้งาน AuditLogService</li>
  <li>Association: ใช้งาน FarmerRepository</li>
  <li>Association: ใช้งาน UserService</li>
  <li>Association: ถูกใช้งานโดย AuditorService</li>
  <li>Association: ถูกใช้งานโดย FarmerController</li>
</ul>
    </td>
  </tr>
</table>

