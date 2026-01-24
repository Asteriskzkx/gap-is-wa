import { BaseExportRepository } from "../base/BaseExportRepository";

interface UserRow {
  id: number;
  email: string;
  createdAt: Date;
}

export class UserExportRepository extends BaseExportRepository {
  async streamAllUsers() {
    const sql = `
      SELECT "email", "name", "role", "createdAt"
      FROM "User"
      ORDER BY "userId"
    `;

    return this.createQueryStream(sql);
  }

  async getUserCount(): Promise<number> {
    const result = await this.executeAggregation<{ count: number }>(`
        SELECT COUNT(*)::int AS count FROM "User"
    `);

    return result[0]?.count ?? 0;
  }
}
