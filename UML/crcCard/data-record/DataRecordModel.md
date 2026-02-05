# DataRecordModel

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> DataRecordModel</td>
    <td><b>รหัส:</b> 50</td>
    <td><b>ประเภท:</b> Domain, Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่แทนข้อมูล DataRecord โดยเป็นคลาสในการสร้างออบเจ็กต์ข้อมูล</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง DataRecord (`create`)</li>
  <li>ตรวจสอบความถูกต้องของข้อมูล (`validate`)</li>
  <li>แปลงข้อมูลเป็น JSON (`toJSON`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>InspectionModel</li>
</ul>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>แอตทริบิวต์:</b><br/>
      <table border="0" cellspacing="0" cellpadding="4">
  <tr>
    <td valign="top"><ul>
  <li>dataRecordId (number)</li>
  <li>inspectionId (number)</li>
  <li>species (any)</li>
  <li>waterSystem (any)</li>
  <li>fertilizers (any)</li>
</ul></td>
    <td valign="top"><ul>
  <li>previouslyCultivated (any)</li>
  <li>plantDisease (any)</li>
  <li>relatedPlants (any)</li>
  <li>moreInfo (string)</li>
  <li>map (any)</li>
</ul></td>
  </tr>
</table>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Generalization (a-kind-of): สืบทอด BaseModel</li>
  <li>Composition (Part-of): เป็นองค์ประกอบของ InspectionModel (dataRecord)</li>
</ul>
    </td>
  </tr>
</table>

