import { UserExportRepository } from "@/repositories/export/UserExportRepository";
import { streamToCsv } from "@/lib/csv/streamToCsv";
import { createWorkbook } from "@/lib/xlsx/createWorkbook";
import { writeSheet } from "@/lib/xlsx/writeSummarySheet";

export class UserExportService {
  private repo = new UserExportRepository();

  private RoleEnum = {
    ADMIN: "ADMIN",
    COMMITTEE: "COMMITTEE",
    FARMER: "FARMER",
    AUDITOR: "AUDITOR",
  }
  private CSV_ROW_LIMIT = 1_000_000;

  async exportUsers() {
    const totalRows = await this.repo.getUserCount();

    // 🔴 condition สำคัญ
    if (totalRows > this.CSV_ROW_LIMIT) {
      // → CSV streaming
      const dbStream = await this.repo.streamAllUsers();

      const csvStream = streamToCsv(dbStream, {
        headers: ["email", "name", "role", "createdAt"],
      });

      return {
        type: "csv" as const,
        stream: csvStream,
        filename: "รายงานผู้ใช้งาน.csv",
      };
    }

        // 🟢 SMALL DATA → XLSX (RAW DATA)
    const users = await this.repo.getAllUsers();

    const workbook = createWorkbook("Users");

    // Raw data sheet
    await writeSheet(
        workbook,
        "Users",
        [
        { header: "อีเมลล์", key: "email", width: 30 },
        { header: "ชื่อ-นามสกุล", key: "name", width: 25 },
        { header: "บทบาท", key: "role", width: 15 },
        { header: "สร้างเมื่อ", key: "createdAt", width: 20 },
        ],
        users
    );

    return {
        type: "xlsx" as const,
        workbook,
        filename: "รายงานผู้ใช้งาน.xlsx",
    };
  }
}
