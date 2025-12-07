# Auditor Garden Data - Sequence Diagram (High-Level)

```mermaid
sequenceDiagram
    actor Auditor as aAuditor:Auditor
    participant Page as AuditorGardenDataPage
    participant Controller as DR:DataRecordController
    participant Service as DR:DataRecordService
    participant Repository as DR:DataRecordRepository
    participant Database as Database

    Note over Auditor,Database: Step 1: Load Inspections List
    Auditor->>Page: Open garden-data page
    Page->>Controller: GET /api/v1/inspections?auditorId={...}
    Controller->>Service: getInspectionsByAuditorId(auditorId, options)
    Service->>Repository: findByAuditorIdWithPagination(auditorId, filters)
    Repository-->>Database: query:SELECT * FROM inspection WHERE auditorId = {...}
    Database-->>Repository: QueryResult (Inspections with RubberFarm)
    Repository-->>Service: data: List<Inspection>, total: int
    Service-->>Controller: data: List<Inspection>, total: int
    Controller-->>Page: results: List<Inspection>, pagination: {...}
    Page-->>Auditor: Display inspections table with filters

    Auditor->>Page: Apply filters (province/district/subDistrict)
    Page->>Controller: GET /api/v1/inspections with filters
    Controller->>Service: getInspectionsByAuditorId(auditorId, options)
    Service->>Repository: findByAuditorIdWithPagination(auditorId, filters)
    Repository-->>Database: query with WHERE clause
    Database-->>Repository: Filtered results
    Repository-->>Service: Filtered data
    Service-->>Controller: Filtered data
    Controller-->>Page: Updated results
    Page-->>Auditor: Display filtered inspections

    Note over Auditor,Database: Step 2: Select Inspection & Check DataRecord
    Auditor->>Page: Select inspection from table
    Page->>Page: setSelectedInspection(inspection)

    alt DataRecord exists
        Page->>Page: Load existing DataRecord into form
        Page-->>Auditor: Display form with existing data (Step 1: Map)
    else No DataRecord
        Page->>Page: Initialize empty form
        Page-->>Auditor: Display empty form (Step 1: Map)
    end

    Note over Auditor,Database: Step 3: Fill Garden Data (2 steps)
    Auditor->>Page: Set map location (Step 1)
    Auditor->>Page: Click "ถัดไป" to Step 2
    Page-->>Auditor: Display Step 2 form (7 sections)

    Auditor->>Page: Fill planting details
    Auditor->>Page: Fill water system info
    Auditor->>Page: Fill fertilizers (chemical/organic/other)
    Auditor->>Page: Fill previously cultivated info
    Auditor->>Page: Fill plant diseases
    Auditor->>Page: Fill related plants
    Auditor->>Page: Fill additional info

    Note over Auditor,Database: Step 4: Save DataRecord
    Auditor->>Page: Click "บันทึกข้อมูล"
    Page->>Page: buildPayload()

    alt Create new DataRecord
        Page->>Controller: POST /api/v1/data-records
        Controller->>Service: createDataRecord(dataRecordData)
        Service->>Service: Check if DataRecord exists
        Service->>Repository: create(dataRecordModel)
        Repository-->>Database: INSERT INTO dataRecord (inspectionId, species, ...)
        Database-->>Repository: dataRecordId
        Repository-->>Service: Created DataRecord
        Service-->>Controller: Created DataRecord
        Controller-->>Page: 201 Created
        Page-->>Auditor: Display success message
    else Update existing DataRecord
        Page->>Controller: PUT /api/v1/data-records/{id}
        Controller->>Service: updateDataRecord(dataRecordId, data, version)
        Service->>Repository: updateWithLock(dataRecordId, data, currentVersion)
        Repository-->>Database: UPDATE dataRecord SET {...} WHERE dataRecordId = {...} AND version = {...}
        Database-->>Repository: Updated DataRecord
        Repository-->>Service: Updated DataRecord
        Service-->>Controller: Updated DataRecord
        Controller-->>Page: 200 OK
        Page-->>Auditor: Display success message
    end

    Page->>Page: Update local state with saved DataRecord
```

## High-Level Overview

### Main Flow

1. **Load Inspections List** - ผู้ตรวจเข้าสู่หน้าบันทึกข้อมูลสวน ระบบโหลดรายการการตรวจของผู้ตรวจ
2. **Select Inspection & Check DataRecord** - เลือกการตรวจ ระบบตรวจสอบว่ามีข้อมูลสวนบันทึกไว้แล้วหรือไม่
3. **Fill Garden Data** - กรอกข้อมูลสวนยาง 2 steps (Map + 7 sections)
4. **Save DataRecord** - บันทึกข้อมูล (สร้างใหม่หรืออัปเดตพร้อม optimistic locking)

### Key Components

- **AuditorGardenDataPage** - UI component สำหรับบันทึกข้อมูลสวนยาง (2-step form)
- **DataRecordController** - จัดการ request/response สำหรับข้อมูล DataRecord
- **DataRecordService** - Business logic สำหรับการจัดการข้อมูลสวน
- **DataRecordRepository** - Data access layer สำหรับบันทึกข้อมูลสวน
- **InspectionController** - ดึงรายการการตรวจของผู้ตรวจ

### Features

- Tab switching ระหว่าง "รอบันทึกข้อมูล" (in-progress) และ "บันทึกเรียบร้อย" (completed)
- Pagination และ Multi-sort สำหรับรายการการตรวจ
- Filter ตามจังหวัด/อำเภอ/ตำบล (3-level cascading)
- Multi-step form (2 steps) พร้อม progress indicator
- Interactive map สำหรับระบุตำแหน่งสวนยาง
- Dynamic form arrays สำหรับข้อมูลที่มีหลายรายการ
- Optimistic Locking สำหรับ update
- Auto-load existing DataRecord into form
- JSON storage สำหรับข้อมูลที่ซับซ้อน

### Form Steps

#### Step 1: Map Location

- แผนที่แสดงตำแหน่งสวนยาง
- แสดงพิกัด (latitude, longitude)

#### Step 2: Garden Data (7 sections)

1. **Planting Details** (species)

   - พันธุ์ยาง (specie) - dropdown
   - ระยะปลูก (spacing)
   - จำนวนต้น (numberOfTrees)
   - วันที่ปลูก (plantingDate)
   - สามารถเพิ่มหลายรายการได้

2. **Water System** (waterSystem)

   - มีระบบน้ำหรือไม่ (has: boolean)
   - รายละเอียด (details: string)

3. **Fertilizers** (fertilizers)

   - ปุ๋ยเคมี (chemical): สูตร, อัตรา, ความถี่/ปี
   - ปุ๋ยอินทรีย์/น้ำหมัก (organic): สูตร, อัตรา, ความถี่/ปี
   - อื่นๆ (other): สูตร, อัตรา, ความถี่/ปี
   - แต่ละประเภทสามารถเพิ่มหลายรายการได้

4. **Previously Cultivated** (previouslyCultivated)

   - ไม่เคยใช้ (neverUsed: boolean)
   - เคยใช้ (used: boolean)
   - พืชที่ปลูกก่อนหน้า ปีที่ 1 (year1)
   - พืชที่ปลูกก่อนหน้า ปีที่ 2 (year2)

5. **Plant Disease** (plantDisease)

   - ชื่อโรค (name)
   - ช่วงระบาด (outbreakPeriod)
   - การป้องกันและควบคุม (preventionAndControl)
   - สามารถเพิ่มหลายรายการได้

6. **Related Plants** (relatedPlants)

   - มีหรือไม่มี (toggle)
   - ชื่อพืชที่ปลูกร่วม (name)
   - สามารถเพิ่มหลายรายการได้

7. **More Info** (moreInfo)
   - ข้อมูลเพิ่มเติม (textarea)

### Data Structure

- **DataRecord** - บันทึกข้อมูลสวนยาง
  - inspectionId (unique) - 1:1 relationship กับ Inspection
  - species (JSON) - ข้อมูลการปลูก
  - waterSystem (JSON) - ระบบน้ำ
  - fertilizers (JSON) - ปุ๋ย 3 ประเภท
  - previouslyCultivated (JSON) - พืชที่เคยปลูก
  - plantDisease (JSON Array) - โรคพืช
  - relatedPlants (JSON Array) - พืชที่ปลูกร่วม
  - moreInfo (string) - ข้อมูลเพิ่มเติม
  - map (JSON) - ตำแหน่งแผนที่
  - version (int) - สำหรับ optimistic locking

### Validation Rules

- inspectionId required
- ต้องเลือกการตรวจก่อนบันทึก
- DataRecord มีได้ 1 รายการต่อ 1 inspection
- version จำเป็นสำหรับ update เพื่อป้องกันการ update พร้อมกัน

### Success Flow

- Create: แสดง success toast "สร้างข้อมูลเรียบร้อย"
- Update: แสดง success toast "บันทึกข้อมูลเรียบร้อย"
- อัปเดต local state ด้วย dataRecordId และ version ใหม่
- Refresh inspections list เพื่อแสดงสถานะที่อัปเดต

### Error Handling

- DataRecord already exists → 409 Conflict
- Optimistic lock conflict → 409 Conflict with version mismatch
- Validation errors → 400 Bad Request
- No inspection selected → Show error toast

### Integration Points

- **Inspection API** - GET /api/v1/inspections?auditorId={...}
- **DataRecord API** - POST /api/v1/data-records, PUT /api/v1/data-records/{id}
- **Thai Province Data** - ใช้ thai-provinces.json สำหรับ filter
- **NextAuth Session** - ระบุ auditorId จาก session.user.roleData
