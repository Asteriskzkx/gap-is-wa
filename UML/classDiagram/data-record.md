# DataRecord

```mermaid
classDiagram

class BaseController~T~
class BaseService~T~
class BaseRepository~T~
class BaseModel
class AuditLogService

class DataRecordModel {
  -dataRecordId: number
  -inspectionId: number
  -species: any
  -waterSystem: any
  -fertilizers: any
  -previouslyCultivated: any
  -plantDisease: any
  -relatedPlants: any
  -moreInfo: string
  -map: any
  -version?: number
  +create(inspectionId: number, species: any, waterSystem: any, fertilizers: any, previouslyCultivated: any, plantDisease: any, relatedPlants: any, moreInfo: string, map: any): DataRecordModel
  +validate(): boolean
  +toJSON(): object
}

class DataRecordRepository {
  +create(model: DataRecordModel): DataRecordModel
  +findById(id: number): DataRecordModel?
  +findByInspectionId(inspectionId: number): DataRecordModel?
  +findAll(): DataRecordModel[]
  +update(id: number, data: Partial~DataRecordModel~): DataRecordModel?
  +updateWithLock(id: number, data: Partial~DataRecordModel~, currentVersion: number): DataRecordModel
  +delete(id: number): boolean
}

class DataRecordService {
  +createDataRecord(dataRecordData: object): DataRecordModel
  +getDataRecordByInspectionId(inspectionId: number): DataRecordModel?
  +updateDataRecord(dataRecordId: number, data: Partial~DataRecordModel~, currentVersion: number, userId?: number): DataRecordModel?
  +deleteDataRecord(dataRecordId: number): boolean
}

class DataRecordController {
  +createDataRecord(req: NextRequest): NextResponse
  +getDataRecordByInspectionId(req: NextRequest): NextResponse
  +updateDataRecord(req: NextRequest, params: {id: string}, session?: any): NextResponse
  #createModel(data: any): DataRecordModel
}

DataRecordModel --|> BaseModel
DataRecordRepository --|> BaseRepository~DataRecordModel~
DataRecordService --|> BaseService~DataRecordModel~
DataRecordController --|> BaseController~DataRecordModel~

DataRecordController --> DataRecordService : uses
DataRecordService --> DataRecordRepository : uses
DataRecordService --> AuditLogService : uses
```

