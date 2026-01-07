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
}
