# AdminController

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> AdminController</td>
    <td><b>รหัส:</b> 20</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่รับคำขอ (request) และส่งคำตอบ (response) สำหรับการจัดการข้อมูล Admin</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>เข้าสู่ระบบ Admin (`login`)</li>
  <li>ลงทะเบียน Admin (`registerAdmin`)</li>
  <li>ดึงข้อมูล Admin / Admin Profile (`getAdminProfile`)</li>
  <li>อัปเดต Admin / Admin Profile (`updateAdminProfile`)</li>
  <li>ดึงข้อมูล Admin / User Statistics (`getUserStatistics`)</li>
  <li>เปลี่ยน Admin / User Role (`changeUserRole`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AdminService</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseController~AdminModel~</li>
  <li>Association: ใช้งาน AdminService</li>
</ul>
    </td>
  </tr>
</table>

