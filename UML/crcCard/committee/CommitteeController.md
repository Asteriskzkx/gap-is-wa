# CommitteeController

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> CommitteeController</td>
    <td><b>รหัส:</b> 31</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่รับคำขอ (request) และส่งคำตอบ (response) สำหรับการจัดการข้อมูล Committee</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>เข้าสู่ระบบ Committee (`login`)</li>
  <li>ลงทะเบียน Committee (`registerCommittee`)</li>
  <li>ดึงข้อมูล Committee / Current Committee (`getCurrentCommittee`)</li>
  <li>ดึงข้อมูล Committee / Committee Profile (`getCommitteeProfile`)</li>
  <li>อัปเดต Committee / Committee Profile (`updateCommitteeProfile`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>CommitteeService</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseController~CommitteeModel~</li>
  <li>Association: ใช้งาน CommitteeService</li>
</ul>
    </td>
  </tr>
</table>

