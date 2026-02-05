# FileController

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> FileController</td>
    <td><b>รหัส:</b> 72</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่รับคำขอ (request) และส่งคำตอบ (response) สำหรับการจัดการข้อมูล File</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>ดำเนินการเมธอด `uploadFiles`</li>
  <li>ดึงข้อมูล File / Files (`getFiles`)</li>
  <li>ลบ File / Files By Reference (`deleteFilesByReference`)</li>
  <li>ลบ File / File By Id (`deleteFileById`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>FileService</li>
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
  <li>Association: ใช้งาน FileService</li>
</ul>
    </td>
  </tr>
</table>

