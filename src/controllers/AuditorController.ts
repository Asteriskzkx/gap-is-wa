import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./BaseController";
import { AuditorModel } from "../models/AuditorModel";
import { AuditorService } from "../services/AuditorService";
import { requireValidId, isValidId } from "../utils/ParamUtils";

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

      const { auditor, token } = result;

      // Remove sensitive data before returning
      const auditorJson = auditor.toJSON();

      return NextResponse.json(
        { auditor: auditorJson, token },
        { status: 200 }
      );
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
      // Extract the authorization token from the request header
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { message: "Authorization token is required" },
          { status: 401 }
        );
      }

      // Get the token part after 'Bearer '
      const token = authHeader.split(" ")[1];
      if (!token) {
        return NextResponse.json(
          { message: "Invalid authorization token" },
          { status: 401 }
        );
      }

      // ใช้ getAuditorByToken เพื่อดึงข้อมูลผู้ตรวจสอบจาก token
      const auditor = await this.auditorService.getAuditorByToken(token);
      if (!auditor) {
        return NextResponse.json(
          { message: "Invalid token or auditor not found" },
          { status: 401 }
        );
      }

      // Return the auditor data without sensitive information
      const auditorData = auditor.toJSON();
      delete auditorData.password; // Ensure password is not included
      delete auditorData.hashedPassword; // Ensure hashed password is not included

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
      // ตรวจสอบ authorization
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { message: "Authorization token is required" },
          { status: 401 }
        );
      }

      const token = authHeader.split(" ")[1];
      const decodedToken = this.auditorService.verifyToken(token);

      if (!decodedToken || decodedToken.role !== "AUDITOR") {
        return NextResponse.json(
          { message: "Invalid token or insufficient permissions" },
          { status: 403 }
        );
      }

      // ดึงรายการ farms ที่พร้อมใช้งาน
      const availableFarms =
        await this.auditorService.getAvailableRubberFarms();

      return NextResponse.json(
        {
          message: "Available farms retrieved successfully",
          data: availableFarms,
          total: availableFarms.length,
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
      // ตรวจสอบ authorization
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { message: "Authorization token is required" },
          { status: 401 }
        );
      }

      const token = authHeader.split(" ")[1];
      const decodedToken = this.auditorService.verifyToken(token);

      if (!decodedToken || decodedToken.role !== "AUDITOR") {
        return NextResponse.json(
          { message: "Invalid token or insufficient permissions" },
          { status: 403 }
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
