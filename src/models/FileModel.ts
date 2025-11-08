import { BaseModel } from "./BaseModel";

export class FileModel extends BaseModel {
  fileId: number;
  tableReference: string;
  idReference: number;
  fileName: string;
  mimeType?: string;
  url: string;
  fileKey?: string;
  size?: number;
  version?: number;

  constructor(
    fileId: number,
    tableReference: string,
    idReference: number,
    fileName: string,
    url: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(fileId, createdAt, updatedAt);
    this.fileId = fileId;
    this.tableReference = tableReference;
    this.idReference = idReference;
    this.fileName = fileName;
    this.url = url;
  }

  static createFile(
    tableReference: string,
    idReference: number,
    fileName: string,
    url: string,
    mimeType?: string,
    size?: number,
    fileKey?: string
  ) {
    const m = new FileModel(0, tableReference, idReference, fileName, url);
    if (mimeType) m.mimeType = mimeType;
    if (size) m.size = size;
    if (fileKey) m.fileKey = fileKey;
    return m;
  }

  validate(): boolean {
    return (
      typeof this.tableReference === "string" &&
      this.tableReference.length > 0 &&
      typeof this.idReference === "number" &&
      !Number.isNaN(this.idReference) &&
      typeof this.fileName === "string" &&
      this.fileName.length > 0 &&
      typeof this.url === "string" &&
      this.url.length > 0
    );
  }

  toJSON(): Record<string, any> {
    return {
      fileId: this.fileId,
      tableReference: this.tableReference,
      idReference: this.idReference,
      fileName: this.fileName,
      mimeType: this.mimeType,
      url: this.url,
      size: this.size,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
