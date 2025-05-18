import { BaseModel } from "./BaseModel";

export class InspectionTypeMasterModel extends BaseModel {
  inspectionTypeId: number;
  typeName: string;
  description: string | null;

  constructor(
    inspectionTypeId: number,
    typeName: string,
    description: string | null,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(inspectionTypeId, createdAt, updatedAt);
    this.inspectionTypeId = inspectionTypeId;
    this.typeName = typeName;
    this.description = description;
  }

  validate(): boolean {
    return this.inspectionTypeId > 0 && this.typeName.trim().length > 0;
  }

  toJSON(): Record<string, any> {
    return {
      inspectionTypeId: this.inspectionTypeId,
      typeName: this.typeName,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
