# AuditorController

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> AuditorController</td>
    <td><b>รหัส:</b> 27</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่รับคำขอ (request) และส่งคำตอบ (response) สำหรับการจัดการข้อมูล Auditor</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>เข้าสู่ระบบ Auditor (`login`)</li>
  <li>ลงทะเบียน Auditor (`registerAuditor`)</li>
  <li>ดึงข้อมูล Auditor / Current Auditor (`getCurrentAuditor`)</li>
  <li>ดึงข้อมูล Auditor / Auditor Profile (`getAuditorProfile`)</li>
  <li>อัปเดต Auditor / Auditor Profile (`updateAuditorProfile`)</li>
  <li>ดึงข้อมูล Auditor / Other Auditors (`getOtherAuditors`)</li>
  <li>ดึงข้อมูล Auditor / Available Farms (`getAvailableFarms`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditorService</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseController~AuditorModel~</li>
  <li>Association: ใช้งาน AuditorService</li>
</ul>
    </td>
  </tr>
</table>

