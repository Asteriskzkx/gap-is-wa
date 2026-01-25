import { RubberFarmExportRepository } from "@/repositories/export/RubberFarmExportRepository";
import { streamToCsv } from "@/lib/csv/streamToCsv";
import { createWorkbook } from "@/lib/xlsx/createWorkbook";
import { writeSheet } from "@/lib/xlsx/writeSummarySheet";

export class RubberFarmExportService {
    private repo = new RubberFarmExportRepository();
    private CSV_ROW_LIMIT = 1_000_000;  
    async exportRubberFarms() {
        const totalRows = await this.repo.getRubberFarmCount();
        // 🔴 condition สำคัญ
        if (totalRows > this.CSV_ROW_LIMIT) {
            // → CSV streaming
            const dbStream = await this.repo.streamAllRubberFarms();
            const csvStream = streamToCsv(dbStream, {

                headers: ["rubberFarmId", "rubber_farm_location", "farmer_name", "phoneNumber", "areaOfPlot", "createdAt", "inspectionNo", "inspectionDateAndTime", "inspectionStatus", "inspectionResult", "auditorChiefId", "auditor_name"],
            });
            return {    
                type: "csv" as const,
                stream: csvStream,
                filename: "รายงานแปลงสวนยาง.csv",
            };
        }
        // 🟢 SMALL DATA → XLSX (RAW DATA
        const rubberFarms = await this.repo.getAllRubberFarms();
        const workbook = createWorkbook("RubberFarms");
        // Raw data sheet
        await writeSheet(
            workbook,
            "RubberFarms",
            [
                { header: "รหัสแปลงสวนยาง", key: "rubberFarmId", width: 15 },
                { header: "ที่อยู่สวนยาง", key: "rubber_farm_location", width: 15 },
                { header: "ชื่อเจ้าของแปลงสวนยาง", key: "farmer_name", width: 25 },
                { header: "เบอร์โทรศัพท์", key: "phoneNumber", width: 15 },
                { header: "ขนาดพื้นที่ (ไร่)", key: "areaOfPlot", width: 15 },
                { header: "สร้างเมื่อ", key: "createdAt", width: 20 },
                { header: "หมายเลขการตรวจสอบ", key: "inspectionNo", width: 20 },
                { header: "วันที่และเวลาตรวจสอบ", key: "inspectionDateAndTime", width: 25 },
                { header: "สถานะการตรวจสอบ", key: "inspectionStatus", width: 20 },
                { header: "ผลการตรวจสอบ", key: "inspectionResult", width: 20 },
                { header: "รหัสหัวหน้าผู้ตรวจสอบ", key: "auditorChiefId", width: 20 },
                { header: "ชื่อหัวหน้าผู้ตรวจสอบ", key: "auditor_name", width: 25 },
            ],
            rubberFarms
        );  
        return {
            type: "xlsx" as const,
            workbook,
            filename: "รายงานแปลงสวนยาง.xlsx",
        };
    }
}