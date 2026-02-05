# BaseService~T~

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> BaseService~T~</td>
    <td><b>รหัส:</b> 14</td>
    <td><b>ประเภท:</b> Abstract</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสฐานแบบนามธรรมสำหรับเซอร์วิส (Service) เพื่อจัดการงาน CRUD ในชั้นตรรกะ และการจัดการข้อผิดพลาด</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>ดึงข้อมูล BaseService~T~ / By Id (`getById`)</li>
  <li>ดึงข้อมูล BaseService~T~ / All (`getAll`)</li>
  <li>สร้าง BaseService~T~ (`create`)</li>
  <li>อัปเดต BaseService~T~ (`update`)</li>
  <li>ลบ BaseService~T~ (`delete`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>BaseRepository~T~</li>
</ul>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>แอตทริบิวต์:</b><br/>
      <table border="0" cellspacing="0" cellpadding="4">
  <tr>
    <td valign="top"><ul>
  <li>repository (BaseRepository~T~)</li>
</ul></td>
    <td valign="top"><ul><li>-</li></ul></td>
  </tr>
</table>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Association: ใช้งาน BaseRepository~T~</li>
  <li>Association: ถูกใช้งานโดย BaseController~T~</li>
  <li>Dependency: พึ่งพา BaseModel ("T extends")</li>
</ul>
    </td>
  </tr>
</table>

