# UserRepository

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> UserRepository</td>
    <td><b>รหัส:</b> 4</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการกับฐานข้อมูลสำหรับข้อมูล User เช่น การเพิ่ม การค้นหา การอัปเดต และการลบ</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง User (`create`)</li>
  <li>ค้นหาข้อมูล User ตาม Id (`findById`)</li>
  <li>ค้นหาข้อมูล User ตาม Email (`findByEmail`)</li>
  <li>ดึงข้อมูลทั้งหมด User (`findAll`)</li>
  <li>อัปเดต User (`update`)</li>
  <li>ลบ User (`delete`)</li>
  <li>ค้นหา Name Map By Ids (`findNameMapByIds`)</li>
  <li>ค้นหา With Filter And Pagination (`findWithFilterAndPagination`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>ฐานข้อมูล (Prisma Client)</li>
</ul>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>แอตทริบิวต์:</b><br/>
      ไม่มี (เป็นคลาสรีโพซิทอรี)
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Generalization (a-kind-of): สืบทอด BaseRepository~UserModel~</li>
  <li>Association: ถูกใช้งานโดย AuditLogService</li>
  <li>Association: ถูกใช้งานโดย UserService</li>
</ul>
    </td>
  </tr>
</table>

