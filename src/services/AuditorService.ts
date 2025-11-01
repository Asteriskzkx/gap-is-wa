import { InspectionRepository } from "@/repositories/InspectionRepository";
import { AuditorModel } from "../models/AuditorModel";
import { AuditorRepository } from "../repositories/AuditorRepository";
import { InspectionTypeMasterRepository } from "../repositories/InspectionTypeMasterRepository"; // เพิ่มการนำเข้า
import { RubberFarmRepository } from "../repositories/RubberFarmRepository"; // เพิ่มการนำเข้า
import { BaseService } from "./BaseService";
import { FarmerService } from "./FarmerService";
import { UserService } from "./UserService";

export class AuditorService extends BaseService<AuditorModel> {
  private auditorRepository: AuditorRepository;
  private userService: UserService;
  private farmerService: FarmerService;
  private rubberFarmRepository: RubberFarmRepository;
  private inspectionTypeMasterRepository: InspectionTypeMasterRepository;
  private inspectionRepository: InspectionRepository;

  constructor(
    auditorRepository: AuditorRepository,
    userService: UserService,
    farmerService: FarmerService,
    rubberFarmRepository: RubberFarmRepository,
    inspectionTypeMasterRepository: InspectionTypeMasterRepository,
    inspectionRepository: InspectionRepository
  ) {
    super(auditorRepository);
    this.auditorRepository = auditorRepository;
    this.userService = userService;
    this.farmerService = farmerService;
    this.rubberFarmRepository = rubberFarmRepository;
    this.inspectionTypeMasterRepository = inspectionTypeMasterRepository;
    this.inspectionRepository = inspectionRepository;
  }

  async login(
    email: string,
    password: string
  ): Promise<{ auditor: AuditorModel } | null> {
    try {
      // First authenticate using UserService
      const userResult = await this.userService.login(email, password);
      if (!userResult) {
        return null;
      }

      // Check if the user is an auditor
      const { user } = userResult;
      if (user.role !== "AUDITOR") {
        return null;
      }

      // Get auditor profile
      const auditor = await this.auditorRepository.findByUserId(user.id);
      if (!auditor) {
        return null;
      }

      return { auditor };
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async registerAuditor(auditorData: {
    email: string;
    password: string;
    namePrefix: string;
    firstName: string;
    lastName: string;
  }): Promise<AuditorModel> {
    try {
      // Check if user already exists
      const existingUser = await this.userService.findByEmail(
        auditorData.email
      );
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Create new auditor
      const auditorModel = await AuditorModel.createAuditor(
        auditorData.email,
        auditorData.password,
        auditorData.namePrefix,
        auditorData.firstName,
        auditorData.lastName
      );

      return await this.create(auditorModel);
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getAuditorByUserId(userId: number): Promise<AuditorModel | null> {
    // เปลี่ยนจาก string เป็น number
    try {
      return await this.auditorRepository.findByUserId(userId);
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async updateAuditorProfile(
    auditorId: number,
    data: Partial<AuditorModel>
  ): Promise<AuditorModel | null> {
    // เปลี่ยนจาก string เป็น number
    try {
      // If updating email, check if it's already in use
      if (data.email) {
        const existingUser = await this.userService.findByEmail(data.email);
        if (existingUser && existingUser.id !== data.id) {
          throw new Error("Email is already in use by another account");
        }
      }

      return await this.update(auditorId, data);
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  // Additional auditor-specific business logic can be added here
  async assignAuditorToRegion(
    auditorId: number,
    region: string
  ): Promise<boolean> {
    // เปลี่ยนจาก string เป็น number
    // This would be implemented based on your specific business requirements
    // For now, returning a placeholder implementation
    try {
      console.log(`Assigning auditor ${auditorId} to region ${region}`);
      // In a real implementation, you would store this assignment in the database
      return true;
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }

  async getAuditorAssignments(auditorId: number): Promise<string[]> {
    // เปลี่ยนจาก string เป็น number
    // This would be implemented based on your specific business requirements
    // For now, returning a placeholder implementation
    try {
      console.log(`Getting assignments for auditor ${auditorId}`);
      // In a real implementation, you would fetch assignments from the database
      return ["Assignment 1", "Assignment 2"];
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  /**
   * ดึงรายการ rubber farm ที่พร้อมใช้งาน (ไม่มี inspection ที่รอการตรวจประเมิน)
   */
  async getAvailableRubberFarms(): Promise<any[]> {
    try {
      // ดึงข้อมูล rubber farm ทั้งหมดพร้อมรายละเอียดเกษตรกร
      const allRubberFarmsWithFarmers =
        await this.rubberFarmRepository.findAllWithFarmerDetails();

      // ดึงรายการ inspection ที่มีสถานะ "รอการตรวจประเมิน"
      const allInspections = await this.inspectionRepository.findAll();
      const pendingInspections = allInspections.filter(
        (inspection) => inspection.inspectionStatus === "รอการตรวจประเมิน"
      );

      // สร้าง Set ของ rubberFarmId ที่มี inspection รอการตรวจประเมิน
      const pendingFarmIds = new Set(
        pendingInspections.map((inspection) => inspection.rubberFarmId)
      );

      // กรองเฉพาะ rubber farm ที่ไม่มี inspection รอการตรวจประเมิน
      const availableFarms = allRubberFarmsWithFarmers.filter(
        (farm) => !pendingFarmIds.has(farm.rubberFarmId)
      );

      // แปลงข้อมูลให้เหมาะสมกับการแสดงผล
      return availableFarms.map((farm) => ({
        id: farm.rubberFarmId,
        farmerId: farm.farmerId,
        location: `${farm.villageName}, หมู่ ${farm.moo}, ${farm.subDistrict}, ${farm.district}, ${farm.province}`,
        address: {
          villageName: farm.villageName,
          moo: farm.moo,
          road: farm.road,
          alley: farm.alley,
          subDistrict: farm.subDistrict,
          district: farm.district,
          province: farm.province,
        },
        farmerName: farm.farmerDetails
          ? farm.farmerDetails.fullName
          : "Unknown",
        farmerEmail: farm.farmerDetails ? farm.farmerDetails.email : "N/A",
        isAvailable: true, // เพิ่มฟิลด์เพื่อระบุว่าพร้อมใช้งาน
      }));
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  /**
   * ตรวจสอบว่า rubber farm สามารถใช้งานได้หรือไม่
   * @param rubberFarmId - ID ของ rubber farm ที่ต้องการตรวจสอบ
   * @returns true หากพร้อมใช้งาน, false หากมี inspection รอการตรวจประเมิน
   */
  async isFarmAvailable(rubberFarmId: number): Promise<boolean> {
    try {
      // ตรวจสอบว่ามี inspection ที่รอการตรวจประเมินสำหรับ farm นี้หรือไม่
      const farmInspections =
        await this.inspectionRepository.findByRubberFarmId(rubberFarmId);
      const pendingInspection = farmInspections.find(
        (inspection) => inspection.inspectionStatus === "รอการตรวจประเมิน"
      );

      return !pendingInspection; // return true หากไม่มี pending inspection
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }

  async getInspectionTypes(): Promise<any[]> {
    try {
      // ดึงข้อมูลประเภทการตรวจประเมินทั้งหมดผ่าน Repository
      const inspectionTypes =
        await this.inspectionTypeMasterRepository.findAll();
      return inspectionTypes;
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  async getAuditorListExcept(exceptAuditorId: number): Promise<any[]> {
    try {
      // ดึงรายชื่อ auditor ทั้งหมดยกเว้น auditor ที่ระบุผ่าน Repository
      const allAuditors = await this.auditorRepository.findAll();

      // กรองเฉพาะ auditor ที่ไม่ตรงกับ exceptAuditorId
      const filteredAuditors = allAuditors.filter(
        (auditor) => auditor.auditorId !== exceptAuditorId
      );

      return filteredAuditors.map((auditor) => ({
        id: auditor.auditorId,
        name: `${auditor.namePrefix}${auditor.firstName} ${auditor.lastName}`,
        email: auditor.email || "N/A",
      }));
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }
}
