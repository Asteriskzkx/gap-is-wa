# AuditLog

```mermaid
classDiagram

class BaseModel
class BaseService~T~
class BaseRepository~T~
class UserRepository

class AuditLogModel {
  -auditLogId: number
  -tableName: string
  -action: string
  -recordId: number
  -userId?: number
  -operatorName?: string
  -oldData?: object
  -newData?: object
  +createAuditLog(tableName: string, action: string, recordId: number, userId?: number, oldData?: object, newData?: object): AuditLogModel
  +validate(): boolean
  +toJSON(): object
}

class AuditLogRepository {
  +create(model: AuditLogModel): AuditLogModel
  +findById(id: number): AuditLogModel?
  +findAll(): AuditLogModel[]
  +findAllWithPagination(options?: object): object
  +update(id: number, data: Partial~AuditLogModel~): AuditLogModel?
  +delete(id: number): boolean
  +findByTableAndRecordId(tableName: string, recordId: number): AuditLogModel[]
  +findByUserId(userId: number): AuditLogModel[]
  +findByAction(action: string): AuditLogModel[]
  +findByDateRange(startDate: Date, endDate: Date): AuditLogModel[]
  +deleteOlderThan(date: Date): number
  +deleteByTableAndRecordId(tableName: string, recordId: number): number
  +deleteAll(): number
  +count(): number
  +countOlderThan(date: Date): number
}

class AuditLogService {
  +logAction(tableName: string, action: string, recordId: number, userId?: number, oldData?: object, newData?: object): AuditLogModel?
  +getRecordHistory(tableName: string, recordId: number): AuditLogModel[]
  +getUserActivity(userId: number): AuditLogModel[]
  +getLogsByAction(action: string): AuditLogModel[]
  +getLogsByDateRange(startDate: Date, endDate: Date): AuditLogModel[]
  +getAllLogs(): AuditLogModel[]
  +getLogsWithPagination(options?: object): object
  +deleteLog(id: number): boolean
  +deleteOldLogs(days: number): number
  +deleteRecordLogs(tableName: string, recordId: number): number
  +deleteAllLogs(): number
  +countLogs(): number
  +countOldLogs(days: number): number
}

class AuditLogController {
  +getAllLogs(req: NextRequest): NextResponse
  +getLogsWithPagination(req: NextRequest): NextResponse
  +getRecordHistory(req: NextRequest): NextResponse
  +getUserActivity(req: NextRequest): NextResponse
  +getLogsByAction(req: NextRequest): NextResponse
  +getLogsByDateRange(req: NextRequest): NextResponse
  +deleteLog(req: NextRequest, params: {id: string}): NextResponse
  +deleteOldLogs(req: NextRequest): NextResponse
  +deleteRecordLogs(req: NextRequest): NextResponse
  +deleteAllLogs(req: NextRequest): NextResponse
  +countOldLogs(req: NextRequest): NextResponse
  +getStats(req: NextRequest): NextResponse
}

AuditLogModel --|> BaseModel
AuditLogRepository --|> BaseRepository~AuditLogModel~
AuditLogService --|> BaseService~AuditLogModel~

AuditLogController --> AuditLogService : uses
AuditLogService --> AuditLogRepository : uses
AuditLogService --> UserRepository : uses
```

