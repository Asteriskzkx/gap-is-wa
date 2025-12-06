# Farmer Applications Edit - Sequence Diagram (High-Level)

```mermaid
sequenceDiagram
    actor Farmer as aFarmer:Farmer
    participant Page as RubberFarmEditForm
    participant Controller as RF:RubberFarmController
    participant Service as RF:RubberFarmService
    participant Repository as RF:RubberFarmRepository
    participant Database as Database

    Note over Farmer,Database: Step 1: Load Farmer's Farms List
    Farmer->>Page: getAlreadyIssuedOrFarmer(req)
    Page->>Controller: getRubberFarmsByFarmerId(req)
    Controller->>Service: getRubberFarmsByFarmerIdWithPagination(options)
    Service->>Repository: findByFarmerId(farmerId)
    Repository-->>Database: query:SELECT * FROM rubberFarm WHERE farmerId = {...}
    Database-->>Repository: QueryResult
    Repository-->>Service: data: List<RubberFarm>
    Service-->>Controller: data: List<RubberFarm>, total: int
    Controller-->>Page: results: List<RubberFarm>, pagination: {...}
    Page-->>Farmer: Display farm selection list

    Note over Farmer,Database: Step 2: Select Farm & Load Details
    Farmer->>Page: selectFarm(farmId)
    Page->>Controller: getRubberFarmWithDetails(req)
    Controller->>Service: getRubberFarmWithDetails(farmId)
    Service->>Repository: findById(farmId)
    Repository-->>Database: query:SELECT * FROM rubberFarm WHERE rubberFarmId = {...}
    Database-->>Repository: QueryResult
    Repository-->>Service: RubberFarm
    Service-->>Controller: RubberFarm with PlantingDetails
    Controller-->>Page: RubberFarm data
    Page-->>Farmer: Display farm data for editing

    Note over Farmer,Database: Step 3: Update Farm Data
    Farmer->>Page: updateFarmData(req)
    Page->>Controller: updateRubberFarm(req, params)
    Controller->>Service: updateRubberFarm(farmId, farmData, version)
    Service->>Repository: updateWithLock(farmId, data, currentVersion)
    Repository-->>Database: query:UPDATE rubberFarm SET {...} WHERE rubberFarmId = {...} AND version = {...}
    Database-->>Repository: QueryResult
    Repository-->>Service: Updated RubberFarm
    Service-->>Controller: Updated RubberFarm
    Controller-->>Page: Success response
    Page-->>Farmer: Display success message

    Note over Farmer,Database: Step 4: Update Planting Details
    Farmer->>Page: updatePlantingDetail(req)
    Page->>Controller: PD:PlantingDetailController
    Controller->>Service: PD:PlantingDetailService
    Service->>Repository: PD:PlantingDetailRepository
    Repository-->>Database: query:UPDATE plantingDetail SET {...} WHERE plantingDetailId = {...}
    Database-->>Repository: QueryResult
    Repository-->>Service: Updated PlantingDetail
    Service-->>Controller: Updated PlantingDetail
    Controller-->>Page: Success response
    Page-->>Farmer: Display success confirmation
```

## High-Level Overview

### Main Flow

1. **Load Farmer's Farms** - เกษตรกรเข้าสู่หน้าแก้ไข ระบบจะโหลดรายการสวนยางทั้งหมดของเกษตรกร
2. **Select Farm** - เกษตรกรเลือกสวนยางที่ต้องการแก้ไข ระบบโหลดข้อมูลสวนยางพร้อมรายละเอียดการปลูก
3. **Update Farm Data** - เกษตรกรแก้ไขข้อมูลสวนยาง (ที่อยู่, พิกัด, ฯลฯ) ระบบอัปเดตข้อมูลพร้อม optimistic locking
4. **Update Planting Details** - เกษตรกรแก้ไขรายละเอียดการปลูก (พันธุ์ยาง, พื้นที่, จำนวนต้น, ฯลฯ) ระบบอัปเดตข้อมูล

### Key Components

- **RubberFarmEditForm** - UI component สำหรับแก้ไขข้อมูลสวนยาง
- **RubberFarmController** - จัดการ request/response สำหรับข้อมูลสวนยาง
- **RubberFarmService** - Business logic ของการจัดการสวนยาง
- **RubberFarmRepository** - Data access layer สำหรับสวนยาง
- **PlantingDetail Components** - จัดการข้อมูลรายละเอียดการปลูกแยกต่างหาก

### Features

- Pagination และ Sorting สำหรับรายการสวนยาง
- Optimistic Locking เพื่อป้องกันการ update พร้อมกัน
- แยก update ระหว่าง RubberFarm และ PlantingDetail
- แสดงข้อมูลที่อยู่แบบ 3 level (จังหวัด, อำเภอ, ตำบล)
