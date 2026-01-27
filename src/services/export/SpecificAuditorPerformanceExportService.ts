import { streamToCsv } from "@/lib/csv/streamToCsv";
import { createWorkbook } from "@/lib/xlsx/createWorkbook";
import { writeSheet } from "@/lib/xlsx/writeSummarySheet";
import { ExportResult } from "@/lib/export/types";
import { SpecificAuditorPerformanceExportRepository } from "@/repositories/export/SpecificAuditorPerformanceExportRepository";

export class SpecificAuditorPerformanceExportService {
  private repo = new SpecificAuditorPerformanceExportRepository()
    private CSV_ROW_LIMIT = 1_000_000;
    async exportSpecificAuditorPerformance(auditorId:number,auditorName:string) : Promise<ExportResult> {
        const totalRows = await this.repo.getSpecificAuditorPerformanceCount(auditorId);
        // 🔴 condition สำคัญ
        if (totalRows > this.CSV_ROW_LIMIT) {
            // → CSV streaming
            const dbStream = await this.repo.streamSpecificAuditorPerformance(auditorId);
            const csvStream = streamToCsv(dbStream, {
                headers: ["inspectionNo", "inspectionDateAndTime", "inspectionStatus", "inspectionResult", "inspection_type", "rubberFarmId", "farmer_name", "location",  "farmer_phone_number", "farmer_mobile_phone_number"],
            });
            return {
                type: "csv" as const,
                stream: csvStream,
                filename: `รายงานประสิทธิภาพและการตรวจประเมิน_${auditorName}.csv`,
            };
        }
        // 🟢 SMALL DATA → XLSX (RAW DATA
        const performances = await this.repo.getSpecificAuditorPerformance(auditorId);
        const workbook = createWorkbook("SpecificAuditorPerformance");
        // Raw data sheet
        await writeSheet(
            workbook,
            "SpecificAuditorPerformance",
            [
                { header: "หมายเลขการตรวจสอบ", key: "inspectionNo", width: 20 },
                { header: "วันที่และเวลาตรวจสอบ", key: "inspectionDateAndTime", width: 25 },
                { header: "สถานะการตรวจสอบ", key: "inspectionStatus", width: 20 },
                { header: "ผลการตรวจสอบ", key: "inspectionResult", width: 20 },
                { header: "ประเภทการตรวจสอบ", key: "inspection_type", width: 30},
                { header: "รหัสแปลงสวนยาง", key: "rubberFarmId", width: 15 },
                { header: "ชื่อเจ้าของแปลงสวนยาง", key: "farmer_name", width: 30 },
                { header: "ที่อยู่แปลงสวนยาง", key: "location", width: 30 },
                { header: "เบอร์โทรศัพท์เจ้าของแปลงสวนยาง", key: "farmer_phone_number", width: 20 },
                { header: "เบอร์มือถือเจ้าของแปลงสวนยาง", key: "farmer_mobile_phone_number", width: 20 },
            ],
            performances
        );
        return {
            type: "xlsx" as const,
            workbook,
            filename: `รายงานประสิทธิภาพและการตรวจประเมิน_${auditorName}.xlsx`,
        };
    }   
}