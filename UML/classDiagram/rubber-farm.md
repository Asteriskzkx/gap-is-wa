# RubberFarm

```mermaid
classDiagram

class BaseController~T~
class BaseService~T~
class BaseRepository~T~
class BaseModel
class AuditLogService
class PlantingDetailRepository
class InspectionRepository

class RubberFarmModel {
  -rubberFarmId: number
  -farmerId: number
  -villageName: string
  -moo: number
  -road: string
  -alley: string
  -subDistrict: string
  -district: string
  -province: string
  -location: any
  -productDistributionType: string
  -plantingDetails: any[]
  -version?: number
  +create(farmerId: number, villageName: string, moo: number, road: string, alley: string, subDistrict: string, district: string, province: string, location: any, productDistributionType: string): RubberFarmModel
  +validate(): boolean
  +toJSON(): object
}

class RubberFarmRepository {
  +create(model: RubberFarmModel): RubberFarmModel
  +findById(id: number): RubberFarmModel?
  +findByFarmerId(farmerId: number): RubberFarmModel[]
  +findByRubberFarmId(rubberFarmId: number): any
  +findAll(): RubberFarmModel[]
  +findAllWithFarmerDetails(): any[]
  +update(id: number, data: Partial~RubberFarmModel~): RubberFarmModel?
  +updateWithLock(id: number, data: Partial~RubberFarmModel~, currentVersion: number): RubberFarmModel
  +delete(id: number): boolean
}

class RubberFarmService {
  +createRubberFarmWithDetails(farmData: object, plantingDetailsData: object[], userId?: number): RubberFarmModel
  +getRubberFarmsByFarmerId(farmerId: number): RubberFarmModel[]
  +getRubberFarmsByFarmerIdWithPagination(options: object): object
  +getRubberFarmWithDetails(rubberFarmId: number): RubberFarmModel?
  +updateRubberFarm(rubberFarmId: number, data: Partial~RubberFarmModel~, currentVersion: number, userId?: number): RubberFarmModel?
  +updateRubberFarmWithDetails(rubberFarmId: number, farmData: Partial~RubberFarmModel~, existingPlantingDetails: object[], newPlantingDetails: object[], deletedPlantingDetailIds: number[], userId?: number): RubberFarmModel?
  +deleteRubberFarm(rubberFarmId: number): boolean
}

class RubberFarmController {
  +createRubberFarmWithDetails(req: NextRequest): NextResponse
  +getRubberFarmsByFarmerId(req: NextRequest): NextResponse
  +getRubberFarmWithDetails(req: NextRequest, params: {id: string}): NextResponse
  +updateRubberFarm(req: NextRequest, params: {id: string}): NextResponse
  +updateRubberFarmWithDetails(req: NextRequest, params: {id: string}): NextResponse
  +deleteRubberFarm(req: NextRequest, params: {id: string}): NextResponse
  #createModel(data: any): RubberFarmModel
}

RubberFarmModel --|> BaseModel
RubberFarmRepository --|> BaseRepository~RubberFarmModel~
RubberFarmService --|> BaseService~RubberFarmModel~
RubberFarmController --|> BaseController~RubberFarmModel~

RubberFarmController --> RubberFarmService : uses
RubberFarmService --> RubberFarmRepository : uses
RubberFarmService --> PlantingDetailRepository : uses
RubberFarmService --> InspectionRepository : uses
RubberFarmService --> AuditLogService : uses

%% simplified model relations
class PlantingDetailModel
class InspectionModel
RubberFarmModel "1" --> "0..*" PlantingDetailModel : plantingDetails
RubberFarmModel "1" --> "0..*" InspectionModel : inspections
```

