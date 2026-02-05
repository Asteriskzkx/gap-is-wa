# CommitteeRepository

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> CommitteeRepository</td>
    <td><b>รหัส:</b> 29</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการกับฐานข้อมูลสำหรับข้อมูล Committee เช่น การเพิ่ม การค้นหา การอัปเดต และการลบ</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง Committee (`create`)</li>
  <li>ค้นหาข้อมูล Committee ตาม Id (`findById`)</li>
  <li>ค้นหาข้อมูล Committee ตาม User Id (`findByUserId`)</li>
  <li>ดึงข้อมูลทั้งหมด Committee (`findAll`)</li>
  <li>อัปเดต Committee (`update`)</li>
  <li>ลบ Committee (`delete`)</li>
  <li>อัปเดต Committee / With Lock (`updateWithLock`)</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseRepository~CommitteeModel~</li>
  <li>Association: ถูกใช้งานโดย CommitteeService</li>
</ul>
    </td>
  </tr>
</table>

