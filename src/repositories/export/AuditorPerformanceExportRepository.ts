import { BaseExportRepository } from "../base/BaseExportRepository";

export class AuditorPerformanceExportRepository extends BaseExportRepository {
  // Add methods for exporting auditor performance data as needed
  async streamAllAuditorPerformances() {
    const sql = `
            WITH auditor_inspections AS (
                -- Chief auditor inspections
                SELECT
                    a."auditorId",
                    i."inspectionId",
                    i."inspectionResult"
                FROM "Auditor" a
                JOIN "Inspection" i
                    ON i."auditorChiefId" = a."auditorId"

                UNION

                -- Team member inspections
                SELECT
                    ai."auditorId",
                    i."inspectionId",
                    i."inspectionResult"
                FROM "AuditorInspection" ai
                JOIN "Inspection" i
                    ON i."inspectionId" = ai."inspectionId"
            )

            SELECT  
                a."auditorId",  
                a."namePrefix" || ' ' || a."firstName" || ' ' || a."lastName" AS auditor_name,
                COUNT(ai."inspectionId") AS total_inspections,
                SUM(CASE WHEN ai."inspectionResult" IN ('ผ่าน', 'PASSED') THEN 1 ELSE 0 END) AS passed_inspections,
                SUM(CASE WHEN ai."inspectionResult" IN ('ไม่ผ่าน', 'FAILED') THEN 1 ELSE 0 END) AS failed_inspections,
                CASE 
                    WHEN COUNT(ai."inspectionId") = 0 THEN 0
                    ELSE ROUND(
                        SUM(CASE WHEN ai."inspectionResult" IN ('ผ่าน', 'PASSED') THEN 1 ELSE 0 END)::numeric
                        / COUNT(ai."inspectionId") * 100,
                        2
                    )
                END AS pass_rate
            FROM "Auditor" a
            LEFT JOIN auditor_inspections ai
                ON ai."auditorId" = a."auditorId"
            GROUP BY
                a."auditorId",
                a."namePrefix",
                a."firstName",
                a."lastName"
            ORDER BY a."auditorId";
            `;

    return this.createQueryStream(sql);
  }

  async getAuditorPerformanceCount(): Promise<number> {
    const result = await this.executeAggregation<{ count: number }>(`
        SELECT COUNT(*)::int AS count FROM "Auditor"
    `);
    return result[0]?.count ?? 0;
  }
  async getAllAuditorPerformances(): Promise<
    {
      auditorId: number;
      auditor_name: string;
      total_inspections: number;
      passed_inspections: number;
      failed_inspections: number;
      pass_rate: number;
    }[]
  > {
    const sql = `
            WITH auditor_inspections AS (
                -- Chief auditor inspections
                SELECT
                    a."auditorId",
                    i."inspectionId",
                    i."inspectionResult"
                FROM "Auditor" a
                JOIN "Inspection" i
                    ON i."auditorChiefId" = a."auditorId"

                UNION

                -- Team member inspections
                SELECT
                    ai."auditorId",
                    i."inspectionId",
                    i."inspectionResult"
                FROM "AuditorInspection" ai
                JOIN "Inspection" i
                    ON i."inspectionId" = ai."inspectionId"
            )

            SELECT  
                a."auditorId",  
                a."namePrefix" || ' ' || a."firstName" || ' ' || a."lastName" AS auditor_name,
                COUNT(ai."inspectionId") AS total_inspections,
                SUM(CASE WHEN ai."inspectionResult" IN ('ผ่าน', 'PASSED') THEN 1 ELSE 0 END) AS passed_inspections,
                SUM(CASE WHEN ai."inspectionResult" IN ('ไม่ผ่าน', 'FAILED') THEN 1 ELSE 0 END) AS failed_inspections,
                CASE 
                    WHEN COUNT(ai."inspectionId") = 0 THEN 0
                    ELSE ROUND(
                        SUM(CASE WHEN ai."inspectionResult" IN ('ผ่าน', 'PASSED') THEN 1 ELSE 0 END)::numeric
                        / COUNT(ai."inspectionId") * 100,
                        2
                    )
                END AS pass_rate
            FROM "Auditor" a
            LEFT JOIN auditor_inspections ai
                ON ai."auditorId" = a."auditorId"
            GROUP BY
                a."auditorId",
                a."namePrefix",
                a."firstName",
                a."lastName"
            ORDER BY a."auditorId";
            `;

    const result = await this.executeAggregation<{
      auditorId: number;
      auditor_name: string;
      total_inspections: number;
      passed_inspections: number;
      failed_inspections: number;
      pass_rate: number;
    }>(sql);
    return result;
  }
}
