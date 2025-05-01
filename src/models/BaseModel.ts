export abstract class BaseModel {
    id: number;  // เปลี่ยนจาก string เป็น number สำหรับ userId, farmerId, auditorId, committeeId, หรือ adminId
    createdAt: Date;
    updatedAt: Date;

    constructor(id: number, createdAt: Date = new Date(), updatedAt: Date = new Date()) {
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    abstract validate(): boolean;
    abstract toJSON(): Record<string, any>;
}