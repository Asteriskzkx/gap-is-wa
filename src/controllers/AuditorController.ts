import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./BaseController";
import { AuditorModel } from "../models/AuditorModel";
import { AuditorService } from "../services/AuditorService";
import { requireValidId } from "../utils/ParamUtils";
import { checkAuthorization } from "@/lib/session";
export class AuditorController extends BaseController<AuditorModel> {
  private auditorService: AuditorService;

  constructor(auditorService: AuditorService) {
    super(auditorService);
    this.auditorService = auditorService;
  }

  async login(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const { email, password } = data;

      if (!email || !password) {
        return NextResponse.json(
          { message: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน" },
          { status: 400 }
        );
      }

      const result = await this.auditorService.login(email, password);

      if (!result) {
        return NextResponse.json(
          {
            message:
              "ไม่สามารถยืนยันตัวตนได้ กรุณาตรวจสอบอีเมลหรือรหัสผ่านให้ถูกต้อง",
          },
          { status: 401 }
        );
      }

      const { auditor } = result;

      // Remove sensitive data before returning
      const auditorJson = auditor.toJSON();

      return NextResponse.json({ auditor: auditorJson }, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async registerAuditor(req: NextRequest): Promise<NextResponse> {
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

      const auditor = await this.auditorService.registerAuditor({
        email,
        password,
        namePrefix: namePrefix || "",
        firstName,
        lastName,
      });

      // Remove sensitive data before returning
      const auditorJson = auditor.toJSON();

      return NextResponse.json(auditorJson, { status: 201 });
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
      return this.handleControllerError(error);
    }
  }

  async getCurrentAuditor(req: NextRequest): Promise<NextResponse> {
    try {
      // ใช้ NextAuth session แทน JWT token
      const { authorized, session, error } = await checkAuthorization(req, [
        "AUDITOR",
      ]);

      if (!authorized || !session) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      // ดึงข้อมูล auditor จาก session
      const auditorData = session.user.roleData;

      if (!auditorData) {
        return NextResponse.json(
          { message: "ไม่พบข้อมูลผู้ตรวจประเมินในระบบ" },
          { status: 404 }
        );
      }

      return NextResponse.json(auditorData, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async getAuditorProfile(
    req: NextRequest,
    { params }: { params: { userId: string } }
  ): Promise<NextResponse> {
    try {
      // แปลง userId จาก string เป็น number
      let userId: number;
      try {
        userId = requireValidId(params.userId, "userId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const auditor = await this.auditorService.getAuditorByUserId(userId);

      if (!auditor) {
        return NextResponse.json(
          { message: "Auditor profile not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(auditor.toJSON(), { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async updateAuditorProfile(
    req: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      // แปลง auditorId จาก string เป็น number
      let auditorId: number;
      try {
        auditorId = requireValidId(params.id, "auditorId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const data = await req.json();

      const updatedAuditor = await this.auditorService.updateAuditorProfile(
        auditorId,
        data
      );

      if (!updatedAuditor) {
        return NextResponse.json(
          { message: "Auditor not found or update failed" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedAuditor.toJSON(), { status: 200 });
    } catch (error: any) {
      if (error.message.includes("already in use")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
      return this.handleControllerError(error);
    }
  }

  /**
   * ดึงรายการ rubber farm ที่พร้อมใช้งาน (ไม่มี inspection รอการตรวจประเมิน)
   */
  async getAvailableFarms(req: NextRequest): Promise<NextResponse> {
    try {
      // ตรวจสอบ authorization ด้วย NextAuth
      const { authorized, session, error } = await checkAuthorization(req, [
        "AUDITOR",
      ]);

      if (!authorized || !session) {
        return NextResponse.json(
          { message: error || "Authorization required" },
          { status: 401 }
        );
      }

      // ดึงค่า pagination จาก query parameters
      const { searchParams } = new URL(req.url);
      const limit = Number.parseInt(searchParams.get("limit") || "10");
      const offset = Number.parseInt(searchParams.get("offset") || "0");

      // ดึงรายการ farms ที่พร้อมใช้งานทั้งหมด
      const availableFarms =
        await this.auditorService.getAvailableRubberFarms();

      // คำนวณ pagination
      const total = availableFarms.length;
      const paginatedFarms = availableFarms.slice(offset, offset + limit);

      return NextResponse.json(
        {
          results: paginatedFarms,
          paginator: {
            limit,
            offset,
            total,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  /**
   * ตรวจสอบว่า farm สามารถใช้งานได้หรือไม่
   */
  async checkFarmAvailability(
    req: NextRequest,
    { params }: { params: { farmId: string } }
  ): Promise<NextResponse> {
    try {
      // ตรวจสอบ authorization ด้วย NextAuth
      const { authorized, session, error } = await checkAuthorization(req, [
        "AUDITOR",
      ]);

      if (!authorized || !session) {
        return NextResponse.json(
          { message: error || "Authorization required" },
          { status: 401 }
        );
      }

      // ตรวจสอบ farmId
      let farmId: number;
      try {
        farmId = requireValidId(params.farmId, "farmId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      // ตรวจสอบความพร้อมใช้งาน
      const isAvailable = await this.auditorService.isFarmAvailable(farmId);

      return NextResponse.json(
        {
          farmId,
          isAvailable,
          message: isAvailable
            ? "Farm is available for inspection"
            : "Farm has pending inspection",
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async assignAuditorToRegion(
    req: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      // แปลง auditorId จาก string เป็น number
      let auditorId: number;
      try {
        auditorId = requireValidId(params.id, "auditorId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const data = await req.json();
      const { region } = data;

      if (!region) {
        return NextResponse.json(
          { message: "Region is required" },
          { status: 400 }
        );
      }

      const success = await this.auditorService.assignAuditorToRegion(
        auditorId,
        region
      );

      if (!success) {
        return NextResponse.json(
          { message: "Failed to assign auditor to region" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: `Auditor successfully assigned to region ${region}`,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async getAuditorAssignments(
    req: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      // แปลง auditorId จาก string เป็น number
      let auditorId: number;
      try {
        auditorId = requireValidId(params.id, "auditorId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const assignments = await this.auditorService.getAuditorAssignments(
        auditorId
      );

      return NextResponse.json({ assignments }, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  protected async createModel(data: any): Promise<AuditorModel> {
    return AuditorModel.createAuditor(
      data.email,
      data.password,
      data.namePrefix || "",
      data.firstName,
      data.lastName
    );
  }
}
