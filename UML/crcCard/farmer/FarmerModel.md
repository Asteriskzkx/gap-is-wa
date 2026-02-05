# FarmerModel

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> FarmerModel</td>
    <td><b>รหัส:</b> 5</td>
    <td><b>ประเภท:</b> Domain, Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่แทนข้อมูล Farmer โดยเป็นคลาสในการสร้างออบเจ็กต์ข้อมูล</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง Farmer / Farmer (`createFarmer`)</li>
  <li>ตรวจสอบความถูกต้องของข้อมูล (`validate`)</li>
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
  <li>farmerId (number)</li>
  <li>namePrefix (string)</li>
  <li>firstName (string)</li>
  <li>lastName (string)</li>
  <li>identificationNumber (string)</li>
  <li>birthDate (Date)</li>
  <li>gender (string)</li>
  <li>houseNo (string)</li>
  <li>villageName (string)</li>
</ul></td>
    <td valign="top"><ul>
  <li>moo (number)</li>
  <li>road (string)</li>
  <li>alley (string)</li>
  <li>subDistrict (string)</li>
  <li>district (string)</li>
  <li>provinceName (string)</li>
  <li>zipCode (string)</li>
  <li>phoneNumber (string)</li>
  <li>mobilePhoneNumber (string)</li>
</ul></td>
  </tr>
</table>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Generalization (a-kind-of): สืบทอด UserModel</li>
</ul>
    </td>
  </tr>
</table>

