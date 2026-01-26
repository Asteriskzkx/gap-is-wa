import { BaseExportRepository } from "../base/BaseExportRepository";

export class SpecificAuditorPerformanceExportRepository extends BaseExportRepository {
    // Add methods for exporting specific auditor performance data as needed
    async streamSpecificAuditorPerformance(auditorId:number) {
        const sql = `
        SELECT  
            i."inspectionNo",
            i."inspectionDateAndTime",
            i."inspectionStatus",
            i."inspectionResult",
            itm."typeName" AS inspection_type,
            rf."rubberFarmId",
            f."namePrefix" || '' ||f."firstName" || ' ' || f."lastName" AS farmer_name,
            rf."villageName" || ', ' || rf."moo" || ', ' || rf."road" || ', ' || rf."alley" || ', ' || rf."subDistrict" || ', ' || rf."district" || ', ' || rf."province" AS location,
            f."phoneNumber" AS farmer_phone_number,
            f."mobilePhoneNumber" AS farmer_mobile_phone_number
        FROM "Auditor" a    
        LEFT JOIN "Inspection" i
        ON a."auditorId" = i."auditorChiefId"
        LEFT JOIN "InspectionTypeMaster" itm
        ON i."inspectionTypeId" = itm."inspectionTypeId"
        LEFT JOIN "RubberFarm" rf
        ON i."rubberFarmId" = rf."rubberFarmId"
        LEFT JOIN "Farmer" f
        ON rf."farmerId" = f."farmerId"
        
        WHERE a."auditorId" = $1
        ORDER BY a."auditorId";
    `;      
        return this.createQueryStream(sql,[auditorId]);
    }   
    async getSpecificAuditorPerformanceCount(auditorId: number): Promise<number> {
        const result = await this.executeAggregation<{ count: number }>(`
        SELECT COUNT(*)::int AS count FROM "Auditor" a
        WHERE a."auditorId" = $1
    `,[auditorId]);
        return result[0]?.count ?? 0;
    }
    async getSpecificAuditorPerformance(auditorId:number): Promise<{
        inspectionNo: string;
        inspectionDateAndTime: Date;
        inspectionStatus: string;
        inspectionResult: string;  
        inspection_type: string;
        rubberFarmId: number;
        farmer_name: string;
        location: string;
        farmer_phone_number: string;
        farmer_mobile_phone_number: string;
    }[]> {  
        
         const sql = `
        SELECT  
            i."inspectionNo",
            i."inspectionDateAndTime",
            i."inspectionStatus",
            i."inspectionResult",
            itm."typeName" AS inspection_type,
            rf."rubberFarmId",
            f."namePrefix" || '' ||f."firstName" || ' ' || f."lastName" AS farmer_name,
            rf."villageName" || ', ' || rf."moo" || ', ' || rf."road" || ', ' || rf."alley" || ', ' || rf."subDistrict" || ', ' || rf."district" || ', ' || rf."province" AS location,
            f."phoneNumber" AS farmer_phone_number,
            f."mobilePhoneNumber" AS farmer_mobile_phone_number
        FROM "Auditor" a    
        LEFT JOIN "Inspection" i
        ON a."auditorId" = i."auditorChiefId"
        LEFT JOIN "InspectionTypeMaster" itm
        ON i."inspectionTypeId" = itm."inspectionTypeId"
        LEFT JOIN "RubberFarm" rf
        ON i."rubberFarmId" = rf."rubberFarmId"
        LEFT JOIN "Farmer" f
        ON rf."farmerId" = f."farmerId"
        
        WHERE a."auditorId" = $1
        ORDER BY a."auditorId";
    `;      
        const result =  await this.executeAggregation<{
            inspectionNo: string;
            inspectionDateAndTime: Date;
            inspectionStatus: string;
            inspectionResult: string;  
            inspection_type: string;
            rubberFarmId: number;
            farmer_name: string;
            location: string;
            farmer_phone_number: string;
            farmer_mobile_phone_number: string;
        }>(sql,[auditorId]);
        return result;
    }
}