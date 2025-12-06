# Farmer Applications Cancel - Sequence Diagram (High-Level)

```mermaid
sequenceDiagram
    actor Farmer as aFarmer:Farmer
    participant Page as CancelCertificatePage
    participant Controller as CC:CertificateController
    participant Service as CS:CertificateService
    participant Repository as CR:CertificateRepository
    participant Database as Database

    Note over Farmer,Database: Step 1: Load Certificates List
    Farmer->>Page: getAlreadyIssuedOrFarmer(req)
    Page->>Controller: getAlreadyIssuedForFarmer(req)
    Controller->>Service: getAlreadyIssued(options)
    Service->>Repository: findAllWithPagination(options)
    Repository-->>Database: query:SELECT * FROM certificate WHERE farmerId = {...}
    Database-->>Repository: QueryResult
    Repository-->>Service: data: List<Certificate>, total: int
    Service-->>Controller: data: List<Certificate>, total: int
    Controller-->>Page: results: List<Certificate>, pagination: {...}
    Page-->>Farmer: Display certificates list

    Note over Farmer,Database: Step 2: Select Certificate
    Farmer->>Page: selectCertificate(certificateId)
    Page-->>Farmer: Show cancel confirmation form

    Note over Farmer,Database: Step 3: Submit Cancel Request
    Farmer->>Page: updateCancelRequestDetail(req)
    Page->>Controller: updateCancelRequestDetail(req)
    Controller->>Service: updateCancelRequestDetail(certificateId, cancelRequestDetail, version)
    Service->>Repository: updateWithLock(certificateId, data, currentVersion)
    Repository-->>Database: query:UPDATE certificate SET cancelRequestFlag = {...} WHERE certificateId = {...} AND version = {...}
    Database-->>Repository: QueryResult
    Repository-->>Service: Updated Certificate
    Service-->>Controller: Updated Certificate
    Controller-->>Page: Success response
    Page-->>Farmer: Display success message
```

## High-Level Overview

### Main Flow

1. **Load Certificates List** - เกษตรกรเข้าสู่หน้ายกเลิกใบรับรอง ระบบจะโหลดรายการใบรับรองที่ออกให้เกษตรกรแล้ว
2. **Select Certificate** - เกษตรกรเลือกใบรับรองที่ต้องการยกเลิก และกรอกเหตุผลการยกเลิก
3. **Submit Cancel Request** - เกษตรกรส่งคำขอยกเลิก ระบบอัปเดตสถานะใบรับรองพร้อม optimistic locking

### Key Components

- **CancelCertificatePage** - UI component สำหรับการยกเลิกใบรับรอง
- **CertificateController** - จัดการ request/response สำหรับข้อมูลใบรับรอง
- **CertificateService** - Business logic ของการจัดการใบรับรอง
- **CertificateRepository** - Data access layer สำหรับใบรับรอง

### Features

- Pagination และ Sorting สำหรับรายการใบรับรอง
- Filter ตามวันที่ (fromDate, toDate)
- Tab switching ระหว่างใบรับรองที่ใช้งานอยู่ และที่ยื่นขอยกเลิกแล้ว
- Optimistic Locking เพื่อป้องกันการ update พร้อมกัน
- แสดงข้อมูลการตรวจสอบและสถานที่สวนยางที่เกี่ยวข้อง

### Certificate States

- **In-Use** (activeFlag=true, cancelRequestFlag=false) - ใบรับรองที่ใช้งานอยู่
- **Cancel Requested** (cancelRequestFlag=true, activeFlag=true) - ยื่นขอยกเลิกแล้ว
- **Cancelled** (cancelRequestFlag=true, activeFlag=false) - ยกเลิกใบรับรองแล้ว
