export abstract class BaseModel {
    id: string;  // จะใช้เป็น userId, farmerId, auditorId, committeeId, หรือ adminId ขึ้นอยู่กับโมเดล
    createdAt: Date;
    updatedAt: Date;

    constructor(id: string, createdAt: Date = new Date(), updatedAt: Date = new Date()) {
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    abstract validate(): boolean;
    abstract toJSON(): Record<string, any>;
}