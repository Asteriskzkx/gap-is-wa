import { prisma } from "@/utils/db";

// Interfaces
export interface MyInspectionStats {
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  pendingInspections: number;
  passRate: number;
}

export interface InspectionByType {
  typeId: number;
  typeName: string;
  count: number;
}

export interface InspectionByStatus {
  status: string;
  count: number;
}

export interface RecentInspection {
  id: number;
  farmerName: string;
  farmLocation: string;
  province: string;
  inspectionDate: string;
  result: string | null;
  status: string;
}

export interface InspectedFarm {
  rubberFarmId: number;
  farmLocation: string;
  province: string;
  farmerName: string;
  lastInspectionDate: string;
  lastResult: string | null;
  totalInspections: number;
}

export interface AuditorReportSummary {
  stats: MyInspectionStats;
  byType: InspectionByType[];
  byStatus: InspectionByStatus[];
  recentInspections: RecentInspection[];
  inspectedFarms: InspectedFarm[];
}

const formatFarmLocation = (farm: any) => {
  const v = (val: any) =>
    (val || val === 0) && val !== "-" && val !== "" ? val : null;
  return [
    v(farm.villageName),
    v(farm.moo) ? `หมู่ ${farm.moo}` : null,
    v(farm.road),
    v(farm.alley),
    v(farm.subDistrict) ? `ต.${farm.subDistrict}` : null,
    v(farm.district) ? `อ.${farm.district}` : null,
    v(farm.province) ? `จ.${farm.province}` : null,
  ]
    .filter(Boolean)
    .join(" ") || "-";
};

export class AuditorReportService {
  /**
   * Get my inspection stats for the current auditor
   */
  static async getMyInspectionReport(
    userId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditorReportSummary> {
    try {
      // Find auditor by userId
      const auditor = await prisma.auditor.findFirst({
        where: { userId },
      });

      if (!auditor) {
        return {
          stats: {
            totalInspections: 0,
            passedInspections: 0,
            failedInspections: 0,
            pendingInspections: 0,
            passRate: 0,
          },
          byType: [],
          byStatus: [],
          recentInspections: [],
          inspectedFarms: [],
        };
      }

      // Build where clause for date filtering - include both as chief and as team member
      const dateFilter =
        startDate && endDate
          ? {
            inspectionDateAndTime: {
              gte: startDate,
              lte: endDate,
            },
          }
          : {};

      const whereClause = {
        OR: [
          { auditorChiefId: auditor.auditorId },
          { auditorInspections: { some: { auditorId: auditor.auditorId } } },
        ],
        ...dateFilter,
      };

      // Get all inspections for this auditor
      const inspections = await prisma.inspection.findMany({
        where: whereClause,
        include: {
          inspectionType: {
            select: { inspectionTypeId: true, typeName: true },
          },
          rubberFarm: {
            include: {
              farmer: {
                include: {
                  user: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { inspectionDateAndTime: "desc" },
      });

      // Calculate stats
      const totalInspections = inspections.length;
      const passedInspections = inspections.filter(
        (i) => i.inspectionResult === "ผ่าน" || i.inspectionResult === "PASSED"
      ).length;
      const failedInspections = inspections.filter(
        (i) =>
          i.inspectionResult === "ไม่ผ่าน" || i.inspectionResult === "FAILED"
      ).length;
      const pendingInspections = inspections.filter(
        (i) =>
          !i.inspectionResult ||
          i.inspectionResult === "รอผลการตรวจประเมิน" ||
          i.inspectionStatus === "รอการตรวจประเมิน"
      ).length;
      const completedInspections = passedInspections + failedInspections;
      const passRate =
        completedInspections > 0
          ? Math.round((passedInspections / completedInspections) * 100 * 100) /
          100
          : 0;

      const stats: MyInspectionStats = {
        totalInspections,
        passedInspections,
        failedInspections,
        pendingInspections,
        passRate,
      };

      // Group by type
      const typeMap = new Map<number, { typeName: string; count: number }>();
      for (const inspection of inspections) {
        if (inspection.inspectionType) {
          const typeId = inspection.inspectionType.inspectionTypeId;
          const existing = typeMap.get(typeId);
          if (existing) {
            existing.count++;
          } else {
            typeMap.set(typeId, {
              typeName: inspection.inspectionType.typeName,
              count: 1,
            });
          }
        }
      }
      const byType: InspectionByType[] = Array.from(typeMap.entries()).map(
        ([typeId, data]) => ({
          typeId,
          typeName: data.typeName,
          count: data.count,
        })
      );

      // Group by status
      const statusMap = new Map<string, number>();
      for (const inspection of inspections) {
        const status = inspection.inspectionStatus || "ไม่ระบุ";
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      }
      const byStatus: InspectionByStatus[] = Array.from(
        statusMap.entries()
      ).map(([status, count]) => ({
        status,
        count,
      }));

      // Recent inspections (top 10)
      const recentInspections: RecentInspection[] = inspections
        .slice(0, 10)
        .map((i) => ({
          id: i.inspectionId,
          farmerName: i.rubberFarm?.farmer?.user?.name || "ไม่ระบุ",
          farmLocation: formatFarmLocation(i.rubberFarm),
          province: i.rubberFarm?.province || "ไม่ระบุ",
          inspectionDate: i.inspectionDateAndTime?.toISOString() || "",
          result: i.inspectionResult || null,
          status: i.inspectionStatus || "ไม่ระบุ",
        }));

      // Group by farm to get inspected farms list
      const farmMap = new Map<
        number,
        {
          rubberFarmId: number;
          farmLocation: string;
          province: string;
          farmerName: string;
          lastInspectionDate: string;
          lastResult: string | null;
          totalInspections: number;
        }
      >();

      for (const inspection of inspections) {
        const farmId = inspection.rubberFarmId;
        const existing = farmMap.get(farmId);
        if (existing) {
          existing.totalInspections++;
          // Update if this is more recent
          if (
            inspection.inspectionDateAndTime.toISOString() >
            existing.lastInspectionDate
          ) {
            existing.lastInspectionDate =
              inspection.inspectionDateAndTime.toISOString();
            existing.lastResult = inspection.inspectionResult || null;
          }
        } else {
          farmMap.set(farmId, {
            rubberFarmId: farmId,
            farmLocation: formatFarmLocation(inspection.rubberFarm),
            province: inspection.rubberFarm?.province || "ไม่ระบุ",
            farmerName: inspection.rubberFarm?.farmer?.user?.name || "ไม่ระบุ",
            lastInspectionDate:
              inspection.inspectionDateAndTime?.toISOString() || "",
            lastResult: inspection.inspectionResult || null,
            totalInspections: 1,
          });
        }
      }

      const inspectedFarms: InspectedFarm[] = Array.from(farmMap.values()).sort(
        (a, b) => b.lastInspectionDate.localeCompare(a.lastInspectionDate)
      );

      return {
        stats,
        byType,
        byStatus,
        recentInspections,
        inspectedFarms,
      };
    } catch (error) {
      console.error("Error getting my inspection stats:", error);
      throw error;
    }
  }
}
