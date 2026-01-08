import { UserRole } from "@/models/UserModel";
import { AdminService } from "./AdminService";
import { AuditorService } from "./AuditorService";
import { CommitteeService } from "./CommitteeService";
import { FarmerService } from "./FarmerService";

interface UserRegistrationData {
  role: UserRole;
  [key: string]: any;
}

export class UserRegistrationFactoryService {
  constructor(
    private farmerService: FarmerService,
    private auditorService: AuditorService,
    private committeeService: CommitteeService,
    private adminService: AdminService
  ) {}

  async createUserWithRole(data: any): Promise<any> {
    if (!data.role) {
      throw new Error("Role is required to create user with specific role");
    }

    switch (data.role) {
      case UserRole.FARMER:
        return await this.farmerService.registerFarmer({
          ...data,
          requirePasswordChange: true, // Admin สร้างให้บังคับเปลี่ยน password
        });
      case UserRole.AUDITOR:
        return await this.auditorService.registerAuditor(data);
      case UserRole.COMMITTEE:
        return await this.committeeService.registerCommittee(data);
      case UserRole.ADMIN:
        return await this.adminService.registerAdmin(data);
      case UserRole.BASIC:
        throw new Error("Basic users should be registered via UserService");
      default:
        throw new Error(`Unsupported role: ${data.role}`);
    }
  }
}
