import { UserRole } from "@/models/UserModel";
import {
  AdminInfo,
  AuditorInfo,
  CommitteeInfo,
  FarmerInfo,
  NormalizedUser,
} from "@/types/UserType";
import { prisma } from "@/utils/db";
import bcrypt from "bcrypt";
import { UserModel } from "../models/UserModel";
import { UserRepository } from "../repositories/UserRepository";
import { AuditLogService } from "./AuditLogService";
import { BaseService } from "./BaseService";

export class UserService extends BaseService<UserModel> {
  private readonly userRepository: UserRepository;
  private readonly auditLogService: AuditLogService;

  constructor(
    userRepository: UserRepository,
    auditLogService: AuditLogService
  ) {
    super(userRepository);
    this.userRepository = userRepository;
    this.auditLogService = auditLogService;
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<UserModel> {
    try {
      // Check if user already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Create new user
      const userModel = await UserModel.create(
        userData.email,
        userData.password,
        userData.name,
        (userData.role as any) || undefined
      );

      return await this.create(userModel);
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: UserModel } | null> {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return null;
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return null;
      }

      return { user };
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    // เปลี่ยนจาก string เป็น number
    try {
      const user = await this.getById(userId);
      if (!user) {
        return false;
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return false;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.update(userId, {
        hashedPassword,
        requirePasswordChange: false,
      } as Partial<UserModel>);

      return true;
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }

  async resetPasswordToDefault(userId: number): Promise<UserModel | null> {
    try {
      const generatedPassword = process.env.DEFAULT_PASSWORD;
      if (!generatedPassword) {
        throw new Error("DEFAULT_PASSWORD is not configured in environment");
      }

      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      return await this.update(userId, {
        hashedPassword,
        requirePasswordChange: true,
      } as Partial<UserModel>);
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async changeRole(
    userId: number,
    newRole: UserRole
  ): Promise<UserModel | null> {
    try {
      const user = await this.getById(userId);
      if (!user) {
        return null;
      }
      user.role = newRole;
      return await this.userRepository.update(userId, user);
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async getUsersNormalizedById(userId?: number): Promise<NormalizedUser[]> {
    let users;

    if (userId) {
      // ถ้ามี userId ให้ query คนเดียว
      const user = await prisma.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          admin: true,
          committee: true,
          farmer: true,
          auditor: true,
        },
      });
      users = user ? [user] : [];
    } else {
      // ถ้าไม่มี userId ให้ query ทุกคน
      users = await prisma.user.findMany({
        select: {
          userId: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          admin: true,
          committee: true,
          farmer: true,
          auditor: true,
        },
      });
    }

    return users.map((u): NormalizedUser => {
      const base: NormalizedUser = {
        userId: u.userId,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };

      if (u.role === "ADMIN" && u.admin) {
        const admin: AdminInfo = {
          adminId: u.admin.adminId,
          namePrefix: u.admin.namePrefix ?? "",
          firstName: u.admin.firstName ?? "",
          lastName: u.admin.lastName ?? "",
          userId: u.userId,
          createdAt: u.admin.createdAt,
          updatedAt: u.admin.updatedAt,
          version: u.admin.version ?? 0,
        };
        base.admin = admin;
      } else if (u.role === "COMMITTEE" && u.committee) {
        const committee: CommitteeInfo = {
          committeeId: u.committee.committeeId,
          namePrefix: u.committee.namePrefix ?? "",
          firstName: u.committee.firstName ?? "",
          lastName: u.committee.lastName ?? "",
          userId: u.userId,
          createdAt: u.committee.createdAt,
          updatedAt: u.committee.updatedAt,
          version: u.committee.version ?? 0,
        };
        base.committee = committee;
      } else if (u.role === "FARMER" && u.farmer) {
        const farmer: FarmerInfo = {
          farmerId: u.farmer.farmerId,
          namePrefix: u.farmer.namePrefix ?? "",
          firstName: u.farmer.firstName ?? "",
          lastName: u.farmer.lastName ?? "",
          identificationNumber: u.farmer.identificationNumber,
          birthDate: u.farmer.birthDate,
          gender: u.farmer.gender,
          houseNo: u.farmer.houseNo,
          villageName: u.farmer.villageName,
          moo: u.farmer.moo,
          road: u.farmer.road,
          alley: u.farmer.alley,
          subDistrict: u.farmer.subDistrict,
          district: u.farmer.district,
          provinceName: u.farmer.provinceName,
          zipCode: u.farmer.zipCode,
          phoneNumber: u.farmer.phoneNumber,
          mobilePhoneNumber: u.farmer.mobilePhoneNumber,
          userId: u.userId,
          createdAt: u.farmer.createdAt,
          updatedAt: u.farmer.updatedAt,
          version: u.farmer.version ?? 0,
        };
        base.farmer = farmer;
      } else if (u.role === "AUDITOR" && u.auditor) {
        const auditor: AuditorInfo = {
          auditorId: u.auditor.auditorId,
          namePrefix: u.auditor.namePrefix ?? "",
          firstName: u.auditor.firstName ?? "",
          lastName: u.auditor.lastName ?? "",
          userId: u.userId,
          createdAt: u.auditor.createdAt,
          updatedAt: u.auditor.updatedAt,
          version: u.auditor.version ?? 0,
        };
        base.auditor = auditor;
      }

      return base;
    });
  }

  /**
   * ดึง users พร้อม filter และ pagination (Server-side)
   */
  async getUsersWithFilterAndPagination(params: {
    search?: string;
    role?: string;
    skip?: number;
    take?: number;
    sortField?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ users: any[]; total: number }> {
    try {
      const result = await this.userRepository.findWithFilterAndPagination(
        params
      );
      return {
        users: result.users.map((user) => user.toJSON()),
        total: result.total,
      };
    } catch (error) {
      this.handleServiceError(error);
      console.error("Error finding users with filter:", error);
      return { users: [], total: 0 };
    }
  }

  async delete(userId: number, actorId?: number): Promise<boolean> {
    try {
      // Get old record before deletion for audit log
      const oldRecord = await this.userRepository.findById(userId);

      if (!oldRecord) {
        return false;
      }

      // Delete the record
      const isDeleted = await this.repository.delete(userId);

      if (isDeleted && this.auditLogService && userId) {
        const { createdAt, updatedAt, ...oldData } = oldRecord.toJSON();

        await this.auditLogService.logAction(
          "User",
          "DELETE",
          userId,
          actorId,
          oldData,
          void 0
        );
      }

      return isDeleted;
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }
}
