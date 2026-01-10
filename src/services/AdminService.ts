import { AdminModel } from "../models/AdminModel";
import { UserModel, UserRole } from "../models/UserModel";
import { AdminRepository } from "../repositories/AdminRepository";
import { AuditLogService } from "./AuditLogService";
import { BaseService } from "./BaseService";
import { UserService } from "./UserService";

export class AdminService extends BaseService<AdminModel> {
  private adminRepository: AdminRepository;
  private userService: UserService;
  private auditLogService: AuditLogService;

  constructor(
    adminRepository: AdminRepository,
    userService: UserService,
    auditLogService: AuditLogService
  ) {
    super(adminRepository);
    this.adminRepository = adminRepository;
    this.userService = userService;
    this.auditLogService = auditLogService;
  }

  async login(
    email: string,
    password: string
  ): Promise<{ admin: AdminModel } | null> {
    try {
      // First authenticate using UserService
      const userResult = await this.userService.login(email, password);
      if (!userResult) {
        return null;
      }

      // Check if the user is an admin
      const { user } = userResult;
      if (user.role !== "ADMIN") {
        return null;
      }

      // Get admin profile
      const admin = await this.adminRepository.findByUserId(user.id);
      if (!admin) {
        return null;
      }

      return { admin };
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async registerAdmin(adminData: {
    email: string;
    password?: string;
    namePrefix: string;
    firstName: string;
    lastName: string;
    createdBy?: number;
  }): Promise<AdminModel> {
    try {
      // Check if user already exists
      const existingUser = await this.userService.findByEmail(adminData.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }
      if (!adminData.password) {
        const generatedPassword = process.env.DEFAULT_PASSWORD;
        if (!generatedPassword) {
          throw new Error("DEFAULT_PASSWORD is not configured in environment");
        }
        adminData.password = generatedPassword;
      }

      // Create new admin
      const adminModel = await AdminModel.createAdmin(
        adminData.email,
        adminData.password,
        adminData.namePrefix,
        adminData.firstName,
        adminData.lastName
      );

      const created = await this.create(adminModel);

      // Log creation
      if (this.auditLogService && created) {
        const {
          createdAt: newCreatedAt,
          updatedAt: newUpdatedAt,
          ...newData
        } = created.toJSON();

        await this.auditLogService.logAction(
          "Admin",
          "CREATE",
          (created as any).adminId,
          adminData.createdBy || undefined,
          undefined,
          newData
        );
      }

      return created;
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getAdminByUserId(userId: number): Promise<AdminModel | null> {
    try {
      return await this.adminRepository.findByUserId(userId);
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async updateAdminProfile(
    adminId: number,
    data: Partial<AdminModel>,
    currentVersion?: number,
    userId?: number
  ): Promise<AdminModel | null> {
    try {
      // If updating email, check if it's already in use by another account
      if (data.email) {
        // First, get the current admin to find the associated userId
        const currentAdmin = await this.adminRepository.findById(adminId);
        if (!currentAdmin) {
          return null;
        }

        const existingUser = await this.userService.findByEmail(data.email);
        // Only throw error if email belongs to a different user (currentAdmin.id is userId from BaseModel)
        if (existingUser && existingUser.id !== currentAdmin.id) {
          throw new Error("Email is already in use by another account");
        }
      }

      if (currentVersion !== undefined) {
        // ดึงข้อมูลเก่าก่อน update (สำหรับ log)
        const oldRecord = await this.adminRepository.findById(adminId);

        // Use optimistic locking
        const updated = await this.adminRepository.updateWithLock(
          adminId,
          data,
          currentVersion
        );

        // Log การ update
        if (updated && oldRecord) {
          const {
            createdAt: oldCreatedAt,
            updatedAt: oldUpdatedAt,
            ...oldData
          } = oldRecord.toJSON();
          const {
            createdAt: newCreatedAt,
            updatedAt: newUpdatedAt,
            ...newData
          } = updated.toJSON();

          await this.auditLogService.logAction(
            "Admin",
            "UPDATE",
            adminId,
            userId || undefined,
            oldData,
            newData
          );
        }

        return updated;
      } else {
        // Fallback to regular update
        const oldRecord = await this.adminRepository.findById(adminId);

        const updated = await this.update(adminId, data);

        if (updated && oldRecord) {
          const {
            createdAt: oldCreatedAt,
            updatedAt: oldUpdatedAt,
            ...oldData
          } = oldRecord.toJSON();
          const {
            createdAt: newCreatedAt,
            updatedAt: newUpdatedAt,
            ...newData
          } = updated.toJSON();

          await this.auditLogService.logAction(
            "Admin",
            "UPDATE",
            adminId,
            userId || undefined,
            oldData,
            newData
          );
        }

        return updated;
      }
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  // Admin-specific business logic

  // Get statistics about users
  async getUserStatistics(): Promise<{
    totalUsers: number;
    usersByRole: Record<UserRole, number>;
  }> {
    try {
      const allUsers = await this.userService.getAll();

      const statistics = {
        totalUsers: allUsers.length,
        usersByRole: {
          [UserRole.BASIC]: 0,
          [UserRole.FARMER]: 0,
          [UserRole.AUDITOR]: 0,
          [UserRole.COMMITTEE]: 0,
          [UserRole.ADMIN]: 0,
        },
      };

      allUsers.forEach((user) => {
        statistics.usersByRole[user.role]++;
      });

      return statistics;
    } catch (error) {
      this.handleServiceError(error);
      return {
        totalUsers: 0,
        usersByRole: {
          [UserRole.BASIC]: 0,
          [UserRole.FARMER]: 0,
          [UserRole.AUDITOR]: 0,
          [UserRole.COMMITTEE]: 0,
          [UserRole.ADMIN]: 0,
        },
      };
    }
  }

  // Change a user's role
  async changeUserRole(
    userId: number,
    newRole: UserRole
  ): Promise<UserModel | null> {
    try {
      return await this.userService.update(userId, { role: newRole });
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }
}
