# PlantingDetail

```mermaid
classDiagram

class BaseController~T~
class BaseService~T~
class BaseRepository~T~
class BaseModel
class AuditLogService

class PlantingDetailModel {
  -plantingDetailId: number
  -rubberFarmId: number
  -specie: string
  -areaOfPlot: number
  -numberOfRubber: number
  -numberOfTapping: number
  -ageOfRubber: number
  -yearOfTapping: Date
  -monthOfTapping: Date
  -totalProduction: number
  -version?: number
  +create(rubberFarmId: number, specie: string, areaOfPlot: number, numberOfRubber: number, numberOfTapping: number, ageOfRubber: number, yearOfTapping: Date, monthOfTapping: Date, totalProduction: number): PlantingDetailModel
  +validate(): boolean
  +toJSON(): object
}

class PlantingDetailRepository {
  +create(model: PlantingDetailModel): PlantingDetailModel
  +createMany(models: PlantingDetailModel[]): PlantingDetailModel[]
  +findById(id: number): PlantingDetailModel?
  +findByRubberFarmId(rubberFarmId: number): PlantingDetailModel[]
  +findAll(): PlantingDetailModel[]
  +update(id: number, data: Partial~PlantingDetailModel~): PlantingDetailModel?
  +updateWithLock(id: number, data: Partial~PlantingDetailModel~, currentVersion: number): PlantingDetailModel?
  +delete(id: number): boolean
}

class PlantingDetailService {
  +createPlantingDetail(detailData: object, userId?: number): PlantingDetailModel
  +getPlantingDetailsByRubberFarmId(rubberFarmId: number): PlantingDetailModel[]
  +updatePlantingDetail(plantingDetailId: number, detailData: Partial~PlantingDetailModel~, userId?: number): PlantingDetailModel?
  +delete(plantingDetailId: number, userId?: number): boolean
}

class PlantingDetailController {
  +createPlantingDetail(req: NextRequest): NextResponse
  +getPlantingDetailsByRubberFarmId(req: NextRequest): NextResponse
  +updatePlantingDetail(req: NextRequest, params: {id: string}): NextResponse
  +delete(req: NextRequest, params: {id: string}): NextResponse
  #createModel(data: any): PlantingDetailModel
}

PlantingDetailModel --|> BaseModel
PlantingDetailRepository --|> BaseRepository~PlantingDetailModel~
PlantingDetailService --|> BaseService~PlantingDetailModel~
PlantingDetailController --|> BaseController~PlantingDetailModel~

PlantingDetailController --> PlantingDetailService : uses
PlantingDetailService --> PlantingDetailRepository : uses
PlantingDetailService --> AuditLogService : uses
```

