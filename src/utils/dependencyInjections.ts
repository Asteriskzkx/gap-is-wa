import {
  adminMapper,
  adviceAndDefectMapper,
  auditorInspectionMapper,
  auditorMapper,
  committeeMapper,
  dataRecordMapper,
  farmerMapper,
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
import { AuditorInspectionRepository } from "@/repositories/AuditorInspectionRepository";
import { AuditorRepository } from "@/repositories/AuditorRepository";
import { CommitteeRepository } from "@/repositories/CommitteeRepository";
import { DataRecordRepository } from "@/repositories/DataRecordRepository";
import { FarmerRepository } from "@/repositories/FarmerRepository";
import { InspectionItemRepository } from "@/repositories/InspectionItemRepository";
import { InspectionRepository } from "@/repositories/InspectionRepository";
import { InspectionTypeMasterRepository } from "@/repositories/InspectionTypeMasterRepository";
import { PlantingDetailRepository } from "@/repositories/PlantingDetailRepository";
import { RequirementRepository } from "@/repositories/RequirementRepository";
import { RubberFarmRepository } from "@/repositories/RubberFarmRepository";
import { UserRepository } from "@/repositories/UserRepository";

import { AdminService } from "@/services/AdminService";
import { AdviceAndDefectService } from "@/services/AdviceAndDefectService";
import { AuditorInspectionService } from "@/services/AuditorInspectionService";
import { AuditorService } from "@/services/AuditorService";
import { CommitteeService } from "@/services/CommitteeService";
import { DataRecordService } from "@/services/DataRecordService";
import { FarmerService } from "@/services/FarmerService";
import { InspectionItemService } from "@/services/InspectionItemService";
import { InspectionService } from "@/services/InspectionService";
import { PlantingDetailService } from "@/services/PlantingDetailService";
import { RequirementService } from "@/services/RequirementService";
import { RubberFarmService } from "@/services/RubberFarmService";
import { UserService } from "@/services/UserService";

import { AdminController } from "@/controllers/AdminController";
import { AdviceAndDefectController } from "@/controllers/AdviceAndDefectController";
import { AuditorController } from "@/controllers/AuditorController";
import { AuditorInspectionController } from "@/controllers/AuditorInspectionController";
import { CommitteeController } from "@/controllers/CommitteeController";
import { DataRecordController } from "@/controllers/DataRecordController";
import { FarmerController } from "@/controllers/FarmerController";
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

// Services
const userService = new UserService(userRepository);
const farmerService = new FarmerService(farmerRepository, userService);
const plantingDetailService = new PlantingDetailService(
  plantingDetailRepository
);
const rubberFarmService = new RubberFarmService(
  rubberFarmRepository,
  plantingDetailRepository
);
const auditorService = new AuditorService(
  auditorRepository,
  userService,
  farmerService, // เพิ่ม farmerService
  rubberFarmRepository,
  inspectionTypeMasterRepository
);
const committeeService = new CommitteeService(committeeRepository, userService);
const adminService = new AdminService(adminRepository, userService);
const inspectionService = new InspectionService(
  inspectionRepository,
  auditorInspectionRepository,
  inspectionItemRepository,
  dataRecordRepository,
  adviceAndDefectRepository,
  requirementRepository,
  auditorService,
  rubberFarmRepository,
  inspectionTypeMasterRepository
);
const auditorInspectionService = new AuditorInspectionService(
  auditorInspectionRepository
);
const inspectionItemService = new InspectionItemService(
  inspectionItemRepository,
  requirementRepository
);
const requirementService = new RequirementService(requirementRepository);
const dataRecordService = new DataRecordService(dataRecordRepository);
const adviceAndDefectService = new AdviceAndDefectService(
  adviceAndDefectRepository
);

// Controllers
const userController = new UserController(userService);
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

// Export all instances
export {
  adminController,
  adminRepository,
  adminService,
  adviceAndDefectController,
  adviceAndDefectRepository,
  adviceAndDefectService,
  auditorController,
  auditorInspectionController,
  auditorInspectionRepository,
  auditorInspectionService,
  auditorRepository,
  auditorService,
  committeeController,
  committeeRepository,
  committeeService,
  dataRecordController,
  dataRecordRepository,
  dataRecordService,
  farmerController,
  farmerRepository,
  farmerService,
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
  // Controllers
  userController,
  // Repositories
  userRepository,
  // Services
  userService,
};
