import { BaseRepository } from "./BaseRepository";
import { BaseMapper } from "@/mappers/BaseMapper";
import { FileModel } from "@/models/FileModel";

export class FileRepository extends BaseRepository<FileModel> {
  constructor(mapper: BaseMapper<any, FileModel>) {
    super(mapper);
  }

  async create(model: FileModel): Promise<FileModel> {
    try {
      const created = await (this.prisma as any).file.create({
        data: this.mapper.toPrisma(model),
      });
      return this.mapper.toDomain(created);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<FileModel | null> {
    try {
      const rec = await (this.prisma as any).file.findUnique({
        where: { fileId: id },
      });
      return rec ? this.mapper.toDomain(rec) : null;
    } catch (error) {
      console.error("Error finding file by ID:", error);
      return null;
    }
  }

  async findAll(): Promise<FileModel[]> {
    try {
      const recs = await (this.prisma as any).file.findMany();
      return recs.map((r: any) => this.mapper.toDomain(r));
    } catch (error) {
      console.error("Error finding all files:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<FileModel>
  ): Promise<FileModel | null> {
    try {
      const updated = await (this.prisma as any).file.update({
        where: { fileId: id },
        data,
      });
      return this.mapper.toDomain(updated);
    } catch (error) {
      console.error("Error updating file:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await (this.prisma as any).file.delete({ where: { fileId: id } });
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  async findByReference(tableReference: string, idReference: number) {
    try {
      const recs = await (this.prisma as any).file.findMany({
        where: { tableReference, idReference },
        orderBy: { createdAt: "desc" },
      });
      return recs.map((r: any) => this.mapper.toDomain(r));
    } catch (error) {
      console.error("Error finding files by reference:", error);
      return [];
    }
  }
}
