import { prisma } from "@/utils/db";
import { UserRole } from "@prisma/client";

export interface UserCountByRole {
  role: UserRole;
  count: number;
}

export interface UserReportSummary {
  totalUsers: number;
  countByRole: UserCountByRole[];
}

export interface NewUsersByDateAndRole {
  date: string;
  counts: Record<UserRole, number>;
}

export interface NewUsersTimeSeriesReport {
  data: NewUsersByDateAndRole[];
  roles: UserRole[];
  granularity: "hour" | "day" | "week" | "month" | "year";
}

export type TimeGranularity = "hour" | "day" | "week" | "month" | "year";

// Inspection Report Interfaces
export interface InspectionStatusCount {
  status: string;
  count: number;
}

export interface InspectionResultCount {
  result: string;
  count: number;
}

export interface InspectionTypeCount {
  typeId: number;
  typeName: string;
  count: number;
}

export interface InspectionReportSummary {
  totalInspections: number;
  byStatus: InspectionStatusCount[];
  byResult: InspectionResultCount[];
  byType: InspectionTypeCount[];
}

// Rubber Farm Report Interfaces
export interface RubberFarmProvinceCount {
  province: string;
  count: number;
  totalArea: number;
}

export interface RubberFarmReportSummary {
  totalFarms: number;
  totalArea: number;
  byProvince: RubberFarmProvinceCount[];
  byDistributionType: { type: string; count: number }[];
}

// Certificate Report Interfaces
export interface CertificateStatusCount {
  status: string;
  count: number;
}

export interface CertificateReportSummary {
  totalCertificates: number;
  activeCertificates: number;
  expiredCertificates: number;
  expiringIn30Days: number;
  expiringIn60Days: number;
  expiringIn90Days: number;
  cancelRequested: number;
  byStatus: CertificateStatusCount[];
}

// Auditor Performance Interfaces
export interface AuditorPerformance {
  auditorId: number;
  auditorName: string;
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  passRate: number;
}

export interface AuditorPerformanceReport {
  auditors: AuditorPerformance[];
  totalInspections: number;
  averagePassRate: number;
}

export class AdminReportService {
  /**
   * Get the earliest user creation date
   */
  async getEarliestUserDate(): Promise<Date | null> {
    try {
      const user = await prisma.user.findFirst({
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      });
      return user?.createdAt || null;
    } catch (error) {
      console.error("Error getting earliest user date:", error);
      return null;
    }
  }

  /**
   * Get total user count in the system
   */
  async getTotalUserCount(): Promise<number> {
    try {
      return await prisma.user.count();
    } catch (error) {
      console.error("Error getting total user count:", error);
      throw error;
    }
  }

  /**
   * Get user count grouped by role
   */
  async getUserCountByRole(): Promise<UserCountByRole[]> {
    try {
      const roles = Object.values(UserRole);
      const counts = await Promise.all(
        roles.map(async (role) => {
          const count = await prisma.user.count({
            where: { role },
          });
          return { role, count };
        })
      );
      return counts;
    } catch (error) {
      console.error("Error getting user count by role:", error);
      throw error;
    }
  }

  /**
   * Get complete user report summary including total and breakdown by role
   */
  async getUserReportSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<UserReportSummary> {
    try {
      const whereClause = startDate && endDate
        ? { createdAt: { gte: startDate, lte: endDate } }
        : {};

      const roles = Object.values(UserRole);
      const [totalUsers, ...roleCounts] = await Promise.all([
        prisma.user.count({ where: whereClause }),
        ...roles.map(async (role) => {
          const count = await prisma.user.count({
            where: { ...whereClause, role },
          });
          return { role, count };
        }),
      ]);

      return {
        totalUsers,
        countByRole: roleCounts,
      };
    } catch (error) {
      console.error("Error getting user report summary:", error);
      throw error;
    }
  }

  /**
   * Get new users time series by date range, grouped by role
   * Granularity is determined by the date range:
   * - <= 1 day: hourly
   * - < 7 days: daily
   * - >= 7 days and < 1 month: weekly
   * - >= 1 month and < 1 year: monthly
   * - >= 1 year: yearly
   */
  async getNewUsersByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<NewUsersTimeSeriesReport> {
    try {
      const roles = Object.values(UserRole);
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      // Determine granularity
      let granularity: TimeGranularity;
      if (diffDays <= 1) {
        granularity = "hour";
      } else if (diffDays < 7) {
        granularity = "day";
      } else if (diffDays < 30) {
        granularity = "week";
      } else if (diffDays < 365) {
        granularity = "month";
      } else {
        granularity = "year";
      }

      // Fetch all users created within the date range
      const users = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          createdAt: true,
          role: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Group users based on granularity
      const dataMap = new Map<string, Record<UserRole, number>>();

      // Initialize time periods based on granularity
      this.initializeTimePeriods(dataMap, startDate, endDate, granularity, roles);

      // Count users per period and role
      users.forEach((user) => {
        const key = this.getTimeKey(user.createdAt, granularity, startDate);
        const roleCounts = dataMap.get(key);
        if (roleCounts) {
          roleCounts[user.role]++;
        }
      });

      // Convert to array
      const data: NewUsersByDateAndRole[] = [];
      dataMap.forEach((counts, date) => {
        data.push({ date, counts });
      });

      return {
        data,
        roles,
        granularity,
      };
    } catch (error) {
      console.error("Error getting new users by date range:", error);
      throw error;
    }
  }

  /**
   * Initialize time periods in the map based on granularity
   */
  private initializeTimePeriods(
    dataMap: Map<string, Record<UserRole, number>>,
    startDate: Date,
    endDate: Date,
    granularity: TimeGranularity,
    roles: UserRole[]
  ): void {
    const createEmptyRoleCounts = (): Record<UserRole, number> => {
      const counts = {} as Record<UserRole, number>;
      roles.forEach((role) => {
        counts[role] = 0;
      });
      return counts;
    };

    const currentDate = new Date(startDate);

    switch (granularity) {
      case "hour":
        while (currentDate <= endDate) {
          const key = `${currentDate.toISOString().split("T")[0]} ${String(currentDate.getHours()).padStart(2, "0")}:00`;
          dataMap.set(key, createEmptyRoleCounts());
          currentDate.setHours(currentDate.getHours() + 1);
        }
        break;

      case "day":
        while (currentDate <= endDate) {
          const key = currentDate.toISOString().split("T")[0];
          dataMap.set(key, createEmptyRoleCounts());
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;

      case "week":
        // Start from the beginning of the week containing startDate
        const weekStart = new Date(startDate);
        while (weekStart <= endDate) {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          if (weekEnd > endDate) {
            weekEnd.setTime(endDate.getTime());
          }
          const key = this.formatWeekLabel(weekStart, weekEnd);
          dataMap.set(key, createEmptyRoleCounts());
          weekStart.setDate(weekStart.getDate() + 7);
        }
        break;

      case "month":
        currentDate.setDate(1); // Start from first of month
        while (currentDate <= endDate) {
          const key = this.formatMonthLabel(currentDate);
          dataMap.set(key, createEmptyRoleCounts());
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        break;

      case "year":
        currentDate.setMonth(0, 1); // Start from Jan 1
        while (currentDate <= endDate) {
          const key = this.formatYearLabel(currentDate);
          dataMap.set(key, createEmptyRoleCounts());
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
        break;
    }
  }

  /**
   * Get the time key for a given date based on granularity
   */
  private getTimeKey(
    date: Date,
    granularity: TimeGranularity,
    rangeStartDate: Date
  ): string {
    switch (granularity) {
      case "hour":
        return `${date.toISOString().split("T")[0]} ${String(date.getHours()).padStart(2, "0")}:00`;

      case "day":
        return date.toISOString().split("T")[0];

      case "week":
        // Find which week this date belongs to
        const diffDays = Math.floor(
          (date.getTime() - rangeStartDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const weekIndex = Math.floor(diffDays / 7);
        const weekStart = new Date(rangeStartDate);
        weekStart.setDate(weekStart.getDate() + weekIndex * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return this.formatWeekLabel(weekStart, weekEnd);

      case "month":
        return this.formatMonthLabel(date);

      case "year":
        return this.formatYearLabel(date);
    }
  }

  /**
   * Format week label in Thai format
   */
  private formatWeekLabel(start: Date, end: Date): string {
    const thaiMonths = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
    ];
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = thaiMonths[start.getMonth()];
    const endMonth = thaiMonths[end.getMonth()];
    const startYear = start.getFullYear() + 543;
    const endYear = end.getFullYear() + 543;

    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${startDay}-${endDay} ${startMonth} ${startYear}`;
    } else if (start.getFullYear() === end.getFullYear()) {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
    } else {
      return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
    }
  }

  /**
   * Format month label in Thai format
   */
  private formatMonthLabel(date: Date): string {
    const thaiMonths = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
    ];
    return `${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
  }

  /**
   * Format year label in Thai format
   */
  private formatYearLabel(date: Date): string {
    return `${date.getFullYear() + 543}`;
  }

  // ==================== INSPECTION REPORTS ====================

  /**
   * Get inspection report summary
   */
  async getInspectionReportSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<InspectionReportSummary> {
    try {
      const whereClause = startDate && endDate
        ? { inspectionDateAndTime: { gte: startDate, lte: endDate } }
        : {};

      // Get total inspections
      const totalInspections = await prisma.inspection.count({ where: whereClause });

      // Group by status
      const statusGroups = await prisma.inspection.groupBy({
        by: ["inspectionStatus"],
        where: whereClause,
        _count: { inspectionId: true },
      });

      const byStatus: InspectionStatusCount[] = statusGroups.map((g) => ({
        status: g.inspectionStatus,
        count: g._count.inspectionId,
      }));

      // Group by result
      const resultGroups = await prisma.inspection.groupBy({
        by: ["inspectionResult"],
        where: whereClause,
        _count: { inspectionId: true },
      });

      const byResult: InspectionResultCount[] = resultGroups.map((g) => ({
        result: g.inspectionResult,
        count: g._count.inspectionId,
      }));

      // Group by type
      const inspections = await prisma.inspection.findMany({
        where: whereClause,
        include: { inspectionType: true },
      });

      const typeMap = new Map<number, { typeName: string; count: number }>();
      inspections.forEach((insp) => {
        const typeId = insp.inspectionTypeId;
        const typeName = insp.inspectionType.typeName;
        if (typeMap.has(typeId)) {
          typeMap.get(typeId)!.count++;
        } else {
          typeMap.set(typeId, { typeName, count: 1 });
        }
      });

      const byType: InspectionTypeCount[] = Array.from(typeMap.entries()).map(
        ([typeId, data]) => ({
          typeId,
          typeName: data.typeName,
          count: data.count,
        })
      );

      return {
        totalInspections,
        byStatus,
        byResult,
        byType,
      };
    } catch (error) {
      console.error("Error getting inspection report summary:", error);
      throw error;
    }
  }

  // ==================== RUBBER FARM REPORTS ====================

  /**
   * Get rubber farm report summary
   */
  async getRubberFarmReportSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<RubberFarmReportSummary> {
    try {
      const whereClause = startDate && endDate
        ? { createdAt: { gte: startDate, lte: endDate } }
        : {};

      // Get all rubber farms with planting details
      const farms = await prisma.rubberFarm.findMany({
        where: whereClause,
        include: { plantingDetails: true },
      });

      const totalFarms = farms.length;

      // Calculate total area
      let totalArea = 0;
      farms.forEach((farm) => {
        farm.plantingDetails.forEach((detail) => {
          totalArea += detail.areaOfPlot;
        });
      });

      // Group by province
      const provinceMap = new Map<string, { count: number; area: number }>();
      farms.forEach((farm) => {
        const province = farm.province || "ไม่ระบุ";
        let farmArea = 0;
        farm.plantingDetails.forEach((detail) => {
          farmArea += detail.areaOfPlot;
        });

        if (provinceMap.has(province)) {
          const data = provinceMap.get(province)!;
          data.count++;
          data.area += farmArea;
        } else {
          provinceMap.set(province, { count: 1, area: farmArea });
        }
      });

      const byProvince: RubberFarmProvinceCount[] = Array.from(provinceMap.entries())
        .map(([province, data]) => ({
          province,
          count: data.count,
          totalArea: Math.round(data.area * 100) / 100,
        }))
        .sort((a, b) => b.count - a.count);

      // Group by distribution type
      const distributionMap = new Map<string, number>();
      farms.forEach((farm) => {
        const type = farm.productDistributionType || "ไม่ระบุ";
        distributionMap.set(type, (distributionMap.get(type) || 0) + 1);
      });

      const byDistributionType = Array.from(distributionMap.entries()).map(
        ([type, count]) => ({ type, count })
      );

      return {
        totalFarms,
        totalArea: Math.round(totalArea * 100) / 100,
        byProvince,
        byDistributionType,
      };
    } catch (error) {
      console.error("Error getting rubber farm report summary:", error);
      throw error;
    }
  }

  // ==================== CERTIFICATE REPORTS ====================

  /**
   * Get certificate report summary
   */
  async getCertificateReportSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<CertificateReportSummary> {
    try {
      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
      const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const whereClause = startDate && endDate
        ? { createdAt: { gte: startDate, lte: endDate } }
        : {};

      // Total certificates
      const totalCertificates = await prisma.certificate.count({ where: whereClause });

      // Active certificates
      const activeCertificates = await prisma.certificate.count({
        where: {
          ...whereClause,
          activeFlag: true,
          expiryDate: { gte: now },
        },
      });

      // Expired certificates
      const expiredCertificates = await prisma.certificate.count({
        where: {
          ...whereClause,
          expiryDate: { lt: now },
        },
      });

      // Expiring in 30 days
      const expiringIn30Days = await prisma.certificate.count({
        where: {
          ...whereClause,
          activeFlag: true,
          expiryDate: { gte: now, lte: in30Days },
        },
      });

      // Expiring in 60 days
      const expiringIn60Days = await prisma.certificate.count({
        where: {
          ...whereClause,
          activeFlag: true,
          expiryDate: { gte: now, lte: in60Days },
        },
      });

      // Expiring in 90 days
      const expiringIn90Days = await prisma.certificate.count({
        where: {
          ...whereClause,
          activeFlag: true,
          expiryDate: { gte: now, lte: in90Days },
        },
      });

      // Cancel requested
      const cancelRequested = await prisma.certificate.count({
        where: {
          ...whereClause,
          cancelRequestFlag: true,
        },
      });

      // Build status breakdown
      const byStatus: CertificateStatusCount[] = [
        { status: "ใช้งานอยู่", count: activeCertificates },
        { status: "หมดอายุแล้ว", count: expiredCertificates },
        { status: "ขอยกเลิก", count: cancelRequested },
      ];

      return {
        totalCertificates,
        activeCertificates,
        expiredCertificates,
        expiringIn30Days,
        expiringIn60Days,
        expiringIn90Days,
        cancelRequested,
        byStatus,
      };
    } catch (error) {
      console.error("Error getting certificate report summary:", error);
      throw error;
    }
  }

  // ==================== AUDITOR PERFORMANCE REPORTS ====================

  /**
   * Get auditor performance report
   */
  async getAuditorPerformanceReport(
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditorPerformanceReport> {
    try {
      const dateFilter = startDate && endDate ? {
        inspectionDateAndTime: { gte: startDate, lte: endDate },
      } : {};

      // Get all auditors with their inspections (both as chief and as team member)
      const auditors = await prisma.auditor.findMany({
        include: {
          user: { select: { name: true } },
          inspectionsAsChief: {
            where: dateFilter,
            select: {
              inspectionId: true,
              inspectionResult: true,
            },
          },
          auditorInspections: {
            where: {
              inspection: dateFilter,
            },
            select: {
              inspection: {
                select: {
                  inspectionId: true,
                  inspectionResult: true,
                },
              },
            },
          },
        },
      });

      const auditorPerformances: AuditorPerformance[] = auditors.map((auditor) => {
        // Combine inspections from both sources, removing duplicates by inspectionId
        const inspectionMap = new Map<number, string>();

        // Add inspections as chief
        auditor.inspectionsAsChief.forEach((i) => {
          inspectionMap.set(i.inspectionId, i.inspectionResult);
        });

        // Add inspections as team member (won't overwrite if already exists)
        auditor.auditorInspections.forEach((ai) => {
          if (!inspectionMap.has(ai.inspection.inspectionId)) {
            inspectionMap.set(ai.inspection.inspectionId, ai.inspection.inspectionResult);
          }
        });

        const allInspections = Array.from(inspectionMap.values());
        const totalInspections = allInspections.length;
        const passedInspections = allInspections.filter(
          (result) => result === "ผ่าน" || result === "PASSED"
        ).length;
        const failedInspections = allInspections.filter(
          (result) => result === "ไม่ผ่าน" || result === "FAILED"
        ).length;
        const passRate = totalInspections > 0
          ? Math.round((passedInspections / totalInspections) * 100 * 100) / 100
          : 0;

        return {
          auditorId: auditor.auditorId,
          auditorName: auditor.user.name,
          totalInspections,
          passedInspections,
          failedInspections,
          passRate,
        };
      });

      // Filter to only show auditors with inspections
      const activeAuditors = auditorPerformances.filter((a) => a.totalInspections > 0);

      const totalInspections = activeAuditors.reduce((sum, a) => sum + a.totalInspections, 0);
      const averagePassRate = activeAuditors.length > 0
        ? Math.round(
          (activeAuditors.reduce((sum, a) => sum + a.passRate, 0) / activeAuditors.length) * 100
        ) / 100
        : 0;

      return {
        auditors: activeAuditors.sort((a, b) => b.totalInspections - a.totalInspections),
        totalInspections,
        averagePassRate,
      };
    } catch (error) {
      console.error("Error getting auditor performance report:", error);
      throw error;
    }
  }

  // ==================== PAGINATED REPORTS ====================

  /**
   * Get rubber farm provinces with pagination (for table display)
   */
  async getRubberFarmProvincePaginated(options: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    results: RubberFarmProvinceCount[];
    paginator: { limit: number; offset: number; total: number };
  }> {
    try {
      const { limit = 10, offset = 0, startDate, endDate } = options;

      const whereClause = startDate && endDate
        ? { createdAt: { gte: startDate, lte: endDate } }
        : {};

      // Get all rubber farms with planting details
      const farms = await prisma.rubberFarm.findMany({
        where: whereClause,
        include: { plantingDetails: true },
      });

      // Group by province
      const provinceMap = new Map<string, { count: number; area: number }>();
      farms.forEach((farm) => {
        const province = farm.province || "ไม่ระบุ";
        let farmArea = 0;
        farm.plantingDetails.forEach((detail) => {
          farmArea += detail.areaOfPlot;
        });

        if (provinceMap.has(province)) {
          const data = provinceMap.get(province)!;
          data.count++;
          data.area += farmArea;
        } else {
          provinceMap.set(province, { count: 1, area: farmArea });
        }
      });

      const allProvinces: RubberFarmProvinceCount[] = Array.from(provinceMap.entries())
        .map(([province, data]) => ({
          province,
          count: data.count,
          totalArea: Math.round(data.area * 100) / 100,
        }))
        .sort((a, b) => b.count - a.count);

      const total = allProvinces.length;
      const paginatedResults = allProvinces.slice(offset, offset + limit);

      return {
        results: paginatedResults,
        paginator: { limit, offset, total },
      };
    } catch (error) {
      console.error("Error getting rubber farm province paginated:", error);
      throw error;
    }
  }

  /**
   * Get auditor performance with pagination (for table display)
   */
  async getAuditorPerformancePaginated(options: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    results: AuditorPerformance[];
    paginator: { limit: number; offset: number; total: number };
    summary: { totalInspections: number; averagePassRate: number; totalAuditors: number };
  }> {
    try {
      const { limit = 10, offset = 0, startDate, endDate } = options;

      const dateFilter = startDate && endDate ? {
        inspectionDateAndTime: { gte: startDate, lte: endDate },
      } : {};

      // Get all auditors with their inspections (both as chief and as team member)
      const auditors = await prisma.auditor.findMany({
        include: {
          user: { select: { name: true } },
          inspectionsAsChief: {
            where: dateFilter,
            select: {
              inspectionId: true,
              inspectionResult: true,
            },
          },
          auditorInspections: {
            where: {
              inspection: dateFilter,
            },
            select: {
              inspection: {
                select: {
                  inspectionId: true,
                  inspectionResult: true,
                },
              },
            },
          },
        },
      });

      const auditorPerformances: AuditorPerformance[] = auditors.map((auditor) => {
        // Combine inspections from both sources, removing duplicates by inspectionId
        const inspectionMap = new Map<number, string>();

        // Add inspections as chief
        auditor.inspectionsAsChief.forEach((i) => {
          inspectionMap.set(i.inspectionId, i.inspectionResult);
        });

        // Add inspections as team member (won't overwrite if already exists)
        auditor.auditorInspections.forEach((ai) => {
          if (!inspectionMap.has(ai.inspection.inspectionId)) {
            inspectionMap.set(ai.inspection.inspectionId, ai.inspection.inspectionResult);
          }
        });

        const allInspections = Array.from(inspectionMap.values());
        const totalInspections = allInspections.length;
        const passedInspections = allInspections.filter(
          (result) => result === "ผ่าน" || result === "PASSED"
        ).length;
        const failedInspections = allInspections.filter(
          (result) => result === "ไม่ผ่าน" || result === "FAILED"
        ).length;
        const passRate = totalInspections > 0
          ? Math.round((passedInspections / totalInspections) * 100 * 100) / 100
          : 0;

        return {
          auditorId: auditor.auditorId,
          auditorName: auditor.user.name,
          totalInspections,
          passedInspections,
          failedInspections,
          passRate,
        };
      });

      // Filter to only show auditors with inspections and sort
      const activeAuditors = auditorPerformances
        .filter((a) => a.totalInspections > 0)
        .sort((a, b) => b.totalInspections - a.totalInspections);

      // Calculate summary
      const totalInspections = activeAuditors.reduce((sum, a) => sum + a.totalInspections, 0);
      const averagePassRate = activeAuditors.length > 0
        ? Math.round(
          (activeAuditors.reduce((sum, a) => sum + a.passRate, 0) / activeAuditors.length) * 100
        ) / 100
        : 0;

      // Apply pagination
      const total = activeAuditors.length;
      const paginatedResults = activeAuditors.slice(offset, offset + limit);

      return {
        results: paginatedResults,
        paginator: { limit, offset, total },
        summary: { totalInspections, averagePassRate, totalAuditors: total },
      };
    } catch (error) {
      console.error("Error getting auditor performance paginated:", error);
      throw error;
    }
  }
}
