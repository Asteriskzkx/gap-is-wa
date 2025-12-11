import { BaseService } from "./BaseService";
import { CommitteeModel } from "../models/CommitteeModel";
import { CommitteeRepository } from "../repositories/CommitteeRepository";
import { UserService } from "./UserService";

export class CommitteeService extends BaseService<CommitteeModel> {
  private committeeRepository: CommitteeRepository;
  private userService: UserService;

  constructor(
    committeeRepository: CommitteeRepository,
    userService: UserService
  ) {
    super(committeeRepository);
    this.committeeRepository = committeeRepository;
    this.userService = userService;
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

      return await this.create(committeeModel);
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
    data: Partial<CommitteeModel>
  ): Promise<CommitteeModel | null> {
    try {
      // If updating email, check if it's already in use by another account
      if (data.email) {
        // First, get the current committee to find the associated userId
        const currentCommittee = await this.committeeRepository.findById(committeeId);
        if (!currentCommittee) {
          return null;
        }

        const existingUser = await this.userService.findByEmail(data.email);
        // Only throw error if email belongs to a different user (currentCommittee.id is userId from BaseModel)
        if (existingUser && existingUser.id !== currentCommittee.id) {
          throw new Error("Email is already in use by another account");
        }
      }

      return await this.update(committeeId, data);
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }
}
