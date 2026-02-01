# แผนผังเว็บไซต์ (Sitemap)

เอกสารนี้สรุปหน้าเว็บ (routes) ของระบบ **GAP-IS-WA** ตามโครงสร้าง Next.js App Router ใน `src/app` และเมนูที่กำหนดใน `src/config/navItems.tsx` (อัปเดต: 2026-02-01)

> หมายเหตุ: เส้นทางที่ขึ้นต้นด้วย `/farmer`, `/auditor`, `/committee`, `/admin` ถูกป้องกันด้วย NextAuth middleware ใน `src/middleware.ts` (ต้องเข้าสู่ระบบ และ role ต้องตรง)

## ภาพรวม (Public → Role)

```mermaid
---
title: Sitemap (ภาพรวม)
config:
  layout: elk
---
flowchart TB
  A["/ (หน้าเข้าสู่ระบบ)"] --> B["เลือกบทบาทผู้ใช้ (เกษตรกร/ผู้ตรวจประเมิน/คณะกรรมการ/ผู้ดูแลระบบ)"]
  B --> C["กรอกอีเมล + รหัสผ่าน"]
  C --> D{เข้าสู่ระบบสำเร็จ?}
  D -- ไม่สำเร็จ --> A

  D -- เกษตรกร --> F["/farmer/dashboard"]
  D -- ผู้ตรวจประเมิน --> G["/auditor/dashboard"]
  D -- คณะกรรมการ --> H["/committee/dashboard"]
  D -- ผู้ดูแลระบบ --> I["/admin/dashboard"]

  A -. เฉพาะเกษตรกร .-> R["/register (สมัครสมาชิกเกษตรกร)"]
  R --> RS["/register/success (สมัครสมาชิกสำเร็จ)"]
  RS --> A
```

## Sitemap สำหรับเกษตรกร (FARMER)

```mermaid
---
title: Sitemap (เกษตรกร)
config:
  layout: elk
---
flowchart TB
  D["/farmer/dashboard (หน้าหลัก)"]

  D --> A1["/farmer/applications/new (ยื่นขอใบรับรองแหล่งผลิต)"]
  D --> A2["/farmer/applications (ติดตามสถานะการรับรอง)"]
  A2 --> A3["/farmer/applications/edit (แก้ไขข้อมูลคำขอใบรับรองแหล่งผลิต)"]
  A2 --> A4["/farmer/applications/cancel (ขอยกเลิกใบรับรองแหล่งผลิต)"]

  D --> C1["/farmer/certificates (ใบรับรองแหล่งผลิตที่ได้รับ)"]
  D --> F1["/farmer/rubber-farms (สวนยางพารา)"]

  D --> P["/farmer/profile (โปรไฟล์/ข้อมูลส่วนตัว)"]
  D --> S["/farmer/settings (ตั้งค่า)"]
```

## Sitemap สำหรับผู้ตรวจประเมิน (AUDITOR)

```mermaid
---
title: Sitemap (ผู้ตรวจประเมิน)
config:
  layout: elk
---
flowchart TB
  D["/auditor/dashboard (หน้าหลัก)"]

  D --> I["/auditor/inspections (ตรวจประเมินสวนยางพารา)"]
  I --> IS["/auditor/inspection-summary/[id] (สรุปผลการตรวจประเมินรายงานตรวจ)"]
  IS --> ID["/auditor/inspection-detail/[id]/[itemId] (รายละเอียดหัวข้อการตรวจ)"]

  D --> A["/auditor/applications (แจ้งกำหนดการวันที่ตรวจประเมิน)"]
  D --> R1["/auditor/reports (สรุปผลการตรวจประเมิน)"]
  D --> G["/auditor/garden-data (บันทึกข้อมูลประจำสวนยาง)"]
  D --> C["/auditor/consultations (บันทึกการให้คำปรึกษาและข้อบกพร่อง)"]
  D --> RP["/auditor/report (ตรวจสอบรายงาน)"]

  D --> P["/auditor/profile (โปรไฟล์/ข้อมูลส่วนตัว)"]
  D --> S["/auditor/settings (ตั้งค่า)"]
```

## Sitemap สำหรับคณะกรรมการ (COMMITTEE)

```mermaid
---
title: Sitemap (คณะกรรมการ)
config:
  layout: elk
---
flowchart TB
  D["/committee/dashboard (หน้าหลัก)"]

  D --> A["/committee/assessments (พิจารณาผลการตรวจประเมิน)"]
  A --> AS["/committee/assessments/summary/[id] (สรุปผลการตรวจประเมินรายคำขอ)"]
  AS --> AD["/committee/assessments/summary/detail/[id]/[itemId] (รายละเอียดผลการตรวจรายหัวข้อ)"]

  D --> L["/committee/certifications/list (ใบรับรองแหล่งผลิตจีเอพีในระบบ)"]
  D --> I["/committee/certifications/issue (ออกใบรับรองแหล่งผลิตจีเอพี)"]
  D --> R["/committee/certifications/revoke (ยกเลิกใบรับรองแหล่งผลิตจีเอพี)"]
  D --> RP["/committee/report (ตรวจสอบรายงาน)"]

  D --> P["/committee/profile (โปรไฟล์/ข้อมูลส่วนตัว)"]
  D --> S["/committee/settings (ตั้งค่า)"]
```

## Sitemap สำหรับผู้ดูแลระบบ (ADMIN)

```mermaid
---
title: Sitemap (ผู้ดูแลระบบ)
config:
  layout: elk
---
flowchart TB
  D["/admin/dashboard (หน้าหลัก)"]

  D --> U["/admin/user-management (จัดการผู้ใช้ในระบบ)"]
  U --> UE["/admin/user-management/edit/[id] (แก้ไขข้อมูลผู้ใช้)"]

  D --> L["/admin/audit-logs (ตรวจสอบบันทึกเหตุการณ์ในระบบ)"]
  D --> RP["/admin/report (ตรวจสอบรายงาน)"]

  D --> P["/admin/profile (โปรไฟล์/ข้อมูลส่วนตัว)"]
  D --> S["/admin/settings (ตั้งค่า)"]
```

## หน้าอื่นๆ (ภายใน/สำหรับพัฒนา)

```mermaid
---
title: Sitemap (หน้าอื่นๆ)
config:
  layout: elk
---
flowchart TB
  A["/showme/preview-component (หน้า preview component)"]
  B["/showme/preview-icon (หน้า preview icon)"]
  N["/not-found (404)"]
```
