import { checkAuthorization } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { UserModel, UserRole } from "../models/UserModel";
import { UserService } from "../services/UserService";
import { requireValidId } from "../utils/ParamUtils";
import { BaseController } from "./BaseController";
import { FarmerService } from "@/services/FarmerService";
import { AuditorService } from "@/services/AuditorService";
import { CommitteeService } from "@/services/CommitteeService";
import { UserRegistrationFactoryService } from "@/services/UserRegistrationFactoryService";
import { th } from "zod/v4/locales";

export class UserController extends BaseController<UserModel> {
  private userService: UserService;
  private UserRegistrationFactoryService: UserRegistrationFactoryService;



  constructor(userService: UserService, UserRegistrationFactoryService: UserRegistrationFactoryService) {
    super(userService);
    this.userService = userService;
    this.UserRegistrationFactoryService = UserRegistrationFactoryService;
  }

  async createUser(req: NextRequest): Promise<NextResponse> {
      try {
          const data = await req.json();

          const createdUser = await this.UserRegistrationFactoryService.createUserWithRole(data);

          // remove sensitive fields
          const userJson = createdUser.toJSON();

          return NextResponse.json(userJson, { status: 201 });
        } catch (error: any) {
          if (error.message.includes("already exists")) {
            return NextResponse.json({ message: error.message }, { status: 409 });
          }
          return this.handleControllerError(error);
        }
  }

  async register(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const { email, password, name, role } = data;

      if (!email || !password || !name) {
        return NextResponse.json(
          { message: "Email, password, and name are required" },
          { status: 400 }
        );
      }

      const user = await this.userService.register({
        email,
        password,
        name,
        role,
      });

      // Remove sensitive data before returning
      const userJson = user.toJSON();

      return NextResponse.json(userJson, { status: 201 });
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
      return this.handleControllerError(error);
    }
  }

  async login(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const { email, password } = data;

      if (!email || !password) {
        return NextResponse.json(
          { message: "Email and password are required" },
          { status: 400 }
        );
      }

      const result = await this.userService.login(email, password);

      if (!result) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        );
      }

      const { user } = result;

      // Remove sensitive data before returning
      const userJson = user.toJSON();

      return NextResponse.json({ user: userJson }, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async changePassword(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const { userId, currentPassword, newPassword } = data;

      if (!userId || !currentPassword || !newPassword) {
        return NextResponse.json(
          {
            message: "User ID, current password, and new password are required",
          },
          { status: 400 }
        );
      }

      // ใช้ requireValidId เพื่อตรวจสอบและแปลงค่า userId
      let userIdNum: number;
      try {
        userIdNum = requireValidId(userId, "userId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const success = await this.userService.changePassword(
        userIdNum,
        currentPassword,
        newPassword
      );

      if (!success) {
        return NextResponse.json(
          { message: "Invalid user ID or current password" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { message: "Password changed successfully" },
        { status: 200 }
      );
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async getCurrentUser(req: NextRequest): Promise<NextResponse> {
    try {
      // ตรวจสอบ authorization ด้วย NextAuth
      const { authorized, session, error } = await checkAuthorization(req, [
        "ADMIN",
        "FARMER",
        "AUDITOR",
        "COMMITTEE",
      ]);

      if (!authorized || !session) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      // ดึง userId จาก session และแปลงเป็น number
      const userIdStr = session.user.id;
      if (!userIdStr) {
        return NextResponse.json(
          { message: "User ID not found in session" },
          { status: 400 }
        );
      }

      // แปลง userId จาก string เป็น number
      let userId: number;
      try {
        userId = requireValidId(userIdStr, "userId in session");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const user = await this.userService.getById(userId);

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      // Remove sensitive data before returning
      const userJson = user.toJSON();

      return NextResponse.json(userJson, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  protected async createModel(data: any): Promise<UserModel> {
    return UserModel.create(data.email, data.password, data.name, data.role);
  }

  async changeRole(
    req: NextRequest,
    params: { userId: string }
  ): Promise<NextResponse> {
    try {
      const userId = parseInt(params.userId);
      const data = await req.json();
      const newRole: UserRole = data.role;
      const updatedUser = await this.userService.changeRole(userId, newRole);
      if (!updatedUser) {
        return NextResponse.json(
          { message: "User not found or role unchanged" },
          { status: 404 }
        );
      }
      const userJson = updatedUser.toJSON();
      return NextResponse.json(userJson, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async getUsersNormalized(
    req: NextRequest,
    userId?: number
  ): Promise<NextResponse> {
    try {
      const data = await this.userService.getUsersNormalizedById(userId);
      return NextResponse.json(data, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }
}
