import { UserExportRepository } from "@/repositories/export/UserExportRepository";
import { streamToCsv } from "@/lib/csv/streamToCsv";
import { createWorkbook } from "@/lib/xlsx/createWorkbook";
import { writeSheet } from "@/lib/xlsx/writeSummarySheet";

export class UserExportService {
  private repo = new UserExportRepository();

  private CSV_ROW_LIMIT = 1_000_000;

  async exportUsers() {
    const totalRows = await this.repo.getUserCount();

    // 🔴 condition สำคัญ
    if (totalRows < this.CSV_ROW_LIMIT) {
      // → CSV streaming
      const dbStream = await this.repo.streamAllUsers();

      const csvStream = streamToCsv(dbStream, {
        headers: ["email", "name", "role", "createdAt"],
      });

      return {
        type: "csv" as const,
        stream: csvStream,
        filename: "users.csv",
      };
    }

    // → XLSX summary (หรือ full xlsx ถ้าข้อมูลไม่เยอะ)
    const workbook = createWorkbook("Users");

    await writeSheet(
      workbook,
      "Users Summary",
      [{ header: "Total Users", key: "total" }],
      [{ total: totalRows }],
    );

    return {
      type: "xlsx" as const,
      workbook,
      filename: "users.xlsx",
    };
  }
}
