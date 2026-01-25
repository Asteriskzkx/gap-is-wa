import { BaseExportRepository } from "../base/BaseExportRepository";

export class AuditorPerformanceExportRepository extends BaseExportRepository {
  // Add methods for exporting auditor performance data as needed
    async streamAllAuditorPerformances() {
        const sql = `
        SELECT  
            a."auditorId",  
            a."namePrefix" || ' ' || a."firstName" || ' ' || a."lastName" AS auditor_name,
            COUNT(i."inspectionId") AS total_inspections,
            SUM(CASE WHEN i."inspectionResult" = 'ผ่าน' THEN 1 ELSE 0 END) AS passed_inspections,
            SUM(CASE WHEN i."inspectionResult" = 'ไม่ผ่าน' THEN 1 ELSE 0 END) AS failed_inspections,
            CASE 
                WHEN COUNT(i."inspectionId") = 0 THEN 0
                ELSE ROUND(
                    SUM(CASE WHEN i."inspectionResult" = 'ผ่าน' THEN 1 ELSE 0 END)::numeric
                    / COUNT(i."inspectionId") * 100
                , 2)
            END AS pass_rate
        FROM "Auditor" a
        LEFT JOIN "Inspection" i
            ON a."auditorId" = i."auditorChiefId"
        GROUP BY a."auditorId", a."namePrefix", a."firstName", a."lastName"
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
    async getAllAuditorPerformances(): Promise<{
        auditorId: number;
        auditor_name: string;
        total_inspections: number;
        passed_inspections: number;
        failed_inspections: number;
        pass_rate : number;
    }[]> {  
        const sql = `
        SELECT  
            a."auditorId",  
            a."namePrefix" || ' ' || a."firstName" || ' ' || a."lastName" AS auditor_name,
            COUNT(i."inspectionId") AS total_inspections,
            SUM(CASE WHEN i."inspectionResult" = 'ผ่าน' THEN 1 ELSE 0 END) AS passed_inspections,
            SUM(CASE WHEN i."inspectionResult" = 'ไม่ผ่าน' THEN 1 ELSE 0 END) AS failed_inspections,
            CASE 
                WHEN COUNT(i."inspectionId") = 0 THEN 0
                ELSE ROUND(
                    SUM(CASE WHEN i."inspectionResult" = 'ผ่าน' THEN 1 ELSE 0 END)::numeric
                    / COUNT(i."inspectionId") * 100
                , 2)
            END AS pass_rate
        FROM "Auditor" a
        LEFT JOIN "Inspection" i
            ON a."auditorId" = i."auditorChiefId"
        GROUP BY a."auditorId", a."namePrefix", a."firstName", a."lastName"
        ORDER BY a."auditorId";
    `;      
        const result =  await this.executeAggregation<{
            auditorId: number;
            auditor_name: string;
            total_inspections: number;
            passed_inspections: number;
            failed_inspections: number;
            pass_rate : number;
        }>(sql);
        return result;
    }
}