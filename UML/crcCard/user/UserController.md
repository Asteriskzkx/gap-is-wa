# UserController

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> UserController</td>
    <td><b>รหัส:</b> 2</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่รับคำขอ (request) และส่งคำตอบ (response) สำหรับการจัดการข้อมูล User</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง User / User (`createUser`)</li>
  <li>ลงทะเบียน User (`register`)</li>
  <li>เข้าสู่ระบบ User (`login`)</li>
  <li>เปลี่ยน User / Password (`changePassword`)</li>
  <li>รีเซ็ต User / Password To Default (`resetPasswordToDefault`)</li>
  <li>ดึงข้อมูล User / Current User (`getCurrentUser`)</li>
  <li>ดำเนินการเมธอด `checkDuplicateEmail`</li>
  <li>เปลี่ยน User / Role (`changeRole`)</li>
  <li>ดึงข้อมูล User / Users Normalized (`getUsersNormalized`)</li>
  <li>ดึงข้อมูล User / All Users With Pagination (`getAllUsersWithPagination`)</li>
  <li>ลบ User (`delete`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>UserRegistrationFactoryService</li>
  <li>UserService</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseController~UserModel~</li>
  <li>Association: ใช้งาน UserRegistrationFactoryService</li>
  <li>Association: ใช้งาน UserService</li>
</ul>
    </td>
  </tr>
</table>

