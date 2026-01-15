import { BaseModel } from "./BaseModel";

export class AuditLogModel extends BaseModel {
  auditLogId: number;
  tableName: string;
  action: string;
  recordId: number;
  userId?: number;
  operatorName?: string | null;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;

  constructor(
    auditLogId: number,
    tableName: string,
    action: string,
    recordId: number,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(auditLogId, createdAt, updatedAt);
    this.auditLogId = auditLogId;
    this.tableName = tableName;
    this.action = action;
    this.recordId = recordId;
  }

  static createAuditLog(
    tableName: string,
    action: string,
    recordId: number,
    userId?: number,
    oldData?: Record<string, any>,
    newData?: Record<string, any>
  ): AuditLogModel {
    const model = new AuditLogModel(0, tableName, action, recordId);
    if (userId !== undefined) model.userId = userId;
    if (oldData !== undefined) model.oldData = oldData;
    if (newData !== undefined) model.newData = newData;
    return model;
  }

  validate(): boolean {
    return (
      typeof this.tableName === "string" &&
      this.tableName.length > 0 &&
      typeof this.action === "string" &&
      ["CREATE", "UPDATE", "DELETE"].includes(this.action) &&
      typeof this.recordId === "number"
    );
  }

  toJSON(): Record<string, any> {
    return {
      auditLogId: this.auditLogId,
      tableName: this.tableName,
      action: this.action,
      recordId: this.recordId,
      userId: this.userId,
      operatorName: this.operatorName ?? null,
      oldData: this.oldData,
      newData: this.newData,
      createdAt: this.createdAt,
    };
  }
}
