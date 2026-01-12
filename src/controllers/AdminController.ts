import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./BaseController";
import { AdminModel } from "../models/AdminModel";
import { AdminService } from "../services/AdminService";
import { UserRole } from "../models/UserModel";
import { requireValidId, isValidId } from "../utils/ParamUtils";
import { OptimisticLockError } from "../errors/OptimisticLockError";
import { checkAuthorization } from "@/lib/session";

export class AdminController extends BaseController<AdminModel> {
  private adminService: AdminService;

  constructor(adminService: AdminService) {
    super(adminService);
    this.adminService = adminService;
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

      const result = await this.adminService.login(email, password);

      if (!result) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        );
      }

      const { admin } = result;

      // Remove sensitive data before returning
      const adminJson = admin.toJSON();

      return NextResponse.json({ admin: adminJson }, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async registerAdmin(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const { email, password, namePrefix, firstName, lastName } = data;

      // Basic validation
      if (!email || !password || !firstName || !lastName) {
        return NextResponse.json(
          { message: "Required fields missing" },
          { status: 400 }
        );
      }

      const admin = await this.adminService.registerAdmin({
        email,
        password,
        namePrefix: namePrefix || "",
        firstName,
        lastName,
      });

      // Remove sensitive data before returning
      const adminJson = admin.toJSON();

      return NextResponse.json(adminJson, { status: 201 });
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
      return this.handleControllerError(error);
    }
  }

  async getAdminProfile(
    req: NextRequest,
    { params }: { params: { userId: string } }
  ): Promise<NextResponse> {
    try {
      // Convert userId from string to number
      let userId: number;
      try {
        userId = requireValidId(params.userId, "userId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const admin = await this.adminService.getAdminByUserId(userId);

      if (!admin) {
        return NextResponse.json(
          { message: "Admin profile not found" },
          { status: 404 }
        );
      }
      if (admin.role !== "ADMIN") {
        return NextResponse.json({ message: "Access denied" }, { status: 403 });
      }

      return NextResponse.json(admin.toJSON(), { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async updateAdminProfile(
    req: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      // Convert adminId from string to number
      let adminId: number;
      try {
        adminId = requireValidId(params.id, "adminId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      // capture actor id from session for audit logging
      const { authorized, session, error } = await checkAuthorization(req, [
        "ADMIN",
      ]);

      if (!authorized || !session) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      const actorId = Number(session.user.id);

      const data = await req.json();
      const { version, ...updateData } = data;

      if (version === undefined) {
        return NextResponse.json(
          { message: "กรุณาระบุ version สำหรับ optimistic locking" },
          { status: 400 }
        );
      }

      const updatedAdmin = await this.adminService.updateAdminProfile(
        adminId,
        updateData,
        version,
        actorId
      );

      if (!updatedAdmin) {
        return NextResponse.json(
          { message: "Admin not found or update failed" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedAdmin.toJSON(), { status: 200 });
    } catch (error: any) {
      // Handle optimistic lock error
      if (error instanceof OptimisticLockError) {
        return NextResponse.json(error.toJSON(), { status: 409 });
      }
      if (error.message.includes("already in use")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
      return this.handleControllerError(error);
    }
  }

  async getUserStatistics(req: NextRequest): Promise<NextResponse> {
    try {
      const statistics = await this.adminService.getUserStatistics();
      return NextResponse.json(statistics, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async changeUserRole(req: NextRequest): Promise<NextResponse> {
    try {
      const { userId, role } = await req.json();

      if (!userId || !role) {
        return NextResponse.json(
          { message: "User ID and role are required" },
          { status: 400 }
        );
      }

      // Validate role
      if (!Object.values(UserRole).includes(role as UserRole)) {
        return NextResponse.json({ message: "Invalid role" }, { status: 400 });
      }

      // Convert userId from string to number if needed
      let userIdNum: number;
      try {
        userIdNum = requireValidId(userId, "userId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const updatedUser = await this.adminService.changeUserRole(
        userIdNum,
        role as UserRole
      );

      if (!updatedUser) {
        return NextResponse.json(
          { message: "User not found or update failed" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedUser.toJSON(), { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  protected async createModel(data: any): Promise<AdminModel> {
    return AdminModel.createAdmin(
      data.email,
      data.password,
      data.namePrefix || "",
      data.firstName,
      data.lastName
    );
  }
}
