# UML Class Diagrams

ไฟล์ในโฟลเดอร์นี้เป็น UML Class Diagram (เขียนด้วย Mermaid `classDiagram`) ที่อ้างอิงจากโค้ดจริงใน `src/{models,controllers,services,repositories}` และจัดโครงสร้างให้ใกล้เคียงกับภาพตัวอย่าง (Controller → Service → Repository → Model + Base classes)

## Index

- `UML/classDiagram/base.md` — BaseModel/BaseController/BaseService/BaseRepository
- `UML/classDiagram/user.md` — User + UserRegistrationFactory + UserRepository/UserService/UserController
- `UML/classDiagram/admin.md` — Admin (AdminModel/AdminService/AdminRepository/AdminController)
- `UML/classDiagram/farmer.md` — Farmer (FarmerModel/FarmerService/FarmerRepository/FarmerController)
- `UML/classDiagram/auditor.md` — Auditor (AuditorModel/AuditorService/AuditorRepository/AuditorController)
- `UML/classDiagram/committee.md` — Committee (CommitteeModel/CommitteeService/CommitteeRepository/CommitteeController)
- `UML/classDiagram/auditor-inspection.md` — AuditorInspection (join table)
- `UML/classDiagram/inspection-type-master.md` — InspectionTypeMaster
- `UML/classDiagram/inspection.md` — Inspection (รวมความสัมพันธ์กับ InspectionItem/DataRecord/AdviceAndDefect/AuditorInspection)
- `UML/classDiagram/inspection-item.md` — InspectionItem (รวมความสัมพันธ์กับ Requirement)
- `UML/classDiagram/requirement.md` — Requirement
- `UML/classDiagram/data-record.md` — DataRecord
- `UML/classDiagram/advice-and-defect.md` — AdviceAndDefect
- `UML/classDiagram/rubber-farm.md` — RubberFarm (รวมความสัมพันธ์กับ PlantingDetail/Inspection แบบย่อ)
- `UML/classDiagram/planting-detail.md` — PlantingDetail
- `UML/classDiagram/certificate.md` — Certificate
- `UML/classDiagram/audit-log.md` — AuditLog
- `UML/classDiagram/file.md` — File upload (FileController/FileService/FileRepository/FileModel)
- `UML/classDiagram/report-services.md` — รายงาน (AdminReportService/AuditorReportService/CommitteeReportService)

