# Auditor Inspections - Post-Tapping Fresh Latex (ตรวจประเมินสวนยางพาราหลังเปิดกรีดและการผลิตน้ำยางสด) - Sequence Diagram (High-Level)

```mermaid
sequenceDiagram
    actor Auditor as aAuditor:Auditor
    participant Page as AuditorInspectionsPage
    participant FormModal as InspectionFormModal
    participant Controller as IC:InspectionController
    participant Service as IS:InspectionService
    participant Repository as IR:InspectionRepository
    participant Database as Database

    Note over Auditor,Database: Step 1: Load Assigned Inspections
    Auditor->>Page: Open inspections page
    Page->>Controller: GET /api/v1/inspections?auditorId={id}
    Controller->>Service: getInspectionsByAuditorIdWithPagination(options)
    Service->>Repository: findByAuditorIdWithPagination(auditorId, filters)
    Repository-->>Database: query:SELECT * FROM inspection WHERE auditorChiefId = {...}
    Database-->>Repository: QueryResult (Inspections with RubberFarm & Farmer)
    Repository-->>Service: data: List<Inspection>, total: int
    Service-->>Controller: data: List<Inspection>, total: int
    Controller-->>Page: results: List<Inspection>, pagination: {...}
    Page-->>Auditor: Display inspections table

    Auditor->>Page: Apply filters (province/district/status)
    Page->>Controller: GET /api/v1/inspections with filters
    Controller->>Service: getInspectionsByAuditorIdWithPagination(options)
    Service->>Repository: findByAuditorIdWithPagination(filters)
    Repository-->>Database: query with WHERE filters
    Database-->>Repository: Filtered results
    Repository-->>Service: Filtered data
    Service-->>Controller: Filtered data
    Controller-->>Page: Updated results
    Page-->>Auditor: Display filtered inspections

    Note over Auditor,Database: Step 2: Select Inspection & Load Items
    Auditor->>Page: Select inspection (type: น้ำยางสด, status: รอการตรวจประเมิน)
    Page->>Controller: GET /api/v1/inspection-items?inspectionId={id}
    Controller->>Service: getInspectionItemsByInspectionId(inspectionId)
    Service->>Repository: findByInspectionId(inspectionId)
    Repository-->>Database: query:SELECT * FROM inspectionItem WHERE inspectionId = {...}
    Database-->>Repository: InspectionItems with Requirements
    Repository-->>Service: List<InspectionItem>
    Service-->>Controller: List<InspectionItem>
    Controller-->>Page: InspectionItems data (8 items for fresh latex type)
    Page->>FormModal: Open modal with inspection items
    FormModal-->>Auditor: Display first inspection item form

    Note over Auditor,Database: Step 3: Evaluate Requirements (Item by Item)
    loop For each Inspection Item (1-8)
        Auditor->>FormModal: Fill requirement evaluations
        Auditor->>FormModal: Set evaluationResult (ใช่/ไม่ใช่/ไม่เกี่ยวข้อง)
        Auditor->>FormModal: Set evaluationMethod (พินิจ/สัมภาษณ์)
        Auditor->>FormModal: Add note (optional)

        alt Item has additional fields (e.g., Item 1: water source)
            Auditor->>FormModal: Fill otherConditions fields
        end

        Auditor->>FormModal: Click "บันทึกและถัดไป"
        FormModal->>Controller: PUT /api/v1/requirements/evaluation
        Controller->>Service: updateRequirementsEvaluations(requirementsData)

        loop For each requirement in item
            Service->>Repository: REQ:RequirementRepository.updateWithLock()
            Repository-->>Database: UPDATE requirement SET evaluationResult, evaluationMethod, note WHERE {...}
            Database-->>Repository: Updated Requirement
        end

        FormModal->>Controller: PUT /api/v1/inspection-items/evaluation
        Controller->>Service: updateInspectionItemResultsBulk(itemsData)
        Service->>Repository: ITEM:InspectionItemRepository.updateWithLock()
        Repository-->>Database: UPDATE inspectionItem SET inspectionItemResult, otherConditions WHERE {...}
        Database-->>Repository: Updated InspectionItem

        Repository-->>Service: Success
        Service-->>Controller: Success
        Controller-->>FormModal: 200 OK
        FormModal->>FormModal: Move to next item (currentItemIndex++)
        FormModal-->>Auditor: Display next inspection item
    end

    Note over Auditor,Database: Step 4: Complete Inspection
    Auditor->>FormModal: Click "บันทึกและสรุปผลการตรวจ"
    FormModal->>Controller: PUT /api/v1/inspections/{id}/status
    Controller->>Service: updateInspectionStatus(inspectionId, status, version)
    Service->>Repository: updateWithLock(inspectionId, data, version)
    Repository-->>Database: UPDATE inspection SET inspectionStatus = 'ตรวจประเมินแล้ว', inspectionResult = {...} WHERE {...}
    Database-->>Repository: Updated Inspection
    Repository-->>Service: Updated Inspection
    Service-->>Controller: Updated Inspection
    Controller-->>FormModal: 200 OK
    FormModal-->>Auditor: Display success message
    FormModal->>Page: Close modal and refresh list
    Page->>Controller: Reload inspections
    Page-->>Auditor: Updated inspections table
```

## High-Level Overview

### Main Flow

1. **Load Assigned Inspections** - ผู้ตรวจโหลดรายการการตรวจที่ได้รับมอบหมาย กรองได้ตามพื้นที่และสถานะ
2. **Select Inspection & Load Items** - เลือกการตรวจประเภท "น้ำยางสด" ที่มีสถานะ "รอการตรวจประเมิน" และโหลดรายการตรวจ
3. **Evaluate Requirements (Item by Item)** - ประเมินข้อกำหนดในแต่ละรายการตรวจทีละรายการ บันทึกผลการประเมิน
4. **Complete Inspection** - เมื่อประเมินครบทุกรายการแล้ว สรุปผลและเปลี่ยนสถานะเป็น "ตรวจประเมินแล้ว"

### Key Components

- **AuditorInspectionsPage** - UI component สำหรับแสดงรายการการตรวจของผู้ตรวจ
- **InspectionFormModal** - Modal component สำหรับฟอร์มประเมินแต่ละรายการตรวจ
- **InspectionController** - จัดการ request/response สำหรับการตรวจ
- **InspectionService** - Business logic สำหรับการจัดการการตรวจ
- **InspectionItemController** - จัดการรายการตรวจ (inspection items)
- **RequirementController** - จัดการข้อกำหนด (requirements)
- **useInspectionForm Hook** - Custom hook สำหรับจัดการ state ของฟอร์มการตรวจ

### Features

- Pagination และ Multi-sort สำหรับรายการการตรวจ
- Filter ตามจังหวัด/อำเภอ/ตำบล และสถานะการตรวจ
- แสดงข้อมูลการตรวจ: เลขที่, วันที่นัดตรวจ, ประเภทการตรวจ, สถานที่, เกษตรกร, สถานะ
- ดูรายละเอียดสวนยางในโมดอล (map + planting details)
- Multi-step form สำหรับประเมินรายการตรวจทีละรายการ
- Progress indicator แสดงรายการที่กำลังประเมิน
- Auto-save position (localStorage) เพื่อกลับมาทำต่อได้
- Optimistic locking สำหรับ concurrent updates
- Validation ก่อนบันทึก (ต้องประเมินทุก requirement ในรายการ)

### Inspection Item Result Logic

ผลการตรวจของแต่ละรายการตรวจ (inspectionItemResult) คำนวณจาก:

- **ผ่าน** - ทุก requirement เป็น "ใช่" หรือ "ไม่เกี่ยวข้อง"
- **ไม่ผ่าน** - มี requirement ใดๆ เป็น "ไม่ใช่"
- **Automatic calculation** - ระบบคำนวณอัตโนมัติจาก requirements

### Overall Inspection Result Logic

ผลการตรวจโดยรวม (inspectionResult) คำนวณจาก:

- **ผ่าน** - ทุก inspection item เป็น "ผ่าน"
- **ไม่ผ่าน** - มี inspection item ใดๆ เป็น "ไม่ผ่าน"
- **Automatic calculation** - ระบบคำนวณอัตโนมัติเมื่อสรุปผลการตรวจ

### Validation Rules

- ต้องประเมิน requirement ทุกตัวในแต่ละรายการก่อนไปรายการถัดไป
- evaluationResult และ evaluationMethod เป็น required fields
- note เป็น optional field
- otherConditions fields ไม่บังคับแต่แนะนำให้กรอก

### Database Transaction

- Update all requirements in inspection item (bulk update)
- Update inspection item result and otherConditions
- Both operations with optimistic locking (version control)
- Final step: Update inspection status and result

### Success Flow

- แสดง success message หลังบันทึกแต่ละรายการ
- Progress indicator อัพเดท
- เมื่อครบทุกรายการ แสดงปุ่ม "บันทึกและสรุปผลการตรวจ"
- สรุปผลการตรวจ → อัพเดทสถานะเป็น "ตรวจประเมินแล้ว"
- ปิด modal และ refresh รายการการตรวจ

### Integration Points

- **NextAuth Session** - ระบุ auditorId สำหรับ filter inspections
- **Thai Province Data** - ใช้ thai-provinces.json สำหรับ filter
- **Inspection API** - GET /api/v1/inspections?auditorId={id}
- **InspectionItem API** - GET /api/v1/inspection-items?inspectionId={id}
- **Requirement API** - PUT /api/v1/requirements/evaluation (bulk update)
- **InspectionItem API** - PUT /api/v1/inspection-items/evaluation (bulk update)
- **Inspection Status API** - PUT /api/v1/inspections/{id}/status
- **RubberFarm API** - GET /api/v1/rubber-farms/{id} (for farm details modal)

### State Management

- `inspectionItems` - Array of inspection items with requirements
- `currentItemIndex` - Current item being evaluated
- `saving` - Loading state during save operation
- `localStorage` - Save progress position for resuming later

### Auto-save Position

- Save current position to localStorage: `inspection_{inspectionId}_position`
- Resume from saved position when reopening inspection
- Clear saved position after completing inspection
