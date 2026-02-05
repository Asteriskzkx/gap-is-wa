# CertificateRepository

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> CertificateRepository</td>
    <td><b>รหัส:</b> 62</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการกับฐานข้อมูลสำหรับข้อมูล Certificate เช่น การเพิ่ม การค้นหา การอัปเดต และการลบ</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง Certificate (`create`)</li>
  <li>ค้นหาข้อมูล Certificate ตาม Id (`findById`)</li>
  <li>ดึงข้อมูลทั้งหมด Certificate (`findAll`)</li>
  <li>ดึงข้อมูลทั้งหมด With Pagination (`findAllWithPagination`)</li>
  <li>อัปเดต Certificate (`update`)</li>
  <li>อัปเดต Certificate / With Lock (`updateWithLock`)</li>
  <li>ลบ Certificate (`delete`)</li>
  <li>เชื่อมโยง Committee (`linkCommittee`)</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseRepository~CertificateModel~</li>
  <li>Association: ถูกใช้งานโดย AuditorService</li>
  <li>Association: ถูกใช้งานโดย CertificateService</li>
</ul>
    </td>
  </tr>
</table>

