# Farmer Certificates - Sequence Diagram (High-Level)

```mermaid
sequenceDiagram
    actor Farmer as aFarmer:Farmer
    participant Page as FarmerCertificatesPage
    participant Controller as CC:CertificateController
    participant Service as CS:CertificateService
    participant Repository as CR:CertificateRepository
    participant Database as Database

    Note over Farmer,Database: Step 1: Load Certificates List
    Farmer->>Page: Open certificates page
    Page->>Controller: getAlreadyIssuedForFarmer(req)
    Controller->>Service: getAlreadyIssued(options)
    Service->>Repository: findAllWithPagination(options)
    Repository-->>Database: query:SELECT * FROM certificate WHERE farmerId = {...} AND activeFlag = true
    Database-->>Repository: QueryResult (Certificates with Inspections)
    Repository-->>Service: data: List<Certificate>, total: int
    Service-->>Controller: data: List<Certificate>, total: int
    Controller-->>Page: results: List<Certificate>, pagination: {...}
    Page-->>Farmer: Display certificates table

    Note over Farmer,Database: Step 2: Apply Filters & Sorting
    Farmer->>Page: Change filters (date range) or sort/pagination
    Page->>Controller: getAlreadyIssuedForFarmer(req) with params
    Controller->>Service: getAlreadyIssued(options)
    Service->>Repository: findAllWithPagination(options)
    Repository-->>Database: query with filters & sorting
    Database-->>Repository: Filtered QueryResult
    Repository-->>Service: Filtered data
    Service-->>Controller: Filtered certificates
    Controller-->>Page: Updated results
    Page-->>Farmer: Display filtered table

    Note over Farmer,Database: Step 3: Switch Tabs
    Farmer->>Page: Switch to "ยกเลิกแล้ว" tab
    Page->>Page: onTabChange("cancelRequestFlag", "true")
    Page->>Controller: getAlreadyIssuedForFarmer(req) with cancelRequestFlag=true
    Controller->>Service: getAlreadyIssued(options)
    Service->>Repository: findAllWithPagination(options)
    Repository-->>Database: query:SELECT * FROM certificate WHERE cancelRequestFlag = true
    Database-->>Repository: QueryResult
    Repository-->>Service: Cancelled certificates
    Service-->>Controller: Cancelled certificates
    Controller-->>Page: Updated results
    Page-->>Farmer: Display cancelled certificates

    Note over Farmer,Database: Step 4: View Certificate File
    Farmer->>Page: Click view certificate (pi-eye)
    Page->>Page: openFiles(certificateId)
    Page->>Database: GET /api/v1/files/get-files?tableReference=Certificate&idReference={id}
    Database-->>Page: File URL
    Page->>Page: Open file in new tab
    Page-->>Farmer: Display certificate PDF/image
```

## High-Level Overview

### Main Flow

1. **Load Certificates List** - เกษตรกรเข้าสู่หน้าใบรับรอง ระบบโหลดรายการใบรับรองที่ได้รับ
2. **Apply Filters & Sorting** - เกษตรกรสามารถกรองตามช่วงวันที่และเรียงลำดับข้อมูล
3. **Switch Tabs** - สลับระหว่าง "ใบรับรองที่ใช้งานอยู่" และ "ยกเลิกแล้ว"
4. **View Certificate File** - เปิดดูไฟล์ใบรับรอง (PDF/image)

### Key Components

- **FarmerCertificatesPage** - UI component สำหรับแสดงใบรับรองของเกษตรกร
- **CertificateController** - จัดการ request/response สำหรับข้อมูลใบรับรอง
- **CertificateService** - Business logic สำหรับการจัดการใบรับรอง
- **CertificateRepository** - Data access layer สำหรับข้อมูลใบรับรอง

### Features

- Pagination และ Multi-sort สำหรับรายการใบรับรอง
- Date range filter (fromDate, toDate)
- Tab switching ระหว่างใบรับรองที่ใช้งานอยู่ (activeFlag=true, cancelRequestFlag=false) และที่ยกเลิกแล้ว (cancelRequestFlag=true)
- แสดงข้อมูล: รหัสใบรับรอง, รหัสการตรวจ, วันที่ตรวจ, สถานที่, วันที่มีผล, วันที่หมดอายุ
- ดูไฟล์ใบรับรองผ่าน File API
- Lazy loading สำหรับประสิทธิภาพ

### Certificate Display Modes

1. **Tab: "ใช้งานอยู่"** (activeFlag=true, cancelRequestFlag=false)
   - แสดงปุ่มดูไฟล์ใบรับรอง (pi-eye icon)
   - ใบรับรองที่มีผลใช้งาน
2. **Tab: "ยกเลิกแล้ว"** (cancelRequestFlag=true)
   - แสดงสถานะการยกเลิก:
     - "ยื่นขอยกเลิกแล้ว" (cancelRequestFlag=true, activeFlag=true)
     - "ยกเลิกใบรับรองแล้ว" (cancelRequestFlag=true, activeFlag=false)

### Data Integration

- **Certificate** - ข้อมูลใบรับรอง (certificateId, effectiveDate, expiryDate, activeFlag, cancelRequestFlag)
- **Inspection** - ข้อมูลการตรวจ (inspectionNo, inspectionDateAndTime)
- **RubberFarm** - ข้อมูลสวนยาง (villageName, district, province)
- **File** - ไฟล์ใบรับรอง (PDF/image)

### Certificate Lifecycle

1. **Issued** - ใบรับรองออกใหม่ (activeFlag=true, cancelRequestFlag=false)
2. **Cancel Requested** - ยื่นขอยกเลิก (activeFlag=true, cancelRequestFlag=true)
3. **Cancelled** - ยกเลิกแล้ว (activeFlag=false, cancelRequestFlag=true)

### Sorting & Filtering Options

- Sort by: certificateId, inspectionNo, inspectionDateAndTime, location, effectiveDate, expiryDate
- Multi-sort support
- Date range filter: fromDate - toDate (filter by effectiveDate and expiryDate)
- Pagination: 10, 25, 50 rows per page
- Tab filter: activeFlag + cancelRequestFlag combinations
