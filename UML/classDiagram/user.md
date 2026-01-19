# User

```mermaid
classDiagram

class BaseModel
class BaseController~T~
class BaseService~T~
class BaseRepository~T~

class UserRole {
  <<enumeration>>
  BASIC
  FARMER
  AUDITOR
  COMMITTEE
  ADMIN
}

class UserModel {
  -email: string
  -hashedPassword: string
  -name: string
  -role: UserRole
  -requirePasswordChange?: boolean
  +create(email: string, password: string, name: string, role: UserRole): UserModel
  +hashPassword(password: string): string
  +comparePassword(password: string): boolean
  +validate(): boolean
  +hasPermission(permission: string): boolean
  +toJSON(): object
}

class UserRepository {
  +create(model: UserModel): UserModel
  +findById(id: number): UserModel?
  +findByEmail(email: string): UserModel?
  +findAll(): UserModel[]
  +update(id: number, data: Partial~UserModel~): UserModel?
  +delete(id: number): boolean
  +findNameMapByIds(userIds: number[]): object
  +findWithFilterAndPagination(params: object): object
}

class AuditLogService

class UserService {
  +findByEmail(email: string): UserModel?
  +register(userData: object): UserModel
  +login(email: string, password: string): object?
  +changePassword(userId: number, currentPassword: string, newPassword: string): boolean
  +resetPasswordToDefault(userId: number): UserModel?
  +changeRole(userId: number, newRole: UserRole): UserModel?
  +getUsersNormalizedById(userId?: number): object[]
  +getUsersWithFilterAndPagination(params: object): object
  +delete(userId: number, actorId?: number): boolean
}

class UserRegistrationFactoryService {
  -farmerService: FarmerService
  -auditorService: AuditorService
  -committeeService: CommitteeService
  -adminService: AdminService
  +createUserWithRole(data: any): any
}

class UserController {
  -userService: UserService
  -UserRegistrationFactoryService: UserRegistrationFactoryService
  +createUser(req: NextRequest): NextResponse
  +register(req: NextRequest): NextResponse
  +login(req: NextRequest): NextResponse
  +changePassword(req: NextRequest, session?: any): NextResponse
  +resetPasswordToDefault(req: NextRequest): NextResponse
  +getCurrentUser(req: NextRequest): NextResponse
  +checkDuplicateEmail(req: NextRequest): NextResponse
  +changeRole(req: NextRequest, params: {userId: string}): NextResponse
  +getUsersNormalized(req: NextRequest, userId?: number): NextResponse
  +getAllUsersWithPagination(req: NextRequest): NextResponse
  +delete(req: NextRequest, params: {id: string}): NextResponse
  #createModel(data: any): UserModel
}

UserModel --|> BaseModel
UserRepository --|> BaseRepository~UserModel~
UserService --|> BaseService~UserModel~
UserController --|> BaseController~UserModel~

UserService --> UserRepository : uses
UserService --> AuditLogService : uses
UserController --> UserService : uses
UserController --> UserRegistrationFactoryService : uses

%% referenced role services (defined in separate diagrams)
class FarmerService
class AuditorService
class CommitteeService
class AdminService
UserRegistrationFactoryService --> FarmerService
UserRegistrationFactoryService --> AuditorService
UserRegistrationFactoryService --> CommitteeService
UserRegistrationFactoryService --> AdminService
```

