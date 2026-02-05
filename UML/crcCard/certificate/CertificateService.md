# CertificateService

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> CertificateService</td>
    <td><b>รหัส:</b> 63</td>
    <td><b>ประเภท:</b> Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่ดำเนินการทางตรรกะทางธุรกิจกับข้อมูล Certificate และประสานงานกับรีโพซิทอรี/บริการที่เกี่ยวข้อง</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง Certificate / Certificate (`createCertificate`)</li>
  <li>ดึงข้อมูล Certificate / Already Issued (`getAlreadyIssued`)</li>
  <li>เพิกถอน Certificate (`revokeCertificate`)</li>
  <li>อัปเดต Certificate / Cancel Request Detail (`updateCancelRequestDetail`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AuditLogService</li>
  <li>CertificateRepository</li>
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
  <li>Generalization (a-kind-of): สืบทอด BaseService~CertificateModel~</li>
  <li>Association: ใช้งาน AuditLogService</li>
  <li>Association: ใช้งาน CertificateRepository</li>
  <li>Association: ถูกใช้งานโดย CertificateController</li>
</ul>
    </td>
  </tr>
</table>

