import { checkAuthorization } from "@/lib/session";
import { UserRegistrationFactoryService } from "@/services/UserRegistrationFactoryService";
import { NextRequest, NextResponse } from "next/server";
import { UserModel, UserRole } from "../models/UserModel";
import { UserService } from "../services/UserService";
import { requireValidId } from "../utils/ParamUtils";
import { BaseController } from "./BaseController";

export class UserController extends BaseController<UserModel> {
  private userService: UserService;
  private UserRegistrationFactoryService: UserRegistrationFactoryService;

  constructor(
    userService: UserService,
    UserRegistrationFactoryService: UserRegistrationFactoryService
  ) {
    super(userService);
    this.userService = userService;
    this.UserRegistrationFactoryService = UserRegistrationFactoryService;
  }

  async createUser(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();

      const createdUser =
        await this.UserRegistrationFactoryService.createUserWithRole(data);

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

  async changePassword(req: NextRequest, session?: any): Promise<NextResponse> {
    try {
      const data = await req.json();
      const { currentPassword, newPassword } = data;

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          {
            message: "Current password and new password are required",
          },
          { status: 400 }
        );
      }

      // Get userId from session
      if (!session?.user?.id) {
        return NextResponse.json(
          { message: "User session not found" },
          { status: 401 }
        );
      }

      const userIdNum = Number.parseInt(session.user.id);
      if (Number.isNaN(userIdNum)) {
        return NextResponse.json(
          { message: "Invalid user ID in session" },
          { status: 400 }
        );
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

  async checkDuplicateEmail(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const email = searchParams.get("email");

      if (!email) {
        return NextResponse.json(
          { message: "Email parameter is required" },
          { status: 400 }
        );
      }

      const existingUser = await this.userService.findByEmail(email);
      const isDuplicate = !!existingUser;

      return NextResponse.json(
        {
          isDuplicate,
          message: isDuplicate
            ? "อีเมลนี้ถูกใช้งานแล้ว"
            : "อีเมลนี้สามารถใช้งานได้",
        },
        { status: 200 }
      );
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

  /**
   * GET /api/v1/users - ดึง users พร้อม filter และ pagination (Admin only)
   * Query params: search, role, skip, take, sortField, sortOrder
   */
  async getAllUsersWithPagination(req: NextRequest): Promise<NextResponse> {
    try {
      const { authorized, error } = await checkAuthorization(req, [
        UserRole.ADMIN,
      ]);

      if (!authorized) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      const { searchParams } = new URL(req.url);

      // Parse query parameters
      const search = searchParams.get("search") || undefined;
      const role = searchParams.get("role") || undefined;
      const skipStr = searchParams.get("skip");
      const takeStr = searchParams.get("take");
      const sortField = searchParams.get("sortField") || undefined;
      const sortOrderParam = searchParams.get("sortOrder");

      // Parse pagination
      const skip = skipStr ? parseInt(skipStr) : 0;
      const take = takeStr ? parseInt(takeStr) : 20;

      // Parse sort order (1 = asc, -1 = desc from PrimeReact)
      const sortOrder: "asc" | "desc" = sortOrderParam === "1" ? "asc" : "desc";

      const result = await this.userService.getUsersWithFilterAndPagination({
        search,
        role,
        skip: isNaN(skip) ? 0 : skip,
        take: isNaN(take) ? 20 : Math.min(take, 100), // Max 100 per page
        sortField,
        sortOrder,
      });

      return NextResponse.json(
        {
          users: result.users,
          total: result.total,
          skip,
          take,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleControllerError(error);
    }
  }
}
