import { CommitteeModel } from "../models/CommitteeModel";
import { CommitteeRepository } from "../repositories/CommitteeRepository";
import { AuditLogService } from "./AuditLogService";
import { BaseService } from "./BaseService";
import { UserService } from "./UserService";

export class CommitteeService extends BaseService<CommitteeModel> {
  private committeeRepository: CommitteeRepository;
  private userService: UserService;
  private auditLogService: AuditLogService;

  constructor(
    committeeRepository: CommitteeRepository,
    userService: UserService,
    auditLogService: AuditLogService
  ) {
    super(committeeRepository);
    this.committeeRepository = committeeRepository;
    this.userService = userService;
    this.auditLogService = auditLogService;
  }

  async login(
    email: string,
    password: string
  ): Promise<{ committee: CommitteeModel } | null> {
    try {
      // First authenticate using UserService
      const userResult = await this.userService.login(email, password);
      if (!userResult) {
        return null;
      }

      // Check if the user is a committee member
      const { user } = userResult;
      if (user.role !== "COMMITTEE") {
        return null;
      }

      // Get committee profile
      const committee = await this.committeeRepository.findByUserId(user.id);
      if (!committee) {
        return null;
      }

      return { committee };
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async registerCommittee(committeeData: {
    email: string;
    password?: string;
    namePrefix: string;
    firstName: string;
    lastName: string;
    createdBy?: number;
  }): Promise<CommitteeModel> {
    try {
      // Check if user already exists
      const existingUser = await this.userService.findByEmail(
        committeeData.email
      );
      if (existingUser) {
        throw new Error("User with this email already exists");
      }
      if (!committeeData.password) {
        const generatedPassword = process.env.DEFAULT_PASSWORD;
        if (!generatedPassword) {
          throw new Error("DEFAULT_PASSWORD is not configured in environment");
        }
        committeeData.password = generatedPassword;
      }

      // Create new committee
      const committeeModel = await CommitteeModel.createCommittee(
        committeeData.email,
        committeeData.password,
        committeeData.namePrefix,
        committeeData.firstName,
        committeeData.lastName
      );

      const created = await this.create(committeeModel);

      // Log creation
      if (this.auditLogService && created) {
        const {
          createdAt: newCreatedAt,
          updatedAt: newUpdatedAt,
          ...newData
        } = created.toJSON();

        await this.auditLogService.logAction(
          "Committee",
          "CREATE",
          (created as any).committeeId,
          committeeData.createdBy || undefined,
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

  async getCommitteeByUserId(userId: number): Promise<CommitteeModel | null> {
    try {
      return await this.committeeRepository.findByUserId(userId);
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async updateCommitteeProfile(
    committeeId: number,
    data: Partial<CommitteeModel>,
    currentVersion?: number
  ): Promise<CommitteeModel | null> {
    try {
      // If updating email, check if it's already in use by another account
      if (data.email) {
        // First, get the current committee to find the associated userId
        const currentCommittee = await this.committeeRepository.findById(
          committeeId
        );
        if (!currentCommittee) {
          return null;
        }

        const existingUser = await this.userService.findByEmail(data.email);
        // Only throw error if email belongs to a different user (currentCommittee.id is userId from BaseModel)
        if (existingUser && existingUser.id !== currentCommittee.id) {
          throw new Error("Email is already in use by another account");
        }
      }

      if (currentVersion !== undefined) {
        // Use optimistic locking
        return await this.committeeRepository.updateWithLock(
          committeeId,
          data,
          currentVersion
        );
      } else {
        // Fallback to regular update
        return await this.update(committeeId, data);
      }
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }
}
