import { UserRepository } from '@/repositories/UserRepository';
import { FarmerRepository } from '@/repositories/FarmerRepository';
import { AuditorRepository } from '@/repositories/AuditorRepository';
import { CommitteeRepository } from '@/repositories/CommitteeRepository';
import { AdminRepository } from '@/repositories/AdminRepository';

import { UserService } from '@/services/UserService';
import { FarmerService } from '@/services/FarmerService';
import { AuditorService } from '@/services/AuditorService';
import { CommitteeService } from '@/services/CommitteeService';
import { AdminService } from '@/services/AdminService';

import { UserController } from '@/controllers/UserController';
import { FarmerController } from '@/controllers/FarmerController';
import { AuditorController } from '@/controllers/AuditorController';
import { CommitteeController } from '@/controllers/CommitteeController';
import { AdminController } from '@/controllers/AdminController';

// Repositories
const userRepository = new UserRepository();
const farmerRepository = new FarmerRepository();
const auditorRepository = new AuditorRepository();
const committeeRepository = new CommitteeRepository();
const adminRepository = new AdminRepository();

// Services
const userService = new UserService(userRepository);
const farmerService = new FarmerService(farmerRepository, userService);
const auditorService = new AuditorService(auditorRepository, userService);
const committeeService = new CommitteeService(committeeRepository, userService);
const adminService = new AdminService(adminRepository, userService);

// Controllers
const userController = new UserController(userService);
const farmerController = new FarmerController(farmerService);
const auditorController = new AuditorController(auditorService);
const committeeController = new CommitteeController(committeeService);
const adminController = new AdminController(adminService);

// Export all instances
export {
    // Repositories
    userRepository,
    farmerRepository,
    auditorRepository,
    committeeRepository,
    adminRepository,

    // Services
    userService,
    farmerService,
    auditorService,
    committeeService,
    adminService,

    // Controllers
    userController,
    farmerController,
    auditorController,
    committeeController,
    adminController
};