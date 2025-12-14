import { InspectionRepository } from "@/repositories/InspectionRepository";
import { AuditorModel } from "../models/AuditorModel";
import { AuditorRepository } from "../repositories/AuditorRepository";
import { InspectionTypeMasterRepository } from "../repositories/InspectionTypeMasterRepository"; // เพิ่มการนำเข้า
import { RubberFarmRepository } from "../repositories/RubberFarmRepository"; // เพิ่มการนำเข้า
import { BaseService } from "./BaseService";
import { FarmerService } from "./FarmerService";
import { UserService } from "./UserService";

export class AuditorService extends BaseService<AuditorModel> {
  private readonly auditorRepository: AuditorRepository;
  private readonly userService: UserService;
  private readonly farmerService: FarmerService;
  private readonly rubberFarmRepository: RubberFarmRepository;
  private readonly inspectionTypeMasterRepository: InspectionTypeMasterRepository;
  private readonly inspectionRepository: InspectionRepository;

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
    password?: string;
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

      if (!auditorData.password) {
        const generatedPassword = process.env.DEFAULT_PASSWORD;
        if (!generatedPassword) {
          throw new Error("DEFAULT_PASSWORD is not configured in environment");
        }
        auditorData.password = generatedPassword;
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
    data: Partial<AuditorModel>,
    currentVersion?: number
  ): Promise<AuditorModel | null> {
    try {
      // If updating email, check if it's already in use by another account
      if (data.email) {
        // First, get the current auditor to find the associated userId
        const currentAuditor = await this.auditorRepository.findById(auditorId);
        if (!currentAuditor) {
          return null;
        }

        const existingUser = await this.userService.findByEmail(data.email);
        // Only throw error if email belongs to a different user (currentAuditor.id is userId from BaseModel)
        if (existingUser && existingUser.id !== currentAuditor.id) {
          throw new Error("Email is already in use by another account");
        }
      }

      if (currentVersion !== undefined) {
        // Use optimistic locking
        return await this.auditorRepository.updateWithLock(
          auditorId,
          data,
          currentVersion
        );
      } else {
        // Fallback to regular update
        return await this.update(auditorId, data);
      }
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  /**
   * ดึงรายการ rubber farm ที่พร้อมใช้งาน (ไม่มี inspection ที่รอการตรวจประเมิน)
   * พร้อมรองรับการค้นหาและเรียงลำดับ
   */
  async getAvailableRubberFarms(options?: {
    province?: string;
    district?: string;
    subDistrict?: string;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    multiSortMeta?: Array<{ field: string; order: 1 | -1 }>;
    limit?: number;
    offset?: number;
  }): Promise<{ data: any[]; total: number }> {
    try {
      // ดึงข้อมูล rubber farm ทั้งหมดพร้อมรายละเอียดเกษตรกร
      const allRubberFarmsWithFarmers =
        await this.rubberFarmRepository.findAllWithFarmerDetails();

      // ดึงรายการ inspection ทั้งหมด
      const allInspections = await this.inspectionRepository.findAll();
      // พิจารณาว่าเป็น inspection ที่ทำให้ฟาร์มไม่พร้อมใช้งานได้เมื่อ
      // - สถานะเป็น "รอการตรวจประเมิน"
      // OR
      // - สถานะเป็น "ตรวจประเมินแล้ว" และผลการตรวจเป็น "ผ่าน" (ผ่านการรับรองแล้ว)
      const pendingInspections = allInspections.filter((inspection) => {
        return (
          inspection.inspectionStatus === "รอการตรวจประเมิน" ||
          (inspection.inspectionStatus === "ตรวจประเมินแล้ว" &&
            inspection.inspectionResult === "ผ่าน")
        );
      });

      // สร้าง Set ของ rubberFarmId ที่มี inspection รอการตรวจประเมิน
      const pendingFarmIds = new Set(
        pendingInspections.map((inspection) => inspection.rubberFarmId)
      );

      // กรองเฉพาะ rubber farm ที่ไม่มี inspection รอการตรวจประเมิน
      let availableFarms = allRubberFarmsWithFarmers.filter(
        (farm) => !pendingFarmIds.has(farm.rubberFarmId)
      );

      // แปลงข้อมูลให้เหมาะสมกับการแสดงผล
      let transformedFarms = availableFarms.map((farm) => ({
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
        province: farm.province,
        district: farm.district,
        subDistrict: farm.subDistrict,
        farmerName: farm.farmerDetails
          ? farm.farmerDetails.fullName
          : "Unknown",
        farmerEmail: farm.farmerDetails ? farm.farmerDetails.email : "N/A",
        isAvailable: true,
      }));

      // กรองตามเงื่อนไขการค้นหา
      if (options?.province) {
        transformedFarms = transformedFarms.filter((farm) =>
          farm.province.includes(options.province!)
        );
      }
      if (options?.district) {
        transformedFarms = transformedFarms.filter((farm) =>
          farm.district.includes(options.district!)
        );
      }
      if (options?.subDistrict) {
        transformedFarms = transformedFarms.filter((farm) =>
          farm.subDistrict.includes(options.subDistrict!)
        );
      }

      // เรียงลำดับข้อมูล
      if (options?.multiSortMeta && options.multiSortMeta.length > 0) {
        // Multi-sort
        transformedFarms.sort((a: any, b: any) => {
          for (const sortMeta of options.multiSortMeta!) {
            const field = sortMeta.field;
            const order = sortMeta.order;
            const aVal = this.getNestedValue(a, field);
            const bVal = this.getNestedValue(b, field);

            if (aVal < bVal) return -1 * order;
            if (aVal > bVal) return 1 * order;
          }
          return 0;
        });
      } else if (options?.sortField && options?.sortOrder) {
        // Single sort
        transformedFarms.sort((a: any, b: any) => {
          const aVal = this.getNestedValue(a, options.sortField!);
          const bVal = this.getNestedValue(b, options.sortField!);

          if (aVal < bVal) return options.sortOrder === "asc" ? -1 : 1;
          if (aVal > bVal) return options.sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }

      // คำนวณ pagination
      const total = transformedFarms.length;
      const offset = options?.offset ?? 0;
      const limit = options?.limit ?? 10;
      const paginatedFarms = transformedFarms.slice(offset, offset + limit);

      return {
        data: paginatedFarms,
        total,
      };
    } catch (error) {
      this.handleServiceError(error);
      return { data: [], total: 0 };
    }
  }

  /**
   * Helper function เพื่อดึงค่าจาก nested object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
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

  async getAuditorListExcept(
    exceptAuditorId: number,
    options?: {
      limit?: number;
      offset?: number;
      search?: string;
      sortField?: string;
      sortOrder?: "asc" | "desc";
      multiSortMeta?: Array<{ field: string; order: 1 | -1 }>;
    }
  ): Promise<{ data: any[]; total: number }> {
    try {
      // ดึงรายชื่อ auditor ทั้งหมดยกเว้น auditor ที่ระบุผ่าน Repository
      const allAuditors = await this.auditorRepository.findAll();

      // กรองเฉพาะ auditor ที่ไม่ตรงกับ exceptAuditorId
      let filteredAuditors = allAuditors.filter(
        (auditor) => auditor.auditorId !== exceptAuditorId
      );

      // แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้งาน
      let transformedAuditors = filteredAuditors.map((auditor) => ({
        id: auditor.auditorId,
        name: `${auditor.namePrefix}${auditor.firstName} ${auditor.lastName}`,
        email: auditor.email || "N/A",
        namePrefix: auditor.namePrefix,
        firstName: auditor.firstName,
        lastName: auditor.lastName,
      }));

      // กรองตามการค้นหา
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        transformedAuditors = transformedAuditors.filter(
          (auditor) =>
            auditor.name.toLowerCase().includes(searchLower) ||
            auditor.email.toLowerCase().includes(searchLower) ||
            auditor.firstName.toLowerCase().includes(searchLower) ||
            auditor.lastName.toLowerCase().includes(searchLower)
        );
      }

      // เรียงลำดับข้อมูล
      if (options?.multiSortMeta && options.multiSortMeta.length > 0) {
        // Multi-sort
        transformedAuditors.sort((a: any, b: any) => {
          for (const sortMeta of options.multiSortMeta!) {
            const field = sortMeta.field;
            const order = sortMeta.order;
            const aVal = this.getNestedValue(a, field);
            const bVal = this.getNestedValue(b, field);

            if (aVal < bVal) return -1 * order;
            if (aVal > bVal) return 1 * order;
          }
          return 0;
        });
      } else if (options?.sortField && options?.sortOrder) {
        // Single sort
        transformedAuditors.sort((a: any, b: any) => {
          const aVal = this.getNestedValue(a, options.sortField!);
          const bVal = this.getNestedValue(b, options.sortField!);

          if (aVal < bVal) return options.sortOrder === "asc" ? -1 : 1;
          if (aVal > bVal) return options.sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }

      // คำนวณ pagination
      const total = transformedAuditors.length;
      const offset = options?.offset ?? 0;
      const limit = options?.limit ?? 10;
      const paginatedAuditors = transformedAuditors.slice(
        offset,
        offset + limit
      );

      return {
        data: paginatedAuditors,
        total,
      };
    } catch (error) {
      this.handleServiceError(error);
      return { data: [], total: 0 };
    }
  }
}
