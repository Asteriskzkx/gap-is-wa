# Report (Admin / Committee / Auditor) - Sequence Diagram (High-Level)

```mermaid
sequenceDiagram
    actor User as aUser:User
    participant Page as ReportPage (role-specific)
    participant ReportsAPI as Reports API (Next.js route handlers)
    participant Auth as checkAuthorization()
    participant ReportSvc as ReportService (role-specific)
    participant DB as Database (Prisma)
    participant PDF as exportReportPDF (client)
    participant ExportAPI as ExportExcel API (/api/v1/reports/export-excel)
    participant ExportSvc as Export Services
    participant Zip as archiver(zip)

    Note over User,DB: Step 1: Open Report Page (initial load)
    User->>Page: Open /{admin|committee|auditor}/report

    alt ADMIN
        Note over User,DB: Load multiple summaries (server-side via API)
        par Users summary
            Page->>ReportsAPI: GET /api/v1/reports/users?startDate&endDate
            ReportsAPI->>Auth: checkAuthorization(req, ["ADMIN"])
            Auth-->>ReportsAPI: authorized + session
            ReportsAPI->>ReportSvc: AdminReportService.getUserReportSummary()
            ReportSvc-->>DB: prisma.user.count(...)
            DB-->>ReportSvc: counts
            ReportSvc-->>ReportsAPI: {totalUsers,countByRole}
            ReportsAPI-->>Page: JSON
        and New users time series
            Page->>ReportsAPI: GET /api/v1/reports/users/new-users?startDate&endDate
            ReportsAPI->>Auth: checkAuthorization(req, ["ADMIN"])
            ReportsAPI->>ReportSvc: AdminReportService.getNewUsersByDateRange()
            ReportSvc-->>DB: prisma.user.findMany/grouping logic
            DB-->>ReportSvc: users
            ReportSvc-->>ReportsAPI: {data,roles,granularity}
            ReportsAPI-->>Page: JSON
        and Inspections summary
            Page->>ReportsAPI: GET /api/v1/reports/inspections?startDate&endDate
            ReportsAPI->>Auth: checkAuthorization(req, ["ADMIN"])
            ReportsAPI->>ReportSvc: AdminReportService.getInspectionReportSummary()
            ReportSvc-->>DB: prisma.inspection.aggregate/groupBy
            DB-->>ReportSvc: aggregates
            ReportsAPI-->>Page: JSON
        and Rubber farms summary
            Page->>ReportsAPI: GET /api/v1/reports/rubber-farms?startDate&endDate
            ReportsAPI->>Auth: checkAuthorization(req, ["ADMIN"])
            ReportsAPI->>ReportSvc: AdminReportService.getRubberFarmReportSummary()
            ReportSvc-->>DB: prisma.rubberFarm + details + aggregation
            DB-->>ReportSvc: farms
            ReportsAPI-->>Page: JSON
        and Certificates summary
            Page->>ReportsAPI: GET /api/v1/reports/certificates?startDate&endDate
            ReportsAPI->>Auth: checkAuthorization(req, ["ADMIN"])
            ReportsAPI->>ReportSvc: AdminReportService.getCertificateReportSummary()
            ReportSvc-->>DB: prisma.certificate.count(...)
            DB-->>ReportSvc: counts
            ReportsAPI-->>Page: JSON
        end

        Note over User,DB: Load paginated tables (lazy pagination)
        Page->>ReportsAPI: GET /api/v1/reports/rubber-farms?limit&offset&startDate&endDate
        ReportsAPI->>ReportSvc: AdminReportService.getRubberFarmProvincePaginated()
        ReportSvc-->>DB: prisma.rubberFarm details + map + slice
        ReportsAPI-->>Page: {results,paginator}

        Page->>ReportsAPI: GET /api/v1/reports/auditor-performance?limit&offset&startDate&endDate
        ReportsAPI->>ReportSvc: AdminReportService.getAuditorPerformancePaginated()
        ReportSvc-->>DB: prisma.auditor + inspections + compute metrics + slice
        ReportsAPI-->>Page: {results,paginator,summary}

    else COMMITTEE
        Note over User,DB: Load committee report (base + optional date filter)
        Page->>ReportsAPI: GET /api/v1/reports/committee?startDate&endDate
        ReportsAPI->>Auth: checkAuthorization(req, ["COMMITTEE"])
        Auth-->>ReportsAPI: authorized + session
        ReportsAPI->>ReportSvc: CommitteeReportService.getCommitteeReport(startDate,endDate,userId)
        ReportSvc-->>DB: prisma.certificate/prisma.inspection queries + joins
        DB-->>ReportSvc: result sets
        ReportSvc-->>ReportsAPI: CommitteeReportSummary JSON
        ReportsAPI-->>Page: JSON

    else AUDITOR
        Note over User,DB: Load "my report" (filtered to current auditor)
        Page->>ReportsAPI: GET /api/v1/reports/auditor/my-report?startDate&endDate
        ReportsAPI->>Auth: checkAuthorization(req, ["AUDITOR"])
        Auth-->>ReportsAPI: authorized + session
        ReportsAPI->>ReportSvc: AuditorReportService.getMyInspectionReport(userId,startDate,endDate)
        ReportSvc-->>DB: prisma.auditor + prisma.inspection.findMany(include relations)
        DB-->>ReportSvc: inspections
        ReportSvc-->>ReportsAPI: AuditorReportSummary JSON
        ReportsAPI-->>Page: JSON
    end

    Page-->>User: Render cards/charts/tables

    Note over User,PDF: Step 2: Export PDF (client-side)
    User->>Page: Click "ส่งออก PDF"
    Page->>PDF: exportReportPDF({header,sections[]})
    PDF-->>Page: PDF file generated
    Page-->>User: Download .pdf

    Note over User,Zip: Step 3: Export Excel/ZIP (server-side)
    User->>Page: Click "ส่งออก Excel"
    Page->>ExportAPI: POST /api/v1/reports/export-excel {sections[], startDate?, endDate?}
    ExportAPI->>Auth: checkAuthorization(req, ["ADMIN","COMMITTEE","AUDITOR"])
    Auth-->>ExportAPI: authorized + session
    ExportAPI->>Zip: create zip stream

    loop For each selected section
        ExportAPI->>ExportSvc: export*(role/section-specific)
        ExportSvc-->>DB: prisma queries + build sheet/file
        DB-->>ExportSvc: rows
        ExportSvc-->>Zip: append file to archive
    end

    Zip-->>ExportAPI: finalize()
    ExportAPI-->>Page: 200 application/zip (stream)
    Page-->>User: Download export-excel.zip
```

## High-Level Overview

### Main Flow

1. **Open Report Page** - เปิดหน้ารายงานตาม role (ADMIN / COMMITTEE / AUDITOR)
2. **Load Report Data** - UI ยิง `GET /api/v1/reports/*` เพื่อดึง summary แล้วแสดงผลเป็น cards/charts/tables
3. **Filter by Date** - เลือกช่วงวันที่ → UI ยิง `GET` พร้อม `startDate/endDate` เพื่อคำนวณใหม่
4. **Export PDF** - รวม section ที่เลือกแล้ว export PDF แบบ client-side (จับ DOM + charts)
5. **Export Excel/ZIP** - ส่ง section ที่เลือกไป `POST /api/v1/reports/export-excel` แล้วดาวน์โหลดไฟล์ `.zip`

### Key Components

- `src/app/admin/report/page.tsx` - หน้า report ของ Admin (หลาย endpoint + pagination tables)
- `src/app/committee/report/page.tsx` - หน้า report ของ Committee (base report + chart refresh ตามช่วงวันที่)
- `src/app/auditor/report/page.tsx` - หน้า report ของ Auditor (my report)
- `src/app/api/v1/reports/*/route.ts` - route handlers ตรวจ role ด้วย `checkAuthorization()` แล้วเรียก service
- `src/services/AdminReportService.ts`, `src/services/CommitteeReportService.ts`, `src/services/AuditorReportService.ts` - สร้าง report summary ด้วย Prisma
- `src/app/api/v1/reports/export-excel/route.ts` + `src/services/export/*.ts` - export excel/zip ตาม section และสิทธิ์
- `src/lib/pdf/exportReportPDF.ts`, `src/lib/pdf/chartResize.ts` - export PDF จาก UI sections

### Endpoints Used By These Pages

- **Admin**
  - `GET /api/v1/reports/users?startDate&endDate`
  - `GET /api/v1/reports/users/new-users?startDate&endDate`
  - `GET /api/v1/reports/inspections?startDate&endDate`
  - `GET /api/v1/reports/rubber-farms?startDate&endDate`
  - `GET /api/v1/reports/rubber-farms?limit&offset&startDate&endDate` (pagination)
  - `GET /api/v1/reports/certificates?startDate&endDate`
  - `GET /api/v1/reports/auditor-performance?limit&offset&startDate&endDate` (pagination)
  - `POST /api/v1/reports/export-excel`

- **Committee**
  - `GET /api/v1/reports/committee?startDate&endDate`
  - `POST /api/v1/reports/export-excel`

- **Auditor**
  - `GET /api/v1/reports/auditor/my-report?startDate&endDate`
  - `POST /api/v1/reports/export-excel`
