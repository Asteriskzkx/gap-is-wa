import { streamToCsv } from "@/lib/csv/streamToCsv";
import { createWorkbook } from "@/lib/xlsx/createWorkbook";
import { writeSheet } from "@/lib/xlsx/writeSummarySheet";
import { AuditorPerformanceExportRepository } from "@/repositories/export/AuditorPerformanceExportRepository";
import { ExportResult } from "@/lib/export/types";

export class AuditorPerformanceExportService {
    private repo = new AuditorPerformanceExportRepository()
    private CSV_ROW_LIMIT = 1_000_000;
    
    async exportAuditorPerformances() : Promise<ExportResult> {
        const totalRows = await this.repo.getAuditorPerformanceCount();
        // 🔴 condition สำคัญ
        if (totalRows > this.CSV_ROW_LIMIT) {
            // → CSV streaming
            const dbStream = await this.repo.streamAllAuditorPerformances();
            const csvStream = streamToCsv(dbStream, {
                headers: ["auditorId", "auditor_name", "total_inspections", "passed_inspections", "failed_inspections", "pass_rate"],
            });
            return {
                type: "csv" as const,
                stream: csvStream,
                filename: "รายงานผลการปฏิบัติงานผู้ตรวจสอบ.csv",
            };
        }
        // 🟢 SMALL DATA → XLSX (RAW DATA)
        const auditorPerformances = await this.repo.getAllAuditorPerformances();
        const workbook = createWorkbook("AuditorPerformances");
        // Raw data sheet  
        await writeSheet(
            workbook,
            "AuditorPerformances",
            [
                { header: "รหัสผู้ตรวจสอบ", key: "auditorId", width: 20 },
                { header: "ชื่อผู้ตรวจสอบ", key: "auditor_name", width: 30 },
                { header: "จำนวนการตรวจสอบทั้งหมด", key: "total_inspections", width: 25 },
                { header: "จำนวนการตรวจสอบที่ผ่าน", key: "passed_inspections", width: 25 },
                { header: "จำนวนการตรวจสอบที่ไม่ผ่าน", key: "failed_inspections", width: 25 },
                { header: "อัตราการผ่าน (%)", key: "pass_rate", width: 20 },
            ],
            auditorPerformances
        ); 
        return {
            type: "xlsx" as const,
            workbook,
            filename: "รายงานผลการปฏิบัติงานผู้ตรวจสอบ.xlsx",
        };
    }
}