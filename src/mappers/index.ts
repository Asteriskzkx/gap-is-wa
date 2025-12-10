import { AdminMapper } from "./AdminMapper";
import { AdviceAndDefectMapper } from "./AdviceAndDefectMapper";
import { AuditLogMapper } from "./AuditLogMapper";
import { AuditorInspectionMapper } from "./AuditorInspectionMapper";
import { AuditorMapper } from "./AuditorMapper";
import { CertificateMapper } from "./CertificateMapper";
import { CommitteeMapper } from "./CommitteeMapper";
import { DataRecordMapper } from "./DataRecordMapper";
import { FarmerMapper } from "./FarmerMapper";
import { FileMapper } from "./FileMapper";
import { InspectionItemMapper } from "./InspectionItemMapper";
import { InspectionMapper } from "./InspectionMapper";
import { InspectionTypeMasterMapper } from "./InspectionTypeMasterMapper";
import { PlantingDetailMapper } from "./PlantingDetailMapper";
import { RequirementMapper } from "./RequirementMapper";
import { RubberFarmMapper } from "./RubberFarmMapper";
import { UserMapper } from "./UserMapper";

// Initialize mappers
const userMapper = new UserMapper();
const plantingDetailMapper = new PlantingDetailMapper();
const requirementMapper = new RequirementMapper();
const dataRecordMapper = new DataRecordMapper();
const adviceAndDefectMapper = new AdviceAndDefectMapper();
const auditorInspectionMapper = new AuditorInspectionMapper();
const inspectionItemMapper = new InspectionItemMapper(requirementMapper);
const farmerMapper = new FarmerMapper(userMapper);
const auditorMapper = new AuditorMapper(userMapper);
const committeeMapper = new CommitteeMapper(userMapper);
const adminMapper = new AdminMapper(userMapper);
const rubberFarmMapper = new RubberFarmMapper(plantingDetailMapper);
const inspectionMapper = new InspectionMapper(
  auditorInspectionMapper,
  inspectionItemMapper,
  dataRecordMapper,
  adviceAndDefectMapper
);
const inspectionTypeMasterMapper = new InspectionTypeMasterMapper();
const certificateMapper = new CertificateMapper();
const fileMapper = new FileMapper();
const auditLogMapper = new AuditLogMapper();

export {
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
};
