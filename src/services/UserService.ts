import { UserRole } from "@/models/UserModel";
import {
  AdminInfo,
  AuditorInfo,
  CommitteeInfo,
  FarmerInfo,
  NormalizedUser,
} from "@/types/UserType";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { getPrismaClientOptions } from "../../prisma.config";
import { UserModel } from "../models/UserModel";
import { UserRepository } from "../repositories/UserRepository";
import { BaseService } from "./BaseService";
const prisma = new PrismaClient(getPrismaClientOptions());

export class UserService extends BaseService<UserModel> {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    super(userRepository);
    this.userRepository = userRepository;
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
      } as Partial<UserModel>);

      return true;
    } catch (error) {
      this.handleServiceError(error);
      return false;
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
        include: { admin: true, committee: true, farmer: true, auditor: true },
      });
      users = user ? [user] : [];
    } else {
      // ถ้าไม่มี userId ให้ query ทุกคน
      users = await prisma.user.findMany({
        include: { admin: true, committee: true, farmer: true, auditor: true },
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
}
