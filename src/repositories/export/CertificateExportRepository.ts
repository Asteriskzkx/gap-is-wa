import { BaseExportRepository } from "../base/BaseExportRepository";

export class CertificateExportRepository extends BaseExportRepository {
    // Add methods for exporting certificate data as needed
    async streamAllCertificates() {
       const sql = `
        SELECT
            c."certificateId",  
            c."inspectionId",
            a."namePrefix" || '' ||a."firstName" || ' ' || a."lastName" AS auditor_name,
            com."namePrefix" || '' ||com."firstName" || ' ' || com."lastName" AS committee_name,
            f."namePrefix" || '' ||f."firstName" || ' ' || f."lastName" AS farmer_name,
            rf."villageName" || ', ' || rf."moo" || ', ' || rf."road" || ', ' || rf."alley" || ', ' || rf."subDistrict" || ', ' || rf."district" || ', ' || rf."province" AS location,
            c."effectiveDate",
            c."expiryDate",
            c."activeFlag",
            c."cancelRequestFlag",
            c."cancelRequestDetail"
        FROM "Certificate" c
        JOIN "Inspection" i
        ON c."inspectionId" = i."inspectionId"
        JOIN "Auditor" a
        ON a."auditorId" = i."auditorChiefId"
        JOIN "CommitteeCertificate" cc
        ON cc."certificateId" = c."certificateId"
        JOIN "Committee" com
        ON com."committeeId" = cc."committeeId"
        JOIN "RubberFarm" rf
        ON rf."rubberFarmId" = i."rubberFarmId"
        JOIN "Farmer" f
        ON f."farmerId" = rf."farmerId"
        ORDER BY c."certificateId" ;
    `;  
        return this.createQueryStream(sql);
    }   
    async getCertificateCount(): Promise<number> {
        const result = await this.executeAggregation<{ count: number }>(`
        SELECT COUNT(*)::int AS count FROM "Certificate"
    `);
        return result[0]?.count ?? 0;
    }
    async getAllCertificates(): Promise<{
        certificateId: number;
        inspectionId: number;
        expiryDate: Date;
        activeFlag: boolean;
        auditor_name: string;
        committee_name: string;
        farmer_name: string;
        location: string;
        effectiveDate: Date;
        cancelRequestFlag: boolean;
        cancelRequestDetail: string;
    }[]> {      
        const sql = `
        SELECT
            c."certificateId",  
            c."inspectionId",
            a."namePrefix" || '' ||a."firstName" || ' ' || a."lastName" AS auditor_name,
            com."namePrefix" || '' ||com."firstName" || ' ' || com."lastName" AS committee_name,
            f."namePrefix" || '' ||f."firstName" || ' ' || f."lastName" AS farmer_name,
            rf."villageName" || ', ' || rf."moo" || ', ' || rf."road" || ', ' || rf."alley" || ', ' || rf."subDistrict" || ', ' || rf."district" || ', ' || rf."province" AS location,
            c."effectiveDate",
            c."expiryDate",
            c."activeFlag",
            c."cancelRequestFlag",
            c."cancelRequestDetail"
        FROM "Certificate" c
        JOIN "Inspection" i
        ON c."inspectionId" = i."inspectionId"
        JOIN "Auditor" a
        ON a."auditorId" = i."auditorChiefId"
        JOIN "CommitteeCertificate" cc
        ON cc."certificateId" = c."certificateId"
        JOIN "Committee" com
        ON com."committeeId" = cc."committeeId"
        JOIN "RubberFarm" rf
        ON rf."rubberFarmId" = i."rubberFarmId"
        JOIN "Farmer" f
        ON f."farmerId" = rf."farmerId"
        ORDER BY c."certificateId";
    `;  
         return this.executeAggregation(sql);
    }   
}