# BaseModel

<table border="1" cellspacing="0" cellpadding="6">
  <tr>
    <td><b>ชื่อคลาส:</b> BaseModel</td>
    <td><b>รหัส:</b> 12</td>
    <td><b>ประเภท:</b> Abstract</td>
  </tr>
  <tr>
    <td colspan="2"><b>คำอธิบาย:</b> คลาสฐานแบบนามธรรมสำหรับโมเดล (Model) ที่เก็บฟิลด์พื้นฐาน และกำหนดสัญญา (contract) ของ validate/toJSON</td>
    <td><b>ยูสเคสที่เกี่ยวข้อง:</b> </td>
  </tr>
  <tr>
    <td colspan="2" valign="top"><b>หน้าที่ความรับผิดชอบ</b>
      <ul>
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
  <li>id (number)</li>
  <li>createdAt (Date)</li>
</ul></td>
    <td valign="top"><ul>
  <li>updatedAt (Date)</li>
</ul></td>
  </tr>
</table>
    </td>
  </tr>
  <tr>
    <td colspan="3" valign="top"><b>ความสัมพันธ์:</b>
      <ul>
  <li>Generalization (a-kind-of): ถูกสืบทอดโดย AdviceAndDefectModel, AuditLogModel, AuditorInspectionModel, CertificateModel, DataRecordModel, FileModel, InspectionItemModel, InspectionModel, InspectionTypeMasterModel, PlantingDetailModel, RequirementModel, RubberFarmModel, UserModel</li>
  <li>Dependency: ถูกพึ่งพาโดย BaseRepository~T~ ("T extends")</li>
  <li>Dependency: ถูกพึ่งพาโดย BaseService~T~ ("T extends")</li>
  <li>Dependency: ถูกพึ่งพาโดย BaseController~T~ ("T extends")</li>
</ul>
    </td>
  </tr>
</table>

