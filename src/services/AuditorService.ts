import { BaseService } from "./BaseService";
import { AuditorModel } from "../models/AuditorModel";
import { AuditorRepository } from "../repositories/AuditorRepository";
import { UserService } from "./UserService";
import jwt from "jsonwebtoken";

export class AuditorService extends BaseService<AuditorModel> {
  private auditorRepository: AuditorRepository;
  private userService: UserService;
  private jwtSecret: string;

  constructor(auditorRepository: AuditorRepository, userService: UserService) {
    super(auditorRepository);
    this.auditorRepository = auditorRepository;
    this.userService = userService;
    this.jwtSecret =
      process.env.JWT_SECRET || "default-secret-key-change-in-production";
  }

  async login(
    email: string,
    password: string
  ): Promise<{ auditor: AuditorModel; token: string } | null> {
    try {
      // First authenticate using UserService
      const userResult = await this.userService.login(email, password);
      if (!userResult) {
        return null;
      }

      // Check if the user is an auditor
      const { user, token } = userResult;
      if (user.role !== "AUDITOR") {
        return null;
      }

      // Get auditor profile
      const auditor = await this.auditorRepository.findByUserId(user.id);
      if (!auditor) {
        return null;
      }

      // Generate auditor-specific token with more info
      const auditorToken = this.generateToken(auditor);

      return { auditor, token: auditorToken };
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async registerAuditor(auditorData: {
    email: string;
    password: string;
    namePrefix: string;
    firstName: string;
    lastName: string;
  }): Promise<AuditorModel> {
    try {
      // Check if user already exists
      const existingUser = await this.userService.findByEmail(
        auditorData.email
      );
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Create new auditor
      const auditorModel = await AuditorModel.createAuditor(
        auditorData.email,
        auditorData.password,
        auditorData.namePrefix,
        auditorData.firstName,
        auditorData.lastName
      );

      return await this.create(auditorModel);
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getAuditorByUserId(userId: number): Promise<AuditorModel | null> {
    // เปลี่ยนจาก string เป็น number
    try {
      return await this.auditorRepository.findByUserId(userId);
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async updateAuditorProfile(
    auditorId: number,
    data: Partial<AuditorModel>
  ): Promise<AuditorModel | null> {
    // เปลี่ยนจาก string เป็น number
    try {
      // If updating email, check if it's already in use
      if (data.email) {
        const existingUser = await this.userService.findByEmail(data.email);
        if (existingUser && existingUser.id !== data.id) {
          throw new Error("Email is already in use by another account");
        }
      }

      return await this.update(auditorId, data);
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  // Additional auditor-specific business logic can be added here
  async assignAuditorToRegion(
    auditorId: number,
    region: string
  ): Promise<boolean> {
    // เปลี่ยนจาก string เป็น number
    // This would be implemented based on your specific business requirements
    // For now, returning a placeholder implementation
    try {
      console.log(`Assigning auditor ${auditorId} to region ${region}`);
      // In a real implementation, you would store this assignment in the database
      return true;
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }

  async getAuditorAssignments(auditorId: number): Promise<string[]> {
    // เปลี่ยนจาก string เป็น number
    // This would be implemented based on your specific business requirements
    // For now, returning a placeholder implementation
    try {
      console.log(`Getting assignments for auditor ${auditorId}`);
      // In a real implementation, you would fetch assignments from the database
      return ["Assignment 1", "Assignment 2"];
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  private generateToken(auditor: AuditorModel): string {
    return jwt.sign(
      {
        userId: auditor.id,
        auditorId: auditor.auditorId,
        email: auditor.email,
        role: auditor.role,
        name: auditor.name,
        fullName: `${auditor.namePrefix}${auditor.firstName} ${auditor.lastName}`,
      },
      this.jwtSecret,
      { expiresIn: "24h" }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  async getAuditorByToken(token: string): Promise<AuditorModel | null> {
    try {
      // ตรวจสอบความถูกต้องของ token
      const decoded = this.verifyToken(token);
      if (!decoded || !decoded.userId) {
        return null;
      }

      // หากเป็น token ที่ถูกต้อง ดึงข้อมูล auditor จาก userId
      const auditor = await this.getAuditorByUserId(decoded.userId);
      return auditor;
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }
}
