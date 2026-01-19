# Committee

```mermaid
classDiagram

class BaseController~T~
class BaseService~T~
class BaseRepository~T~
class UserModel
class UserService
class AuditLogService

class CommitteeModel {
  -committeeId: number
  -namePrefix: string
  -firstName: string
  -lastName: string
  -version?: number
  +createCommittee(email: string, password: string, namePrefix: string, firstName: string, lastName: string): CommitteeModel
  +validate(): boolean
  +toJSON(): object
}

class CommitteeRepository {
  +create(model: CommitteeModel): CommitteeModel
  +findById(id: number): CommitteeModel?
  +findByUserId(userId: number): CommitteeModel?
  +findAll(): CommitteeModel[]
  +update(id: number, data: Partial~CommitteeModel~): CommitteeModel?
  +delete(id: number): boolean
  +updateWithLock(id: number, data: Partial~CommitteeModel~, currentVersion: number): CommitteeModel
}

class CommitteeService {
  +login(email: string, password: string): object?
  +registerCommittee(committeeData: object): CommitteeModel
  +getCommitteeByUserId(userId: number): CommitteeModel?
  +updateCommitteeProfile(committeeId: number, data: Partial~CommitteeModel~, currentVersion: number, userId?: number): CommitteeModel?
}

class CommitteeController {
  +login(req: NextRequest): NextResponse
  +registerCommittee(req: NextRequest): NextResponse
  +getCurrentCommittee(req: NextRequest): NextResponse
  +getCommitteeProfile(req: NextRequest, params: {userId: string}): NextResponse
  +updateCommitteeProfile(req: NextRequest, params: {id: string}): NextResponse
  #createModel(data: any): CommitteeModel
}

CommitteeModel --|> UserModel
CommitteeRepository --|> BaseRepository~CommitteeModel~
CommitteeService --|> BaseService~CommitteeModel~
CommitteeController --|> BaseController~CommitteeModel~

CommitteeController --> CommitteeService : uses
CommitteeService --> CommitteeRepository : uses
CommitteeService --> UserService : uses
CommitteeService --> AuditLogService : uses
```

