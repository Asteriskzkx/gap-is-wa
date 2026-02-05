# UserService

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> UserService</td>
    <td><b>รหัส:</b> 3</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการทางตรรกะทางธุรกิจกับข้อมูล User และประสานงานกับรีโพซิทอรี/บริการที่เกี่ยวข้อง</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>ค้นหาข้อมูล User ตาม Email (`findByEmail`)</li>
  <li>ลงทะเบียน User (`register`)</li>
  <li>เข้าสู่ระบบ User (`login`)</li>
  <li>เปลี่ยน User / Password (`changePassword`)</li>
  <li>รีเซ็ต User / Password To Default (`resetPasswordToDefault`)</li>
  <li>เปลี่ยน User / Role (`changeRole`)</li>
  <li>ดึงข้อมูล User / Users Normalized By Id (`getUsersNormalizedById`)</li>
  <li>ดึงข้อมูล User / Users With Filter And Pagination (`getUsersWithFilterAndPagination`)</li>
  <li>ลบ User (`delete`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditLogService</li>
  <li>UserRepository</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseService~UserModel~</li>
  <li>Association: ใช้งาน AuditLogService</li>
  <li>Association: ใช้งาน UserRepository</li>
  <li>Association: ถูกใช้งานโดย AdminService</li>
  <li>Association: ถูกใช้งานโดย AuditorService</li>
  <li>Association: ถูกใช้งานโดย CommitteeService</li>
  <li>Association: ถูกใช้งานโดย FarmerService</li>
  <li>Association: ถูกใช้งานโดย UserController</li>
</ul>
    </td>
  </tr>
</table>

