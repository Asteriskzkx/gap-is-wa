import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./BaseController";
import { CommitteeModel } from "../models/CommitteeModel";
import { CommitteeService } from "../services/CommitteeService";
import { requireValidId } from "../utils/ParamUtils";
import { checkAuthorization } from "@/lib/session";
import { OptimisticLockError } from "../errors/OptimisticLockError";

export class CommitteeController extends BaseController<CommitteeModel> {
  private committeeService: CommitteeService;

  constructor(committeeService: CommitteeService) {
    super(committeeService);
    this.committeeService = committeeService;
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

      const result = await this.committeeService.login(email, password);

      if (!result) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        );
      }

      const { committee } = result;

      // Remove sensitive data before returning
      const committeeJson = committee.toJSON();

      return NextResponse.json({ committee: committeeJson }, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async registerCommittee(req: NextRequest): Promise<NextResponse> {
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

      const committee = await this.committeeService.registerCommittee({
        email,
        password,
        namePrefix: namePrefix || "",
        firstName,
        lastName,
      });

      // Remove sensitive data before returning
      const committeeJson = committee.toJSON();

      return NextResponse.json(committeeJson, { status: 201 });
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
      return this.handleControllerError(error);
    }
  }

  async getCurrentCommittee(req: NextRequest): Promise<NextResponse> {
    try {
      // ใช้ NextAuth session แทน JWT token
      const { authorized, session, error } = await checkAuthorization(req, [
        "COMMITTEE",
      ]);

      if (!authorized || !session) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      // ดึงข้อมูล committee จาก session
      const committeeData = session.user.roleData;

      if (!committeeData) {
        return NextResponse.json(
          { message: "ไม่พบข้อมูลคณะกรรมการในระบบ" },
          { status: 404 }
        );
      }

      return NextResponse.json(committeeData, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async getCommitteeProfile(
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

      const committee = await this.committeeService.getCommitteeByUserId(
        userId
      );

      if (!committee) {
        return NextResponse.json(
          { message: "Committee profile not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(committee.toJSON(), { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async updateCommitteeProfile(
    req: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      // Convert committeeId from string to number
      let committeeId: number;
      try {
        committeeId = requireValidId(params.id, "committeeId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      // capture actor id from session for audit logging
      const { authorized, session, error } = await checkAuthorization(req, [
        "ADMIN",
        "COMMITTEE",
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

      const updatedCommittee =
        await this.committeeService.updateCommitteeProfile(
          committeeId,
          updateData,
          version,
          actorId
        );

      if (!updatedCommittee) {
        return NextResponse.json(
          { message: "Committee not found or update failed" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedCommittee.toJSON(), { status: 200 });
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

  protected async createModel(data: any): Promise<CommitteeModel> {
    return CommitteeModel.createCommittee(
      data.email,
      data.password,
      data.namePrefix || "",
      data.firstName,
      data.lastName
    );
  }
}
