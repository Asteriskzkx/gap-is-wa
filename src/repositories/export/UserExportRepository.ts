import { BaseExportRepository } from "../base/BaseExportRepository";
import { dateRange } from "@/types/dateRange";
interface UserRow {
  id: number;
  email: string;
  createdAt: Date;
}

export class UserExportRepository extends BaseExportRepository {
  async streamAllUsers(dateRange?: dateRange) {
    const where = this.buildDateWhere(`"createdAt"`, dateRange);
    const sql = `
      SELECT "email", "name", "role", "createdAt"
      FROM "User"
      ${where}
      ORDER BY "userId"
    `;

    return this.createQueryStream(sql);
  }

  async getUserCount(dateRange? : dateRange): Promise<number> {
    const where = this.buildDateWhere(`"createdAt"`, dateRange);
    const result = await this.executeAggregation<{ count: number }>(`
        SELECT COUNT(*)::int AS count FROM "User" ${where}
    `);

    return result[0]?.count ?? 0;
  }
  async getAllUsers(dateRange? : dateRange): Promise<{
    email: string;
    name: string;
    role: string;
    createdAt: Date;
    }[]> {

    const where = this.buildDateWhere(`"createdAt"`, dateRange);

    const sql = `
        SELECT "email", "name", "role", "createdAt"
        FROM "User"
        ${where}
        ORDER BY "userId"
    `;

    return this.executeAggregation(sql);
    }


  async getByRole(role: string,dateRange? : dateRange): Promise<UserRow[]> {

    const where = this.buildDateWhere(`"createdAt"`, dateRange, [
      `"role" = '${role}'`,
    ]);
    const sql = `
      SELECT "userId", "email", "createdAt"
      FROM "User"
      ${where}
      ORDER BY "userId"
    `;
    return this.executeAggregation<UserRow>(sql);
  }
}
