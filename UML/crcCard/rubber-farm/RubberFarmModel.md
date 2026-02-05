# RubberFarmModel

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> RubberFarmModel</td>
    <td><b>รหัส:</b> 6</td>
    <td><b>ประเภท:</b> Domain, Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่แทนข้อมูล RubberFarm โดยเป็นคลาสในการสร้างออบเจ็กต์ข้อมูล</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง RubberFarm (`create`)</li>
  <li>ตรวจสอบความถูกต้องของข้อมูล (`validate`)</li>
  <li>แปลงข้อมูลเป็น JSON (`toJSON`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>InspectionModel</li>
  <li>PlantingDetailModel</li>
</ul>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>แอตทริบิวต์:</b><br/>
      <table border="0" cellspacing="0" cellpadding="4">
  <tr>
    <td valign="top"><ul>
  <li>rubberFarmId (number)</li>
  <li>farmerId (number)</li>
  <li>villageName (string)</li>
  <li>moo (number)</li>
  <li>road (string)</li>
  <li>alley (string)</li>
</ul></td>
    <td valign="top"><ul>
  <li>subDistrict (string)</li>
  <li>district (string)</li>
  <li>province (string)</li>
  <li>location (any)</li>
  <li>productDistributionType (string)</li>
  <li>plantingDetails (any[])</li>
</ul></td>
  </tr>
</table>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Generalization (a-kind-of): สืบทอด BaseModel</li>
  <li>Composition (Has-a): มีองค์ประกอบเป็น PlantingDetailModel (plantingDetails)</li>
  <li>Composition (Has-a): มีองค์ประกอบเป็น InspectionModel (inspections)</li>
  <li>Composition (Part-of): เป็นองค์ประกอบของ InspectionModel (rubberFarm)</li>
</ul>
    </td>
  </tr>
</table>

