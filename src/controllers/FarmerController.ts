import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./BaseController";
import { FarmerModel } from "../models/FarmerModel";
import { FarmerService } from "../services/FarmerService";
import { requireValidId, isValidId } from "../utils/ParamUtils";
import { checkAuthorization } from "@/lib/session";
import { OptimisticLockError } from "../errors/OptimisticLockError";

export class FarmerController extends BaseController<FarmerModel> {
  private farmerService: FarmerService;

  constructor(farmerService: FarmerService) {
    super(farmerService);
    this.farmerService = farmerService;
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

      const result = await this.farmerService.login(email, password);

      if (!result) {
        return NextResponse.json(
          {
            message:
              "ไม่สามารถยืนยันตัวตนได้ กรุณาตรวจสอบอีเมลหรือรหัสผ่านให้ถูกต้อง",
          },
          { status: 401 }
        );
      }

      const { farmer } = result;

      // Remove sensitive data before returning
      const farmerJson = farmer.toJSON();

      return NextResponse.json({ farmer: farmerJson }, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async registerFarmer(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const {
        email,
        password,
        namePrefix,
        firstName,
        lastName,
        identificationNumber,
        birthDate,
        gender,
        houseNo,
        villageName,
        moo,
        road,
        alley,
        subDistrict,
        district,
        provinceName,
        zipCode,
        phoneNumber,
        mobilePhoneNumber,
      } = data;

      // Basic validation
      if (
        !email ||
        !password ||
        !firstName ||
        !lastName ||
        !identificationNumber
      ) {
        return NextResponse.json(
          { message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" },
          { status: 400 }
        );
      }

      // Validate identification number
      const isValidID = await this.farmerService.validateIdentificationNumber(
        identificationNumber
      );
      if (!isValidID) {
        return NextResponse.json(
          {
            message:
              "หมายเลขบัตรประจำตัวประชาชนไม่ถูกต้อง กรุณาตรวจสอบและกรอกใหม่ให้ถูกต้อง",
          },
          { status: 400 }
        );
      }

      // Convert string date to Date object if needed
      const parsedBirthDate = birthDate ? new Date(birthDate) : new Date();

      const farmer = await this.farmerService.registerFarmer({
        email,
        password,
        namePrefix: namePrefix || "",
        firstName,
        lastName,
        identificationNumber,
        birthDate: parsedBirthDate,
        gender: gender || "",
        houseNo: houseNo || "",
        villageName: villageName || "",
        moo: Number(moo) || 0,
        road: road || "",
        alley: alley || "",
        subDistrict,
        district,
        provinceName,
        zipCode,
        phoneNumber: phoneNumber || "",
        mobilePhoneNumber,
      });

      // Remove sensitive data before returning
      const farmerJson = farmer.toJSON();

      return NextResponse.json(farmerJson, { status: 201 });
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
      return this.handleControllerError(error);
    }
  }

  // Addition to src/controllers/FarmerController.ts

  async getCurrentFarmer(req: NextRequest): Promise<NextResponse> {
    try {
      // ใช้ NextAuth session แทน JWT token
      const { authorized, session, error } = await checkAuthorization(req, [
        "FARMER",
      ]);

      if (!authorized || !session) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      // ดึงข้อมูล farmer จาก session
      const farmerData = session.user.roleData;

      if (!farmerData) {
        return NextResponse.json(
          { message: "ไม่พบข้อมูลโปรไฟล์เกษตรกรในระบบ" },
          { status: 404 }
        );
      }

      return NextResponse.json(farmerData, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async getFarmerProfile(
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

      const farmer = await this.farmerService.getFarmerByUserId(userId);

      if (!farmer) {
        return NextResponse.json(
          {
            message:
              "ไม่พบข้อมูลโปรไฟล์เกษตรกรในระบบ กรุณาติดต่อเจ้าหน้าที่หากพบปัญหา",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(farmer.toJSON(), { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async updateFarmerProfile(
    req: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      // แปลง farmerId จาก string เป็น number
      let farmerId: number;
      try {
        farmerId = requireValidId(params.id, "farmerId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const data = await req.json();
      const { version, ...updateData } = data;

      // If updating ID number, validate it
      if (updateData.identificationNumber) {
        const isValidID = await this.farmerService.validateIdentificationNumber(
          updateData.identificationNumber
        );
        if (!isValidID) {
          return NextResponse.json(
            {
              message:
                "หมายเลขบัตรประจำตัวประชาชนไม่ถูกต้อง กรุณาตรวจสอบและกรอกใหม่ให้ถูกต้อง",
            },
            { status: 400 }
          );
        }
      }

      const updatedFarmer = await this.farmerService.updateFarmerProfile(
        farmerId,
        updateData,
        version
      );

      if (!updatedFarmer) {
        return NextResponse.json(
          {
            message:
              "ไม่พบข้อมูลเกษตรกรหรือไม่สามารถปรับปรุงข้อมูลได้ กรุณาติดต่อเจ้าหน้าที่หากพบปัญหา",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedFarmer.toJSON(), { status: 200 });
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

  async getFarmersByDistrict(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const district = searchParams.get("district");

      if (!district) {
        return NextResponse.json(
          {
            message:
              "กรุณาระบุอำเภอให้ครบถ้วน เพื่อดำเนินการค้นหาข้อมูลเกษตรกร",
          },
          { status: 400 }
        );
      }

      const farmers = await this.farmerService.getFarmersByDistrict(district);
      const farmersJson = farmers.map((farmer) => farmer.toJSON());

      return NextResponse.json(farmersJson, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async getFarmersByProvince(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const province = searchParams.get("province");

      if (!province) {
        return NextResponse.json(
          {
            message:
              "กรุณาระบุจังหวัดให้ครบถ้วน เพื่อดำเนินการค้นหาข้อมูลเกษตรกร",
          },
          { status: 400 }
        );
      }

      const farmers = await this.farmerService.getFarmersByProvince(province);
      const farmersJson = farmers.map((farmer) => farmer.toJSON());

      return NextResponse.json(farmersJson, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  protected async createModel(data: any): Promise<FarmerModel> {
    const birthDate = data.birthDate ? new Date(data.birthDate) : new Date();

    return FarmerModel.createFarmer(
      data.email,
      data.password,
      data.namePrefix || "",
      data.firstName,
      data.lastName,
      data.identificationNumber,
      birthDate,
      data.gender || "",
      data.houseNo || "",
      data.villageName || "",
      Number(data.moo) || 0,
      data.road || "",
      data.alley || "",
      data.subDistrict,
      data.district,
      data.provinceName,
      data.zipCode,
      data.phoneNumber || "",
      data.mobilePhoneNumber
    );
  }
}
