import { BaseExportRepository } from "../base/BaseExportRepository";

export class CommitteePerformanceExportRepository extends BaseExportRepository {
    // Add methods for exporting committee performance data as needed
    async streamAllCommitteePerformances(committeeId:number) {    
         const sql = `
        SELECT
            com."committeeId",
            cc."certificateId",  
            f."namePrefix" || '' ||f."firstName" || ' ' || f."lastName" AS farmer_name,
            rf."villageName" || ', ' || rf."moo" || ', ' || rf."road" || ', ' || rf."alley" || ', ' || rf."subDistrict" || ', ' || rf."district" || ', ' || rf."province" AS location,
            c."effectiveDate",
            c."expiryDate",
            c."activeFlag"


        FROM "Committee" com
        LEFT JOIN "CommitteeCertificate" cc
        ON com."committeeId" = cc."committeeId"
        LEFT JOIN "Certificate" c
        ON cc."certificateId" = c."certificateId"
        LEFT JOIN "Inspection" i
        ON c."inspectionId" = i."inspectionId"
        LEFT JOIN "RubberFarm" rf
        ON i."rubberFarmId" = rf."rubberFarmId"
        LEFT JOIN "Farmer" f
        ON rf."farmerId" = f."farmerId"

        WHERE com."committeeId" = $1
    `;  
        return this.createQueryStream(sql,[committeeId]);
    }
    async getCommitteePerformanceCount(committeeId: number): Promise<number> {
        const result = await this.executeAggregation<{ count: number }>(
            `
            SELECT COUNT(*)::int AS count
            FROM "Committee" com
            LEFT JOIN "CommitteeCertificate" cc
            ON com."committeeId" = cc."committeeId"
            WHERE com."committeeId" = $1
            `,
            [committeeId]
        );

        return result[0]?.count ?? 0;
    }
    async getAllCommitteePerformances(committeeId:number): Promise<{
        committeeId: number;
        farmer_name: string;
        location: string;
        effectiveDate: Date;
        expiryDate: Date;
        activeFlag: boolean;
    }[]> {
        const sql = `
        SELECT
            com."committeeId",
            cc."certificateId",  
            f."namePrefix" || '' ||f."firstName" || ' ' || f."lastName" AS farmer_name,
            rf."villageName" || ', ' || rf."moo" || ', ' || rf."road" || ', ' || rf."alley" || ', ' || rf."subDistrict" || ', ' || rf."district" || ', ' || rf."province" AS location,
            c."effectiveDate",
            c."expiryDate",
            c."activeFlag"


        FROM "Committee" com
        LEFT JOIN "CommitteeCertificate" cc
        ON com."committeeId" = cc."committeeId"
        LEFT JOIN "Certificate" c
        ON cc."certificateId" = c."certificateId"
        LEFT JOIN "Inspection" i
        ON c."inspectionId" = i."inspectionId"
        LEFT JOIN "RubberFarm" rf
        ON i."rubberFarmId" = rf."rubberFarmId"
        LEFT JOIN "Farmer" f
        ON rf."farmerId" = f."farmerId"

        WHERE com."committeeId" = $1
    `;  
        return this.executeAggregation(sql, [committeeId]);
    }
}
