import { BaseExportRepository } from "../base/BaseExportRepository";

export class InspectionsExportRepository extends BaseExportRepository {
    // Add methods for exporting inspections data as needed

    async streamAllInspections() {
      const sql = `
            SELECT
            i."inspectionNo",
            i."inspectionDateAndTime",
            i."inspectionStatus",
            i."inspectionResult",

            it."typeName" AS inspection_type,

            a."namePrefix" || '' ||a."firstName" || ' ' || a."lastName" AS auditor_name,
            f."namePrefix" || '' ||f."firstName" || ' ' || f."lastName" AS farmer_name,

            rf."villageName" || ', ' || rf."moo" || ', ' || rf."road" || ', ' || rf.alley || ', ' || rf."subDistrict" || ', ' || rf."district" || ', ' || rf."province" AS location,

            c."activeFlag",
            c."expiryDate"

            FROM "Inspection" i
            JOIN "InspectionTypeMaster" it
            ON it."inspectionTypeId" = i."inspectionTypeId"
            JOIN "Auditor" a
            ON a."auditorId" = i."auditorChiefId"
            JOIN "RubberFarm" rf
            ON rf."rubberFarmId" = i."rubberFarmId"
            JOIN "Farmer" f
            ON f."farmerId" = rf."farmerId"
            LEFT JOIN "Certificate" c
            ON c."inspectionId" = i."inspectionId"


            ORDER BY i."inspectionDateAndTime";
        `;
        return this.createQueryStream(sql);
    }

    async getInspectionCount(): Promise<number> {
        const result = await this.executeAggregation<{ count: number }>(`
        SELECT COUNT(*)::int AS count FROM "Inspection"
    `);
        return result[0]?.count ?? 0;
    }

    async getAllInspections(): Promise<{
        inspectionId: number;
        propertyId: number; 
        inspectorId: number;
        date: Date;
        status: string;
    }[]> {
        const sql = `
        SELECT
        i."inspectionNo",
        i."inspectionDateAndTime",
        i."inspectionStatus",
        i."inspectionResult",

        it."typeName" AS inspection_type,

        a."namePrefix" || '' ||a."firstName" || ' ' || a."lastName" AS auditor_name,
        f."namePrefix" || '' ||f."firstName" || ' ' || f."lastName" AS farmer_name,

        rf."villageName" || ', ' || rf."moo" || ', ' || rf."road" || ', ' || rf.alley || ', ' || rf."subDistrict" || ', ' || rf."district" || ', ' || rf."province" AS location,

        c."activeFlag",
        c."expiryDate"

        FROM "Inspection" i
        JOIN "InspectionTypeMaster" it
        ON it."inspectionTypeId" = i."inspectionTypeId"
        JOIN "Auditor" a
        ON a."auditorId" = i."auditorChiefId"
        JOIN "RubberFarm" rf
        ON rf."rubberFarmId" = i."rubberFarmId"
        JOIN "Farmer" f
        ON f."farmerId" = rf."farmerId"
        LEFT JOIN "Certificate" c
        ON c."inspectionId" = i."inspectionId"


        ORDER BY i."inspectionDateAndTime";
    `;
        return this.executeAggregation(sql);
    }
}