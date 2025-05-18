import {
  userMapper,
  farmerMapper,
  auditorMapper,
  committeeMapper,
  adminMapper,
  rubberFarmMapper,
  plantingDetailMapper,
  inspectionMapper,
  auditorInspectionMapper,
  inspectionItemMapper,
  requirementMapper,
  dataRecordMapper,
  adviceAndDefectMapper,
} from "../mappers";

import { UserRepository } from "@/repositories/UserRepository";
import { FarmerRepository } from "@/repositories/FarmerRepository";
import { RubberFarmRepository } from "@/repositories/RubberFarmRepository";
import { PlantingDetailRepository } from "@/repositories/PlantingDetailRepository";
import { AuditorRepository } from "@/repositories/AuditorRepository";
import { CommitteeRepository } from "@/repositories/CommitteeRepository";
import { AdminRepository } from "@/repositories/AdminRepository";
import { InspectionRepository } from "@/repositories/InspectionRepository";
import { AuditorInspectionRepository } from "@/repositories/AuditorInspectionRepository";
import { InspectionItemRepository } from "@/repositories/InspectionItemRepository";
import { RequirementRepository } from "@/repositories/RequirementRepository";
import { DataRecordRepository } from "@/repositories/DataRecordRepository";
import { AdviceAndDefectRepository } from "@/repositories/AdviceAndDefectRepository";

import { UserService } from "@/services/UserService";
import { FarmerService } from "@/services/FarmerService";
import { RubberFarmService } from "@/services/RubberFarmService";
import { PlantingDetailService } from "@/services/PlantingDetailService";
import { AuditorService } from "@/services/AuditorService";
import { CommitteeService } from "@/services/CommitteeService";
import { AdminService } from "@/services/AdminService";
import { InspectionService } from "@/services/InspectionService";
import { AuditorInspectionService } from "@/services/AuditorInspectionService";
import { InspectionItemService } from "@/services/InspectionItemService";
import { RequirementService } from "@/services/RequirementService";
import { DataRecordService } from "@/services/DataRecordService";
import { AdviceAndDefectService } from "@/services/AdviceAndDefectService";

import { UserController } from "@/controllers/UserController";
import { FarmerController } from "@/controllers/FarmerController";
import { RubberFarmController } from "@/controllers/RubberFarmController";
import { PlantingDetailController } from "@/controllers/PlantingDetailController";
import { AuditorController } from "@/controllers/AuditorController";
import { CommitteeController } from "@/controllers/CommitteeController";
import { AdminController } from "@/controllers/AdminController";
import { InspectionController } from "@/controllers/InspectionController";
import { AuditorInspectionController } from "@/controllers/AuditorInspectionController";
import { InspectionItemController } from "@/controllers/InspectionItemController";
import { RequirementController } from "@/controllers/RequirementController";
import { DataRecordController } from "@/controllers/DataRecordController";
import { AdviceAndDefectController } from "@/controllers/AdviceAndDefectController";

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

// Repositories
// const userRepository = new UserRepository();
// const farmerRepository = new FarmerRepository();
// const rubberFarmRepository = new RubberFarmRepository();
// const plantingDetailRepository = new PlantingDetailRepository();
// const auditorRepository = new AuditorRepository();
// const committeeRepository = new CommitteeRepository();
// const adminRepository = new AdminRepository();
// const inspectionRepository = new InspectionRepository();
// const auditorInspectionRepository = new AuditorInspectionRepository();
// const inspectionItemRepository = new InspectionItemRepository();
// const requirementRepository = new RequirementRepository();
// const dataRecordRepository = new DataRecordRepository();
// const adviceAndDefectRepository = new AdviceAndDefectRepository();

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
const auditorService = new AuditorService(auditorRepository, userService);
const committeeService = new CommitteeService(committeeRepository, userService);
const adminService = new AdminService(adminRepository, userService);
const inspectionService = new InspectionService(
  inspectionRepository,
  auditorInspectionRepository,
  inspectionItemRepository,
  dataRecordRepository,
  adviceAndDefectRepository,
  auditorService
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
  // Repositories
  userRepository,
  farmerRepository,
  rubberFarmRepository,
  plantingDetailRepository,
  auditorRepository,
  committeeRepository,
  adminRepository,
  inspectionRepository,
  auditorInspectionRepository,
  inspectionItemRepository,
  requirementRepository,
  dataRecordRepository,
  adviceAndDefectRepository,

  // Services
  userService,
  farmerService,
  rubberFarmService,
  plantingDetailService,
  auditorService,
  committeeService,
  adminService,
  inspectionService,
  auditorInspectionService,
  inspectionItemService,
  requirementService,
  dataRecordService,
  adviceAndDefectService,

  // Controllers
  userController,
  farmerController,
  rubberFarmController,
  plantingDetailController,
  auditorController,
  committeeController,
  adminController,
  inspectionController,
  auditorInspectionController,
  inspectionItemController,
  requirementController,
  dataRecordController,
  adviceAndDefectController,
};
