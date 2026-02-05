# UserModel

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> UserModel</td>
    <td><b>รหัส:</b> 1</td>
    <td><b>ประเภท:</b> Domain, Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่แทนข้อมูล User โดยเป็นคลาสในการสร้างออบเจ็กต์ข้อมูล</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง User (`create`)</li>
  <li>แฮชรหัสผ่าน (`hashPassword`)</li>
  <li>ตรวจสอบรหัสผ่าน (`comparePassword`)</li>
  <li>ตรวจสอบความถูกต้องของข้อมูล (`validate`)</li>
  <li>ตรวจสอบสิทธิ์การใช้งาน (`hasPermission`)</li>
  <li>แปลงข้อมูลเป็น JSON (`toJSON`)</li>
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
  <li>email (string)</li>
  <li>hashedPassword (string)</li>
</ul></td>
    <td valign="top"><ul>
  <li>name (string)</li>
  <li>role (UserRole)</li>
</ul></td>
  </tr>
</table>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Generalization (a-kind-of): สืบทอด BaseModel</li>
  <li>Generalization (a-kind-of): ถูกสืบทอดโดย AdminModel, AuditorModel, CommitteeModel, FarmerModel</li>
</ul>
    </td>
  </tr>
</table>

