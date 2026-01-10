import {
  adminMapper,
  adviceAndDefectMapper,
  auditLogMapper,
  auditorInspectionMapper,
  auditorMapper,
  certificateMapper,
  committeeMapper,
  dataRecordMapper,
  farmerMapper,
  fileMapper,
  inspectionItemMapper,
  inspectionMapper,
  inspectionTypeMasterMapper,
  plantingDetailMapper,
  requirementMapper,
  rubberFarmMapper,
  userMapper,
} from "../mappers";

import { AdminRepository } from "@/repositories/AdminRepository";
import { AdviceAndDefectRepository } from "@/repositories/AdviceAndDefectRepository";
import { AuditLogRepository } from "@/repositories/AuditLogRepository";
import { AuditorInspectionRepository } from "@/repositories/AuditorInspectionRepository";
import { AuditorRepository } from "@/repositories/AuditorRepository";
import { CertificateRepository } from "@/repositories/CertificateRepository";
import { CommitteeRepository } from "@/repositories/CommitteeRepository";
import { DataRecordRepository } from "@/repositories/DataRecordRepository";
import { FarmerRepository } from "@/repositories/FarmerRepository";
import { FileRepository } from "@/repositories/FileRepository";
import { InspectionItemRepository } from "@/repositories/InspectionItemRepository";
import { InspectionRepository } from "@/repositories/InspectionRepository";
import { InspectionTypeMasterRepository } from "@/repositories/InspectionTypeMasterRepository";
import { PlantingDetailRepository } from "@/repositories/PlantingDetailRepository";
import { RequirementRepository } from "@/repositories/RequirementRepository";
import { RubberFarmRepository } from "@/repositories/RubberFarmRepository";
import { UserRepository } from "@/repositories/UserRepository";

import { UserRegistrationFactoryService } from "@/services/UserRegistrationFactoryService";
import { AdminService } from "@/services/AdminService";
import { AdviceAndDefectService } from "@/services/AdviceAndDefectService";
import { AuditLogService } from "@/services/AuditLogService";
import { AuditorInspectionService } from "@/services/AuditorInspectionService";
import { AuditorService } from "@/services/AuditorService";
import { CertificateService } from "@/services/CertificateService";
import { CommitteeService } from "@/services/CommitteeService";
import { DataRecordService } from "@/services/DataRecordService";
import { FarmerService } from "@/services/FarmerService";
import { FileService } from "@/services/FileService";
import { InspectionItemService } from "@/services/InspectionItemService";
import { InspectionService } from "@/services/InspectionService";
import { PlantingDetailService } from "@/services/PlantingDetailService";
import { RequirementService } from "@/services/RequirementService";
import { RubberFarmService } from "@/services/RubberFarmService";
import { UserService } from "@/services/UserService";

import { AdminController } from "@/controllers/AdminController";
import { AdviceAndDefectController } from "@/controllers/AdviceAndDefectController";
import { AuditLogController } from "@/controllers/AuditLogController";
import { AuditorController } from "@/controllers/AuditorController";
import { AuditorInspectionController } from "@/controllers/AuditorInspectionController";
import { CertificateController } from "@/controllers/CertificateController";
import { CommitteeController } from "@/controllers/CommitteeController";
import { DataRecordController } from "@/controllers/DataRecordController";
import { FarmerController } from "@/controllers/FarmerController";
import { FileController } from "@/controllers/FileController";
import { InspectionController } from "@/controllers/InspectionController";
import { InspectionItemController } from "@/controllers/InspectionItemController";
import { PlantingDetailController } from "@/controllers/PlantingDetailController";
import { RequirementController } from "@/controllers/RequirementController";
import { RubberFarmController } from "@/controllers/RubberFarmController";
import { UserController } from "@/controllers/UserController";

// Repositories with mapper injection
const userRepository = new UserRepository(userMapper);
const farmerRepository = new FarmerRepository(farmerMapper);
const rubberFarmRepository = new RubberFarmRepository(rubberFarmMapper);
const plantingDetailRepository = new PlantingDetailRepository(
  plantingDetailMapper
);
const auditorRepository = new AuditorRepository(auditorMapper);
const committeeRepository = new CommitteeRepository(committeeMapper);
const adminRepository = new AdminRepository(adminMapper);
const inspectionRepository = new InspectionRepository(inspectionMapper);
const auditorInspectionRepository = new AuditorInspectionRepository(
  auditorInspectionMapper
);
const inspectionItemRepository = new InspectionItemRepository(
  inspectionItemMapper
);
const requirementRepository = new RequirementRepository(requirementMapper);
const dataRecordRepository = new DataRecordRepository(dataRecordMapper);
const adviceAndDefectRepository = new AdviceAndDefectRepository(
  adviceAndDefectMapper
);
const inspectionTypeMasterRepository = new InspectionTypeMasterRepository(
  inspectionTypeMasterMapper
);
const certificateRepository = new CertificateRepository(certificateMapper);
const fileRepository = new FileRepository(fileMapper);
const auditLogRepository = new AuditLogRepository(auditLogMapper);

// Services

const auditLogService = new AuditLogService(auditLogRepository);

const userService = new UserService(userRepository);
const farmerService = new FarmerService(
  farmerRepository,
  userService,
  auditLogService
);
const plantingDetailService = new PlantingDetailService(
  plantingDetailRepository,
  auditLogService
);
const rubberFarmService = new RubberFarmService(
  rubberFarmRepository,
  plantingDetailRepository,
  inspectionRepository,
  auditLogService
);
const auditorService = new AuditorService(
  auditorRepository,
  userService,
  farmerService,
  rubberFarmRepository,
  inspectionTypeMasterRepository,
  inspectionRepository,
  auditLogService
);
const committeeService = new CommitteeService(
  committeeRepository,
  userService,
  auditLogService
);
const adminService = new AdminService(
  adminRepository,
  userService,
  auditLogService
);
const inspectionService = new InspectionService(
  inspectionRepository,
  auditorInspectionRepository,
  inspectionItemRepository,
  dataRecordRepository,
  adviceAndDefectRepository,
  requirementRepository,
  auditorService,
  rubberFarmRepository,
  inspectionTypeMasterRepository,
  auditLogService
);
const auditorInspectionService = new AuditorInspectionService(
  auditorInspectionRepository
);
const inspectionItemService = new InspectionItemService(
  inspectionItemRepository,
  requirementRepository,
  auditLogService
);
const requirementService = new RequirementService(
  requirementRepository,
  auditLogService
);
const dataRecordService = new DataRecordService(
  dataRecordRepository,
  auditLogService
);
const adviceAndDefectService = new AdviceAndDefectService(
  adviceAndDefectRepository,
  auditLogService
);
const certificateService = new CertificateService(
  certificateRepository,
  auditLogService
);
const fileService = new FileService(fileRepository);
const userRegistrationFactoryService = new UserRegistrationFactoryService(
  farmerService,
  auditorService,
  committeeService,
  adminService
);

// Controllers
const userController = new UserController(
  userService,
  userRegistrationFactoryService
);
const farmerController = new FarmerController(farmerService);
const rubberFarmController = new RubberFarmController(rubberFarmService);
const plantingDetailController = new PlantingDetailController(
  plantingDetailService
);
const auditorController = new AuditorController(auditorService);
const committeeController = new CommitteeController(committeeService);
const adminController = new AdminController(adminService);
const inspectionController = new InspectionController(inspectionService);
const auditorInspectionController = new AuditorInspectionController(
  auditorInspectionService
);
const inspectionItemController = new InspectionItemController(
  inspectionItemService
);
const requirementController = new RequirementController(requirementService);
const dataRecordController = new DataRecordController(dataRecordService);
const adviceAndDefectController = new AdviceAndDefectController(
  adviceAndDefectService
);
const certificateController = new CertificateController(certificateService);
const fileController = new FileController(fileService);
const auditLogController = new AuditLogController(auditLogService);

// Export all instances
export {
  adminController,
  adminRepository,
  adminService,
  adviceAndDefectController,
  adviceAndDefectRepository,
  adviceAndDefectService,
  auditLogController,
  auditLogRepository,
  auditLogService,
  auditorController,
  auditorInspectionController,
  auditorInspectionRepository,
  auditorInspectionService,
  auditorRepository,
  auditorService,
  certificateController,
  certificateRepository,
  certificateService,
  committeeController,
  committeeRepository,
  committeeService,
  dataRecordController,
  dataRecordRepository,
  dataRecordService,
  farmerController,
  farmerRepository,
  farmerService,
  fileController,
  fileRepository,
  fileService,
  inspectionController,
  inspectionItemController,
  inspectionItemRepository,
  inspectionItemService,
  inspectionRepository,
  inspectionService,
  inspectionTypeMasterRepository,
  plantingDetailController,
  plantingDetailRepository,
  plantingDetailService,
  requirementController,
  requirementRepository,
  requirementService,
  rubberFarmController,
  rubberFarmRepository,
  rubberFarmService,
  userController,
  userRepository,
  userService,
  userRegistrationFactoryService,
};
