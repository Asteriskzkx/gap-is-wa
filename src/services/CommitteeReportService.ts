import { prisma } from "@/utils/db";
import {
  Auditor,
  Certificate,
  Farmer,
  Inspection,
  InspectionTypeMaster,
  RubberFarm,
  User,
} from "@prisma/client";

// ==================== Interfaces ====================

// Certificate Report
export interface CertificateStats {
  totalCertificates: number;
  activeCertificates: number;
  expiredCertificates: number;
  cancelRequested: number;
}

export interface ExpiringCertificate {
  certificateId: number;
  farmerName: string;
  farmLocation: string;
  province: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

export interface CertificateExpiryAlerts {
  expiring30Days: ExpiringCertificate[];
  expiring60Days: ExpiringCertificate[];
  expiring90Days: ExpiringCertificate[];
}

// Inspection Report
export interface InspectionStats {
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
  passed: number;
  failed: number;
}

export interface InspectionByStatus {
  status: string;
  count: number;
}

// Auditor Performance
export interface AuditorPerformance {
  auditorId: number;
  auditorName: string;
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  pendingInspections: number;
  passRate: number;
}

// My Committee Stats (for current logged-in committee)
export interface MyCommitteeStats {
  committeeName: string;
  totalCertificatesIssued: number;
  certificatesThisMonth: number;
  certificatesThisYear: number;
  recentCertificates: {
    certificateId: number;
    farmerName: string;
    farmLocation: string;
    province: string;
    effectiveDate: string;
    expiryDate: string;
  }[];
  monthlyIssuance: {
    month: string;
    count: number;
  }[];
}

// Summary
export interface CommitteeReportSummary {
  certificateStats: CertificateStats;
  certificateExpiryAlerts: CertificateExpiryAlerts;
  inspectionStats: InspectionStats;
  inspectionsByType: InspectionByType[];
  inspectionsByStatus: InspectionByStatus[];
  auditorPerformances: AuditorPerformance[];
  myCommitteeStats?: MyCommitteeStats;
}

// Type definitions for Prisma queries
type CertificateWithInspection = Certificate & {
  inspection: Inspection & {
    rubberFarm: RubberFarm & {
      farmer: Farmer & {
        user: User;
      };
    };
  };
};

type InspectionWithType = Inspection & {
  inspectionType: InspectionTypeMaster;
  auditorChief: Auditor;
};

type AuditorWithInspections = Auditor & {
  user: User;
  inspectionsAsChief: Inspection[];
};

// ==================== Service ====================

export class CommitteeReportService {
  /**
   * Get comprehensive report data for committee
   */
  static async getCommitteeReport(
    startDate?: Date,
    endDate?: Date,
    userId?: number
  ): Promise<CommitteeReportSummary> {
    const now = new Date();

    // Build date filter for inspections
    const dateFilter: { inspectionDateAndTime?: { gte?: Date; lte?: Date } } =
      {};
    if (startDate || endDate) {
      dateFilter.inspectionDateAndTime = {};
      if (startDate) {
        dateFilter.inspectionDateAndTime.gte = startDate;
      }
      if (endDate) {
        // Set to end of day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        dateFilter.inspectionDateAndTime.lte = endOfDay;
      }
    }

    // ==================== Certificate Stats ====================
    const [
      totalCertificates,
      activeCertificates,
      expiredCertificates,
      cancelRequested,
    ] = await Promise.all([
      prisma.certificate.count(),
      prisma.certificate.count({
        where: {
          activeFlag: true,
          expiryDate: { gte: now },
        },
      }),
      prisma.certificate.count({
        where: {
          expiryDate: { lt: now },
        },
      }),
      prisma.certificate.count({
        where: {
          cancelRequestFlag: true,
        },
      }),
    ]);

    const certificateStats: CertificateStats = {
      totalCertificates,
      activeCertificates,
      expiredCertificates,
      cancelRequested,
    };

    // ==================== Certificate Expiry Alerts ====================
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);

    const in60Days = new Date(now);
    in60Days.setDate(in60Days.getDate() + 60);

    const in90Days = new Date(now);
    in90Days.setDate(in90Days.getDate() + 90);

    // Get certificates expiring within 90 days
    const expiringCertificates: CertificateWithInspection[] =
      await prisma.certificate.findMany({
        where: {
          activeFlag: true,
          expiryDate: {
            gte: now,
            lte: in90Days,
          },
        },
        include: {
          inspection: {
            include: {
              rubberFarm: {
                include: {
                  farmer: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          expiryDate: "asc",
        },
      });

    const mapExpiringCertificate = (
      cert: CertificateWithInspection
    ): ExpiringCertificate => {
      const farm = cert.inspection.rubberFarm;
      const farmer = farm.farmer;
      const daysUntilExpiry = Math.ceil(
        (cert.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        certificateId: cert.certificateId,
        farmerName: `${farmer.firstName} ${farmer.lastName}`,
        farmLocation: `หมู่ ${farm.moo} ${farm.villageName}`,
        province: farm.province,
        expiryDate: cert.expiryDate.toISOString(),
        daysUntilExpiry,
      };
    };

    const certificateExpiryAlerts: CertificateExpiryAlerts = {
      expiring30Days: expiringCertificates
        .filter((c: CertificateWithInspection) => c.expiryDate <= in30Days)
        .map(mapExpiringCertificate),
      expiring60Days: expiringCertificates
        .filter(
          (c: CertificateWithInspection) =>
            c.expiryDate > in30Days && c.expiryDate <= in60Days
        )
        .map(mapExpiringCertificate),
      expiring90Days: expiringCertificates
        .filter(
          (c: CertificateWithInspection) =>
            c.expiryDate > in60Days && c.expiryDate <= in90Days
        )
        .map(mapExpiringCertificate),
    };

    // ==================== Inspection Stats ====================
    const inspections: InspectionWithType[] = await prisma.inspection.findMany({
      where: dateFilter,
      include: {
        inspectionType: true,
        auditorChief: true,
      },
    });

    const totalInspections = inspections.length;
    const passedInspections = inspections.filter(
      (i: InspectionWithType) =>
        i.inspectionResult === "ผ่าน" || i.inspectionResult === "PASSED"
    ).length;
    const failedInspections = inspections.filter(
      (i: InspectionWithType) =>
        i.inspectionResult === "ไม่ผ่าน" || i.inspectionResult === "FAILED"
    ).length;
    const pendingInspections = inspections.filter(
      (i: InspectionWithType) =>
        !i.inspectionResult || i.inspectionResult === ""
    ).length;

    const completedInspections = passedInspections + failedInspections;
    const passRate =
      completedInspections > 0
        ? Math.round((passedInspections / completedInspections) * 100)
        : 0;

    const inspectionStats: InspectionStats = {
      totalInspections,
      passedInspections,
      failedInspections,
      pendingInspections,
      passRate,
    };

    // ==================== Inspections By Type ====================
    const typeMap = new Map<number, InspectionByType>();

    for (const inspection of inspections) {
      const typeId = inspection.inspectionTypeId;
      const typeName = inspection.inspectionType.typeName;

      if (!typeMap.has(typeId)) {
        typeMap.set(typeId, {
          typeId,
          typeName,
          count: 0,
          passed: 0,
          failed: 0,
        });
      }

      const typeData = typeMap.get(typeId)!;
      typeData.count++;

      if (
        inspection.inspectionResult === "ผ่าน" ||
        inspection.inspectionResult === "PASSED"
      ) {
        typeData.passed++;
      } else if (
        inspection.inspectionResult === "ไม่ผ่าน" ||
        inspection.inspectionResult === "FAILED"
      ) {
        typeData.failed++;
      }
    }

    const inspectionsByType = Array.from(typeMap.values());

    // ==================== Inspections By Status ====================
    const statusMap = new Map<string, number>();

    for (const inspection of inspections) {
      const status = inspection.inspectionStatus || "ไม่ระบุ";
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    }

    const inspectionsByStatus: InspectionByStatus[] = Array.from(
      statusMap.entries()
    ).map(([status, count]) => ({ status, count }));

    // ==================== Auditor Performance ====================
    const auditors: AuditorWithInspections[] = await prisma.auditor.findMany({
      include: {
        user: true,
        inspectionsAsChief: {
          where: dateFilter,
        },
      },
    });

    const auditorPerformances: AuditorPerformance[] = auditors
      .map((auditor: AuditorWithInspections) => {
        const auditorInspections = auditor.inspectionsAsChief;
        const total = auditorInspections.length;
        const passed = auditorInspections.filter(
          (i: Inspection) =>
            i.inspectionResult === "ผ่าน" || i.inspectionResult === "PASSED"
        ).length;
        const failed = auditorInspections.filter(
          (i: Inspection) =>
            i.inspectionResult === "ไม่ผ่าน" || i.inspectionResult === "FAILED"
        ).length;
        const pending = auditorInspections.filter(
          (i: Inspection) =>
            !i.inspectionResult ||
            i.inspectionResult === "" ||
            i.inspectionResult === "รอการตรวจประเมิน"
        ).length;

        const completed = passed + failed;
        const rate = completed > 0 ? Math.round((passed / completed) * 100) : 0;

        return {
          auditorId: auditor.auditorId,
          auditorName: `${auditor.namePrefix}${auditor.firstName} ${auditor.lastName}`,
          totalInspections: total,
          passedInspections: passed,
          failedInspections: failed,
          pendingInspections: pending,
          passRate: rate,
        };
      })
      .filter((a: AuditorPerformance) => a.totalInspections > 0)
      .sort(
        (a: AuditorPerformance, b: AuditorPerformance) =>
          b.totalInspections - a.totalInspections
      );

    // ==================== My Committee Stats ====================
    let myCommitteeStats: MyCommitteeStats | undefined;

    if (userId) {
      const committee = await prisma.committee.findUnique({
        where: { userId },
        include: {
          committeeCertificates: {
            include: {
              certificate: {
                include: {
                  inspection: {
                    include: {
                      rubberFarm: {
                        include: {
                          farmer: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (committee) {
        const allCertificates = committee.committeeCertificates;
        const totalCertificatesIssued = allCertificates.length;

        // This month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const certificatesThisMonth = allCertificates.filter(
          (cc) => cc.createdAt >= startOfMonth
        ).length;

        // This year
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const certificatesThisYear = allCertificates.filter(
          (cc) => cc.createdAt >= startOfYear
        ).length;

        // Recent certificates (last 10)
        const recentCertificates = allCertificates.slice(0, 10).map((cc) => {
          const cert = cc.certificate;
          const farm = cert.inspection.rubberFarm;
          const farmer = farm.farmer;
          return {
            certificateId: cert.certificateId,
            farmerName: `${farmer.firstName} ${farmer.lastName}`,
            farmLocation: `หมู่ ${farm.moo} ${farm.villageName}`,
            province: farm.province,
            effectiveDate: cert.effectiveDate.toISOString(),
            expiryDate: cert.expiryDate.toISOString(),
          };
        });

        // Monthly issuance (last 12 months)
        const monthlyIssuance: { month: string; count: number }[] = [];
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const nextMonthDate = new Date(
            now.getFullYear(),
            now.getMonth() - i + 1,
            1
          );
          const count = allCertificates.filter(
            (cc) => cc.createdAt >= monthDate && cc.createdAt < nextMonthDate
          ).length;
          const monthName = monthDate.toLocaleDateString("th-TH", {
            month: "short",
            year: "2-digit",
          });
          monthlyIssuance.push({ month: monthName, count });
        }

        myCommitteeStats = {
          committeeName: `${committee.namePrefix}${committee.firstName} ${committee.lastName}`,
          totalCertificatesIssued,
          certificatesThisMonth,
          certificatesThisYear,
          recentCertificates,
          monthlyIssuance,
        };
      }
    }

    return {
      certificateStats,
      certificateExpiryAlerts,
      inspectionStats,
      inspectionsByType,
      inspectionsByStatus,
      auditorPerformances,
      myCommitteeStats,
    };
  }
}
