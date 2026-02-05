# InspectionModel

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> InspectionModel</td>
    <td><b>รหัส:</b> 38</td>
    <td><b>ประเภท:</b> Domain, Concrete</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสที่แทนข้อมูล Inspection โดยเป็นคลาสในการสร้างออบเจ็กต์ข้อมูล</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
  <li>สร้าง Inspection (`create`)</li>
  <li>ตรวจสอบความถูกต้องของข้อมูล (`validate`)</li>
  <li>แปลงข้อมูลเป็น JSON (`toJSON`)</li>
</ul>
    </td>
    <td valign="top"><b>ผู้ทำงานร่วมกัน</b>
      <ul>
  <li>AdviceAndDefectModel</li>
  <li>AuditorInspectionModel</li>
  <li>AuditorModel</li>
  <li>CertificateModel</li>
  <li>DataRecordModel</li>
  <li>InspectionItemModel</li>
  <li>InspectionTypeMasterModel</li>
  <li>RubberFarmModel</li>
</ul>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>แอตทริบิวต์:</b><br/>
      <table border="0" cellspacing="0" cellpadding="4">
  <tr>
    <td valign="top"><ul>
  <li>inspectionId (number)</li>
  <li>inspectionNo (number)</li>
  <li>inspectionDateAndTime (Date)</li>
  <li>inspectionTypeId (number)</li>
</ul></td>
    <td valign="top"><ul>
  <li>inspectionStatus (string)</li>
  <li>inspectionResult (string)</li>
  <li>auditorChiefId (number)</li>
  <li>rubberFarmId (number)</li>
</ul></td>
  </tr>
</table>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Generalization (a-kind-of): สืบทอด BaseModel</li>
  <li>Composition (Has-a): มีองค์ประกอบเป็น AuditorInspectionModel (auditorInspections)</li>
  <li>Composition (Has-a): มีองค์ประกอบเป็น InspectionItemModel (inspectionItems)</li>
  <li>Composition (Has-a): มีองค์ประกอบเป็น DataRecordModel (dataRecord)</li>
  <li>Composition (Has-a): มีองค์ประกอบเป็น AdviceAndDefectModel (adviceAndDefect)</li>
  <li>Composition (Has-a): มีองค์ประกอบเป็น RubberFarmModel (rubberFarm)</li>
  <li>Composition (Has-a): มีองค์ประกอบเป็น AuditorModel (auditorChief)</li>
  <li>Composition (Has-a): มีองค์ประกอบเป็น InspectionTypeMasterModel (inspectionType)</li>
  <li>Composition (Part-of): เป็นองค์ประกอบของ AuditorInspectionModel (inspection)</li>
  <li>Composition (Part-of): เป็นองค์ประกอบของ RubberFarmModel (inspections)</li>
  <li>Composition (Part-of): เป็นองค์ประกอบของ CertificateModel (inspection)</li>
</ul>
    </td>
  </tr>
</table>

