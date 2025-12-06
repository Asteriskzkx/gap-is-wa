# Auditor Applications - Sequence Diagram (High-Level)

```mermaid
sequenceDiagram
    actor Auditor as aAuditor:Auditor
    participant Page as AuditorScheduleInspectionPage
    participant Controller as IC:InspectionController
    participant Service as IS:InspectionService
    participant Repository as IR:InspectionRepository
    participant Database as Database

    Note over Auditor,Database: Step 1: Select Rubber Farm
    Auditor->>Page: Open schedule inspection page
    Page->>Controller: GET /api/v1/rubber-farms
    Controller->>Service: getRubberFarmsWithPagination(options)
    Service->>Repository: findAll(filters)
    Repository-->>Database: query:SELECT * FROM rubberFarm WHERE {...}
    Database-->>Repository: QueryResult (RubberFarms)
    Repository-->>Service: data: List<RubberFarm>, total: int
    Service-->>Controller: data: List<RubberFarm>, total: int
    Controller-->>Page: results: List<RubberFarm>, pagination: {...}
    Page-->>Auditor: Display farms table with filters

    Auditor->>Page: Apply province/district/subDistrict filters
    Page->>Controller: GET /api/v1/rubber-farms with filters
    Controller->>Service: getRubberFarmsWithPagination(options)
    Service->>Repository: findAll(filters)
    Repository-->>Database: query with WHERE clause
    Database-->>Repository: Filtered results
    Repository-->>Service: Filtered data
    Service-->>Controller: Filtered data
    Controller-->>Page: Updated results
    Page-->>Auditor: Display filtered farms

    Auditor->>Page: Select farm and click "ถัดไป"
    Page->>Page: setSelectedFarm(), setCurrentStep(2)

    Note over Auditor,Database: Step 2: Select Inspection Type
    Page->>Controller: GET /api/v1/inspection-types
    Controller->>Service: getAllInspectionTypes()
    Service->>Repository: findAll()
    Repository-->>Database: query:SELECT * FROM inspectionType
    Database-->>Repository: InspectionTypes
    Repository-->>Service: List<InspectionType>
    Service-->>Controller: List<InspectionType>
    Controller-->>Page: InspectionTypes data
    Page-->>Auditor: Display inspection types

    Auditor->>Page: Select inspection type and click "ถัดไป"
    Page->>Page: setSelectedInspectionType(), setCurrentStep(3)

    Note over Auditor,Database: Step 3: Select Additional Auditors & Date
    Page->>Controller: GET /api/v1/auditors
    Controller->>Service: getAuditorsWithPagination(options)
    Service->>Repository: findAll(filters)
    Repository-->>Database: query:SELECT * FROM auditor
    Database-->>Repository: Auditors
    Repository-->>Service: data: List<Auditor>, total: int
    Service-->>Controller: data: List<Auditor>, total: int
    Controller-->>Page: Auditors data
    Page-->>Auditor: Display auditors table with search

    Auditor->>Page: Select auditors, set date, click "ยืนยันการกำหนดตรวจ"
    Page->>Controller: POST /api/v1/inspections/schedule
    Controller->>Service: scheduleInspection(inspectionData)
    Service->>Repository: create(inspectionModel)
    Repository-->>Database: BEGIN TRANSACTION
    Repository-->>Database: INSERT INTO inspection (rubberFarmId, inspectionTypeId, ...)
    Database-->>Repository: inspectionId

    loop For each additional auditor
        Repository-->>Database: INSERT INTO auditorInspection (auditorId, inspectionId)
        Database-->>Repository: Success
    end

    Repository-->>Database: COMMIT TRANSACTION
    Repository-->>Service: Created Inspection
    Service-->>Controller: Created Inspection
    Controller-->>Page: 201 Created
    Page-->>Auditor: Display success message
    Page->>Page: Redirect to /auditor/dashboard
```

## High-Level Overview

### Main Flow

1. **Select Rubber Farm** - ผู้ตรวจประเมินเลือกสวนยางที่ต้องการนัดตรวจ พร้อมกรองตามพื้นที่
2. **Select Inspection Type** - เลือกประเภทการตรวจประเมิน (ตรวจประเมินเบื้องต้น, ตรวจประเมินหลัก, ฯลฯ)
3. **Select Additional Auditors & Date** - เลือกผู้ตรวจเพิ่มเติม กำหนดวันที่-เวลา และยืนยันการนัดตรวจ

### Key Components

- **AuditorScheduleInspectionPage** - UI component สำหรับกำหนดการตรวจประเมิน (3-step wizard)
- **InspectionController** - จัดการ request/response สำหรับการสร้างการตรวจ
- **InspectionService** - Business logic สำหรับจัดการการตรวจประเมิน
- **InspectionRepository** - Data access layer สำหรับบันทึกข้อมูลการตรวจ
- **RubberFarmController** - จัดการข้อมูลสวนยางสำหรับเลือกนัด
- **AuditorController** - จัดการข้อมูลผู้ตรวจเพิ่มเติม

### Features

- Multi-step wizard (3 steps) พร้อม progress indicator
- Pagination และ Multi-sort สำหรับรายการสวนยาง
- Filter สวนยางตามจังหวัด/อำเภอ/ตำบล (3-level cascading)
- แสดงรายละเอียดสวนยางในโมดอล (location map, planting details)
- เลือกประเภทการตรวจจาก master data
- Search และ pagination สำหรับเลือกผู้ตรวจเพิ่มเติม
- Calendar picker สำหรับกำหนดวันที่-เวลาตรวจ
- Transaction-based creation (Inspection + AuditorInspection)
- Session-based main auditor (จาก NextAuth session)

### Step Details

#### Step 1: Select Rubber Farm

- แสดงตาราง RubberFarms พร้อมข้อมูล: รหัส, สถานที่, จังหวัด, อำเภอ, ตำบล, ชื่อเกษตรกร
- Filter: Province → Amphure → Tambon (cascading dropdowns)
- Pagination: 10 rows per page
- Multi-sort support
- View farm details button (show modal with map + planting details)
- Select farm → Next

#### Step 2: Select Inspection Type

- แสดงตาราง InspectionTypes
- แต่ละประเภทมี: inspectionTypeId, typeName, description
- Select type → Next

#### Step 3: Select Additional Auditors & Date

- แสดงตาราง Auditors พร้อม checkbox
- Search by name/email
- Pagination: 10 rows per page
- Multi-sort support
- Calendar picker สำหรับวันที่-เวลาตรวจ
- Select auditors + date → Submit

### Validation Rules

- Step 1: Must select 1 rubber farm
- Step 2: Must select 1 inspection type
- Step 3: Date-time must be in the future

### Database Transaction

- Create Inspection record (main auditor from session)
- Create AuditorInspection records for additional auditors
- Both operations in single transaction
- Rollback if any operation fails

### Success Flow

- Display success message: "กำหนดการตรวจประเมินถูกบันทึกเรียบร้อยแล้ว"
- Redirect to auditor dashboard after 2 seconds

### Integration Points

- **NextAuth Session** - ระบุผู้ตรวจหลัก (main auditor) จาก session.user.id
- **Thai Province Data** - ใช้ thai-provinces.json สำหรับ filter
- **RubberFarm API** - GET /api/v1/rubber-farms
- **InspectionType API** - GET /api/v1/inspection-types
- **Auditor API** - GET /api/v1/auditors
- **Schedule API** - POST /api/v1/inspections/schedule
