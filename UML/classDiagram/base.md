# Base Classes

```mermaid
classDiagram

class BaseModel {
  <<abstract>>
  -id: number
  -createdAt: Date
  -updatedAt: Date
  +validate(): boolean
  +toJSON(): object
}

class BaseRepository~T~ {
  <<abstract>>
  #prisma
  #mapper
  +create(model: T): T
  +findById(id: number): T?
  +findAll(): T[]
  +update(id: number, data: Partial~T~): T?
  +delete(id: number): boolean
  #updateWithOptimisticLock(id: number, data: any, currentVersion: number, tableName: string): T
  #getIdField(tableName: string): string
}

class BaseService~T~ {
  <<abstract>>
  #repository: BaseRepository~T~
  +getById(id: number): T?
  +getAll(): T[]
  +create(model: T): T
  +update(id: number, data: Partial~T~): T?
  +delete(id: number): boolean
  #handleServiceError(error: any): void
}

class BaseController~T~ {
  <<abstract>>
  #service: BaseService~T~
  +getAll(req: NextRequest): NextResponse
  +getById(req: NextRequest, params: {id: string}): NextResponse
  +create(req: NextRequest): NextResponse
  +update(req: NextRequest, params: {id: string}): NextResponse
  +delete(req: NextRequest, params: {id: string}): NextResponse
  #handleControllerError(error: any): NextResponse
  #createModel(data: any): T
}

BaseService~T~ --> BaseRepository~T~ : uses
BaseController~T~ --> BaseService~T~ : uses
BaseRepository~T~ ..> BaseModel : "T extends"
BaseService~T~ ..> BaseModel : "T extends"
BaseController~T~ ..> BaseModel : "T extends"
```

