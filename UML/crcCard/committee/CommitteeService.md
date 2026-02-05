# CommitteeService

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> CommitteeService</td>
    <td><b>รหัส:</b> 30</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการทางตรรกะทางธุรกิจกับข้อมูล Committee และประสานงานกับรีโพซิทอรี/บริการที่เกี่ยวข้อง</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>เข้าสู่ระบบ Committee (`login`)</li>
  <li>ลงทะเบียน Committee (`registerCommittee`)</li>
  <li>ดึงข้อมูล Committee / Committee By User Id (`getCommitteeByUserId`)</li>
  <li>อัปเดต Committee / Committee Profile (`updateCommitteeProfile`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditLogService</li>
  <li>CommitteeRepository</li>
  <li>UserService</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseService~CommitteeModel~</li>
  <li>Association: ใช้งาน AuditLogService</li>
  <li>Association: ใช้งาน CommitteeRepository</li>
  <li>Association: ใช้งาน UserService</li>
  <li>Association: ถูกใช้งานโดย CommitteeController</li>
</ul>
    </td>
  </tr>
</table>

