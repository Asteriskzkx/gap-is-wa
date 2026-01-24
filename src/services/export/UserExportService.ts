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
    const adminRole = await this.repo.getByRole(this.RoleEnum.ADMIN);
    const committeeRole = await this.repo.getByRole(this.RoleEnum.COMMITTEE);
    const farmerRole = await this.repo.getByRole(this.RoleEnum.FARMER);
    const auditorRole = await this.repo.getByRole(this.RoleEnum.AUDITOR);

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
        filename: "users.csv",
      };
    }

    // → XLSX summary (หรือ full xlsx ถ้าข้อมูลไม่เยอะ)
    const workbook = createWorkbook("Users");

    await writeSheet(
      workbook,
      "Users Summary",
      [{ header: "ผู้ใช้ทั้งหมด", key: "total" },{header: "ผู้ดูแลระบบ", key: "admin" },{header: "คณะกรรมการ", key: "committee" },{header: "เกษตรกร", key: "farmer" },{header: "ผู้ตรวจประเมิน", key: "auditor" }],
      [{ total: totalRows , admin: adminRole.length , committee: committeeRole.length , farmer: farmerRole.length , auditor: auditorRole.length }],
    );

    return {
      type: "xlsx" as const,
      workbook,
      filename: "users.xlsx",
    };
  }
}
