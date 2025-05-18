import { UserMapper } from "./UserMapper";
import { FarmerMapper } from "./FarmerMapper";
import { AuditorMapper } from "./AuditorMapper";
import { CommitteeMapper } from "./CommitteeMapper";
import { AdminMapper } from "./AdminMapper";
import { RubberFarmMapper } from "./RubberFarmMapper";
import { PlantingDetailMapper } from "./PlantingDetailMapper";
import { InspectionMapper } from "./InspectionMapper";
import { AuditorInspectionMapper } from "./AuditorInspectionMapper";
import { InspectionItemMapper } from "./InspectionItemMapper";
import { RequirementMapper } from "./RequirementMapper";
import { DataRecordMapper } from "./DataRecordMapper";
import { AdviceAndDefectMapper } from "./AdviceAndDefectMapper";

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

export {
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
};
