import { streamToCsv } from "@/lib/csv/streamToCsv";
import { createWorkbook } from "@/lib/xlsx/createWorkbook";
import { writeSheet } from "@/lib/xlsx/writeSummarySheet";
import { CertificateExportRepository } from "@/repositories/export/CertificateExportRepository";
import { ExportResult } from "@/lib/export/types";
export class CertificateExportService {
    private repo = new CertificateExportRepository();
    private CSV_ROW_LIMIT = 1_000_000;
    async exportCertificates() : Promise<ExportResult> {
        const totalRows = await this.repo.getCertificateCount();
        // 🔴 condition สำคัญ
        if (totalRows > this.CSV_ROW_LIMIT) {  
            // → CSV streaming
            const dbStream = await this.repo.streamAllCertificates();
            const csvStream = streamToCsv(dbStream, {
                headers: ["certificateId","committee_name","auditor_name","effectiveDate","expiryDate","activeFlag","cancelRequestFlag","cancelRequestDetail","farmer_name","location"],
            });
            return {
                type: "csv" as const,
                stream: csvStream,
                filename: "รายงานใบรับรอง.csv",
            };
        }
        // 🟢 SMALL DATA → XLSX (RAW DAT   A
        const certificates = await this.repo.getAllCertificates();
        const workbook = createWorkbook("Certificates");
        // Raw data sheet
        await writeSheet(
            workbook,
            "Certificates",
            [
                { header: "หมายเลขใบรับรอง", key: "certificateId", width: 20 },
                { header: "ชื่อคณะกรรมการผู้ออกใบรับรอง", key: "committee_name", width: 25 },
                { header: "ชื่อผู้ประเมิน", key: "auditor_name", width: 25 },
                { header: "วันที่ใบรับรองมีผล", key: "effectiveDate", width: 20 },
                { header: "วันหมดอายุใบรับรอง", key: "expiryDate", width: 20 },   
                { header: "สถานะใบรับรอง", key: "activeFlag", width: 15 },
                { header: "สถานะการขอยกเลิกใบรับรอง", key: "cancelRequestFlag", width: 20 },
                { header: "รายละเอียดการยกเลิกใบรับรอง", key: "cancelRequestDetail", width: 30 },
                { header: "ชื่อเกษตรกร", key: "farmer_name", width: 25 },
                { header: "ที่ตั้งสวนยาง", key: "location", width: 50 },
            ],
            certificates
        );
        return {
            type: "xlsx" as const,
            workbook,
            filename: "รายงานใบรับรอง.xlsx",
        };
    }
}