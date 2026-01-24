import { InspectionsExportRepository } from "@/repositories/export/InspectionsExportRepository";
import { streamToCsv } from "@/lib/csv/streamToCsv";
import { createWorkbook } from "@/lib/xlsx/createWorkbook";
import { writeSheet } from "@/lib/xlsx/writeSummarySheet";

export class InspectionsExportService {
    private repo = new InspectionsExportRepository();
    private CSV_ROW_LIMIT = 1_000_000;
    async exportInspections() {
        const totalRows = await this.repo.getInspectionCount();
        // 🔴 condition สำคัญ
        if (totalRows > this.CSV_ROW_LIMIT) {
            // → CSV streaming
            const dbStream = await this.repo.streamAllInspections();
            const csvStream = streamToCsv(dbStream, {
                headers: ["inspectionNo", "inspectionDateAndTime", "inspectionStatus", "inspection_type", "auditor_name", "location", "activeFlag", "expiryDate"],
            });
            return {
                type: "csv" as const,
                stream: csvStream,
                filename: "รายงานการตรวจประเมิน.csv",
            };
        }
        // 🟢 SMALL DATA → XLSX (RAW DATA
        const inspections = await this.repo.getAllInspections();
        const workbook = createWorkbook("Inspections");
        // Raw data sheet
        await writeSheet(
            workbook,
            "Inspections",
            [
                { header: "หมายเลขการตรวจสอบ", key: "inspectionNo", width: 20 },
                { header: "วันที่และเวลาตรวจสอบ", key: "inspectionDateAndTime", width: 25 },
                { header: "สถานะการตรวจสอบ", key: "inspectionStatus", width: 20 },
                { header: "ประเภทการตรวจสอบ", key: "inspection_type", width: 30},
                { header: "ชื่อผู้ตรวจสอบ", key: "auditor_name", width: 25 },
                { header: "ชื่อเจ้าของแปลงสวนยาง", key: "farmer_name", width: 30 },
                { header: "ที่อยู่แปลงสวนยาง", key: "location", width: 30 },
                { header: "สถานะใบรับรอง", key: "activeFlag", width: 15 },
                { header: "วันหมดอายุใบรับรอง", key: "expiryDate", width: 20 },
    
            ],
            inspections
        );

        return {
            type: "xlsx" as const,
            workbook,
            filename: "รายงานการตรวจประเมิน.xlsx",
        };
    }
}