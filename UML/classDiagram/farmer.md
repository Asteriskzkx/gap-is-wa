# Farmer

```mermaid
classDiagram

class BaseController~T~
class BaseService~T~
class BaseRepository~T~
class UserModel
class UserService
class AuditLogService

class FarmerModel {
  -farmerId: number
  -namePrefix: string
  -firstName: string
  -lastName: string
  -identificationNumber: string
  -birthDate: Date
  -gender: string
  -houseNo: string
  -villageName: string
  -moo: number
  -road: string
  -alley: string
  -subDistrict: string
  -district: string
  -provinceName: string
  -zipCode: string
  -phoneNumber: string
  -mobilePhoneNumber: string
  -version?: number
  +createFarmer(email: string, password: string, namePrefix: string, firstName: string, lastName: string, identificationNumber: string, birthDate: Date, gender: string, houseNo: string, villageName: string, moo: number, road: string, alley: string, subDistrict: string, district: string, provinceName: string, zipCode: string, phoneNumber: string, mobilePhoneNumber: string, requirePasswordChange?: boolean): FarmerModel
  +validate(): boolean
  +toJSON(): object
}

class FarmerRepository {
  +create(model: FarmerModel): FarmerModel
  +findById(id: number): FarmerModel?
  +findByUserId(userId: number): FarmerModel?
  +findAll(): FarmerModel[]
  +update(id: number, data: Partial~FarmerModel~): FarmerModel?
  +delete(id: number): boolean
  +updateWithLock(id: number, data: Partial~FarmerModel~, currentVersion: number): FarmerModel
}

class FarmerService {
  +login(email: string, password: string): object?
  +registerFarmer(farmerData: object): FarmerModel
  +getFarmerByUserId(userId: number): FarmerModel?
  +updateFarmerProfile(farmerId: number, data: Partial~FarmerModel~, currentVersion: number): FarmerModel?
  +getFarmersByDistrict(district: string): FarmerModel[]
  +getFarmersByProvince(provinceName: string): FarmerModel[]
  +validateIdentificationNumber(id: string): boolean
}

class FarmerController {
  +login(req: NextRequest): NextResponse
  +registerFarmer(req: NextRequest): NextResponse
  +getCurrentFarmer(req: NextRequest): NextResponse
  +getFarmerProfile(req: NextRequest, params: {userId: string}): NextResponse
  +updateFarmerProfile(req: NextRequest, params: {id: string}): NextResponse
  +getFarmersByDistrict(req: NextRequest): NextResponse
  +getFarmersByProvince(req: NextRequest): NextResponse
  #createModel(data: any): FarmerModel
}

FarmerModel --|> UserModel
FarmerRepository --|> BaseRepository~FarmerModel~
FarmerService --|> BaseService~FarmerModel~
FarmerController --|> BaseController~FarmerModel~

FarmerController --> FarmerService : uses
FarmerService --> FarmerRepository : uses
FarmerService --> UserService : uses
FarmerService --> AuditLogService : uses
```

