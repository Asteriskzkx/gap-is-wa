# Farmer Applications New - Sequence Diagram (High-Level)

```mermaid
sequenceDiagram
    actor Farmer as aFarmer:Farmer
    participant Page as RubberFarmRegistrationForm
    participant Controller as RF:RubberFarmController
    participant Service as RF:RubberFarmService
    participant Repository as RF:RubberFarmRepository
    participant Database as Database

    Note over Farmer,Database: Step 1: Initialize Registration Form
    Farmer->>Page: Open registration page
    Page-->>Farmer: Display empty form (Step 1: Farm Info)

    Note over Farmer,Database: Step 2: Fill Farm Information
    Farmer->>Page: Fill farm details (villageName, moo, address, location)
    Page->>Page: validateFarmData()
    Page-->>Farmer: Navigate to Step 2 (Planting Details)

    Note over Farmer,Database: Step 3: Fill Planting Details
    Farmer->>Page: Fill planting details (specie, area, numberOfRubber, etc.)
    Farmer->>Page: addPlantingDetail() [optional]
    Page->>Page: validatePlantingDetails()
    Page-->>Farmer: Navigate to Step 3 (Confirmation)

    Note over Farmer,Database: Step 4: Confirm & Submit
    Farmer->>Page: Review data and confirm
    Farmer->>Page: handleSubmit(req)
    Page->>Controller: createRubberFarmWithDetails(req)
    Controller->>Service: createRubberFarmWithDetails(farmData, plantingDetailsData)
    Service->>Repository: create(rubberFarmModel)
    Repository-->>Database: query:INSERT INTO rubberFarm VALUES (...)
    Database-->>Repository: rubberFarmId

    loop For each planting detail
        Service->>Repository: PD:PlantingDetailRepository.create(plantingDetailModel)
        Repository-->>Database: query:INSERT INTO plantingDetail VALUES (...)
        Database-->>Repository: plantingDetailId
    end

    Repository-->>Service: Created RubberFarm
    Service-->>Controller: RubberFarm with PlantingDetails
    Controller-->>Page: Success response
    Page-->>Farmer: Display success message
    Page->>Page: Redirect to dashboard
```

## High-Level Overview

### Main Flow

1. **Initialize Registration Form** - เกษตรกรเข้าสู่หน้าลงทะเบียนสวนยางใหม่
2. **Fill Farm Information** - กรอกข้อมูลพื้นฐานของสวนยาง (ที่อยู่, พิกัด) และตรวจสอบความถูกต้อง
3. **Fill Planting Details** - กรอกรายละเอียดการปลูก (พันธุ์ยาง, พื้นที่, จำนวนต้น) สามารถเพิ่มหลายรายการได้
4. **Confirm & Submit** - ตรวจสอบข้อมูลและยืนยันการส่ง ระบบจะสร้างสวนยางพร้อมรายละเอียดการปลูกทั้งหมด

### Key Components

- **RubberFarmRegistrationForm** - UI component สำหรับลงทะเบียนสวนยางใหม่
- **RubberFarmController** - จัดการ request/response สำหรับการสร้างสวนยาง
- **RubberFarmService** - Business logic สำหรับการสร้างสวนยางพร้อมรายละเอียด
- **RubberFarmRepository** - Data access layer สำหรับบันทึกข้อมูลสวนยาง
- **PlantingDetailRepository** - Data access layer สำหรับบันทึกรายละเอียดการปลูก

### Features

- Multi-step form (3 steps) พร้อม progress indicator
- Validation แบบ step-by-step ก่อนไปขั้นตอนถัดไป
- Interactive map สำหรับระบุตำแหน่งสวนยาง
- รองรับการเพิ่มรายละเอียดการปลูกหลายรายการ
- Address selection แบบ 3 level (จังหวัด, อำเภอ, ตำบล)
- Confirmation step พร้อม checkbox ยืนยันความถูกต้อง
- Transaction-based creation (สร้าง RubberFarm และ PlantingDetails พร้อมกัน)

### Form Steps

1. **Step 1: Farm Information** - ข้อมูลสวนยาง (villageName, moo, address, location on map)
2. **Step 2: Planting Details** - รายละเอียดการปลูก (specie, areaOfPlot, numberOfRubber, numberOfTapping, ageOfRubber, yearOfTapping, monthOfTapping, totalProduction)
3. **Step 3: Confirmation** - ยืนยันข้อมูลทั้งหมดก่อนส่ง

### Validation Rules

- Farm data: villageName, moo, subDistrict, district, province, location (not [0,0])
- Planting details: ต้องมีอย่างน้อย 1 รายการ และทุกฟิลด์ต้องถูกต้อง
- Must confirm checkbox before submit
