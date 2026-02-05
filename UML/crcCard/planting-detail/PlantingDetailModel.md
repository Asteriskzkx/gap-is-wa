# PlantingDetailModel

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> PlantingDetailModel</td>
    <td><b>รหัส:</b> 7</td>
    <td><b>ประเภท:</b> Domain, Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่แทนข้อมูล PlantingDetail โดยเป็นคลาสในการสร้างออบเจ็กต์ข้อมูล</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง PlantingDetail (`create`)</li>
  <li>ตรวจสอบความถูกต้องของข้อมูล (`validate`)</li>
  <li>แปลงข้อมูลเป็น JSON (`toJSON`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>RubberFarmModel</li>
</ul>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>แอตทริบิวต์:</b><br/>
      <table border="0" cellspacing="0" cellpadding="4">
  <tr>
    <td valign="top"><ul>
  <li>plantingDetailId (number)</li>
  <li>rubberFarmId (number)</li>
  <li>specie (string)</li>
  <li>areaOfPlot (number)</li>
  <li>numberOfRubber (number)</li>
</ul></td>
    <td valign="top"><ul>
  <li>numberOfTapping (number)</li>
  <li>ageOfRubber (number)</li>
  <li>yearOfTapping (Date)</li>
  <li>monthOfTapping (Date)</li>
  <li>totalProduction (number)</li>
</ul></td>
  </tr>
</table>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Generalization (a-kind-of): สืบทอด BaseModel</li>
  <li>Composition (Part-of): เป็นองค์ประกอบของ RubberFarmModel (plantingDetails)</li>
</ul>
    </td>
  </tr>
</table>

