# BaseRepository~T~

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> BaseRepository~T~</td>
    <td><b>รหัส:</b> 13</td>
    <td><b>ประเภท:</b> Abstract</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสฐานแบบนามธรรมสำหรับรีโพซิทอรี (Repository) เพื่อจัดการงาน CRUD และเมธอดช่วยเหลือที่เกี่ยวข้องกับฐานข้อมูล</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง BaseRepository~T~ (`create`)</li>
  <li>ค้นหาข้อมูล BaseRepository~T~ ตาม Id (`findById`)</li>
  <li>ดึงข้อมูลทั้งหมด BaseRepository~T~ (`findAll`)</li>
  <li>อัปเดต BaseRepository~T~ (`update`)</li>
  <li>ลบ BaseRepository~T~ (`delete`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul><li>-</li></ul>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>แอตทริบิวต์:</b><br/>
      <table border="0" cellspacing="0" cellpadding="4">
  <tr>
    <td valign="top"><ul>
  <li>prisma</li>
</ul></td>
    <td valign="top"><ul>
  <li>mapper</li>
</ul></td>
  </tr>
</table>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Association: ถูกใช้งานโดย BaseService~T~</li>
  <li>Dependency: พึ่งพา BaseModel ("T extends")</li>
</ul>
    </td>
  </tr>
</table>

