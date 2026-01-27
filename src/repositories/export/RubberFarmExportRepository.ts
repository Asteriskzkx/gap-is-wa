import { BaseExportRepository } from "../base/BaseExportRepository";

export class RubberFarmExportRepository extends BaseExportRepository {
  async streamAllRubberFarms() {
    const sql = `
        SELECT
        rf."rubberFarmId",
        rf."villageName" || ', ' || rf."moo" || ', ' || rf."alley" || ', ' || rf."road" || ', ' || rf."subDistrict" || ', ' || rf."district" || ', ' || rf."province" AS rubber_farm_location,
        f."phoneNumber",
        pd."areaOfPlot",
        rf."createdAt",
        f."namePrefix" || '' ||f."firstName" || ' ' || f."lastName" AS farmer_name,
        i."inspectionNo",
        i."inspectionDateAndTime",
        i."inspectionStatus",
        i."inspectionResult",
        i."auditorChiefId",
        a."namePrefix" || '' || a."firstName" || ' ' || a."lastName" AS auditor_name



        FROM "RubberFarm" rf
        JOIN "Farmer" f
        ON rf."farmerId" = f."farmerId"
        JOIN "PlantingDetail" pd
        ON pd."rubberFarmId" = rf."rubberFarmId"
        JOIN "Inspection" i
        ON i."rubberFarmId" = rf."rubberFarmId"
        JOIN "Auditor" a
        ON i."auditorChiefId" = a."auditorId"

        ORDER BY rf."rubberFarmId";
    `;
    return this.createQueryStream(sql);
  }
  async getRubberFarmCount(): Promise<number> {
    const result = await this.executeAggregation<{ count: number }>(`
        SELECT COUNT(*)::int AS count FROM "RubberFarm"
    `);
    return result[0]?.count ?? 0;
  }
  async getAllRubberFarms(): Promise<
    {
      rubberFarmId: number;
      rubber_farm_location: string;
      phoneNumber: string;
      areaOfPlot: number;
      createdAt: Date;
      farmer_name: string;
      inspectionNo: string;
      inspectionDateAndTime: Date;
      inspectionStatus: string;
      inspectionResult: string;
      auditorChiefId: number;
      auditor_name: string;
    }[]
  > {
    const sql = `
        SELECT
        rf."rubberFarmId",
        rf."villageName" || ', ' || rf."moo" || ', ' || rf."alley" || ', ' || rf."road" || ', ' || rf."subDistrict" || ', ' || rf."district" || ', ' || rf."province" AS rubber_farm_location,
        f."phoneNumber",
        pd."areaOfPlot",
        rf."createdAt",
        f."namePrefix" || '' ||f."firstName" || ' ' || f."lastName" AS farmer_name,
        i."inspectionNo",
        i."inspectionDateAndTime",
        i."inspectionStatus",
        i."inspectionResult",
        i."auditorChiefId",
        a."namePrefix" || '' || a."firstName" || ' ' || a."lastName" AS auditor_name


        FROM "RubberFarm" rf
        JOIN "Farmer" f
        ON rf."farmerId" = f."farmerId"
        JOIN "PlantingDetail" pd
        ON pd."rubberFarmId" = rf."rubberFarmId"
        JOIN "Inspection" i
        ON i."rubberFarmId" = rf."rubberFarmId"
        JOIN "Auditor" a
        ON i."auditorChiefId" = a."auditorId"

        ORDER BY rf."rubberFarmId";
    `;
    return this.executeAggregation(sql);
  }
}
