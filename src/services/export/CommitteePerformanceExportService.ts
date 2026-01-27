import { streamToCsv } from "@/lib/csv/streamToCsv";
import { createWorkbook } from "@/lib/xlsx/createWorkbook";
import { writeSheet } from "@/lib/xlsx/writeSummarySheet";
import { ExportResult } from "@/lib/export/types";
import { CommitteePerformanceExportRepository } from "@/repositories/export/CommitteePerformanceExportRepository";

export class CommitteePerformanceExportService {
  private repo = new CommitteePerformanceExportRepository();   
    private CSV_ROW_LIMIT = 1_000_000;
    async exportCommitteePerformances(committeeId:number,committeeName:string) : Promise<ExportResult> {
        const totalRows = await this.repo.getCommitteePerformanceCount(committeeId);
        // 🔴 condition สำคัญ
        if (totalRows > this.CSV_ROW_LIMIT) {
            // → CSV streaming
            const dbStream = await this.repo.streamAllCommitteePerformances(committeeId);
            const csvStream = streamToCsv(dbStream, {
            headers: [ "committeeId","certificateId", "farmer_name", "location", "effectiveDate", "expiryDate", "activeFlag"],
            });
            return {
            type: "csv" as const,
            stream: csvStream,
            filename: `รายงานประสิทธิภาพคณะกรรมการ_${committeeName}.csv`,
            };
        }
        // 🟢 SMALL DATA → XLSX (RAW DATA
        const committeePerformances = await this.repo.getAllCommitteePerformances(committeeId);
        const workbook = createWorkbook("CommitteePerformances");
        // Raw data sheet
        await writeSheet(
            workbook,
            "CommitteePerformances",
            [
            {header: "รหัสคณะกรรมการ", key: "committeeId", width: 20 },
            { header: "เลขที่ใบรับรอง", key: "certificateId", width: 20 },
            { header: "ชื่อเกษตรกร", key: "farmer_name", width: 25 },
            { header: "ที่ตั้ง", key: "location", width: 20 },
            { header: "วันที่ออก", key: "effectiveDate", width: 20 },
            { header: "วันหมดอายุ", key: "expiryDate", width: 20 },
            { header: "สถานะใบรับรอง", key: "activeFlag", width: 20 },
            ],
            committeePerformances
        );
        return {
            type: "xlsx" as const,
            workbook,
            filename: `รายงานประสิทธิภาพคณะกรรมการ_${committeeName}.xlsx`,
        };
    }
}