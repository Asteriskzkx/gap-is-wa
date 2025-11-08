import { BaseService } from "./BaseService";
import { UserModel } from "../models/UserModel";
import { UserRepository } from "../repositories/UserRepository";
import bcrypt from "bcrypt";
import { UserRole } from "@/models/UserModel";

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

  async changeRole(userId:number, newRole:UserRole) : Promise<UserModel | null> {
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
}
