import { UserRepository } from '@/repositories/UserRepository';
import { FarmerRepository } from '@/repositories/FarmerRepository';
import { RubberFarmRepository } from '@/repositories/RubberFarmRepository';
import { PlantingDetailRepository } from '@/repositories/PlantingDetailRepository';
import { AuditorRepository } from '@/repositories/AuditorRepository';
import { CommitteeRepository } from '@/repositories/CommitteeRepository';
import { AdminRepository } from '@/repositories/AdminRepository';


import { UserService } from '@/services/UserService';
import { FarmerService } from '@/services/FarmerService';
import { RubberFarmService } from '@/services/RubberFarmService';
import { PlantingDetailService } from '@/services/PlantingDetailService';
import { AuditorService } from '@/services/AuditorService';
import { CommitteeService } from '@/services/CommitteeService';
import { AdminService } from '@/services/AdminService';


import { UserController } from '@/controllers/UserController';
import { FarmerController } from '@/controllers/FarmerController';
import { RubberFarmController } from '@/controllers/RubberFarmController';
import { PlantingDetailController } from '@/controllers/PlantingDetailController';
import { AuditorController } from '@/controllers/AuditorController';
import { CommitteeController } from '@/controllers/CommitteeController';
import { AdminController } from '@/controllers/AdminController';

// Repositories
const userRepository = new UserRepository();
const farmerRepository = new FarmerRepository();
const rubberFarmRepository = new RubberFarmRepository();
const plantingDetailRepository = new PlantingDetailRepository();
const auditorRepository = new AuditorRepository();
const committeeRepository = new CommitteeRepository();
const adminRepository = new AdminRepository();

// Services
const userService = new UserService(userRepository);
const farmerService = new FarmerService(farmerRepository, userService);
const plantingDetailService = new PlantingDetailService(plantingDetailRepository);
const rubberFarmService = new RubberFarmService(rubberFarmRepository, plantingDetailRepository);
const auditorService = new AuditorService(auditorRepository, userService);
const committeeService = new CommitteeService(committeeRepository, userService);
const adminService = new AdminService(adminRepository, userService);

// Controllers
const userController = new UserController(userService);
const farmerController = new FarmerController(farmerService);
const rubberFarmController = new RubberFarmController(rubberFarmService);
const plantingDetailController = new PlantingDetailController(plantingDetailService);
const auditorController = new AuditorController(auditorService);
const committeeController = new CommitteeController(committeeService);
const adminController = new AdminController(adminService);

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

    // Services
    userService,
    farmerService,
    rubberFarmService,
    plantingDetailService,
    auditorService,
    committeeService,
    adminService,

    // Controllers
    userController,
    farmerController,
    rubberFarmController,
    plantingDetailController,
    auditorController,
    committeeController,
    adminController
};