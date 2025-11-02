import { UserModel, UserRole } from "./UserModel";
import bcrypt from "bcrypt";

export class AuditorModel extends UserModel {
  auditorId: number;
  namePrefix: string;
  firstName: string;
  lastName: string;
  version?: number;

  constructor(
    userId: number,
    email: string,
    hashedPassword: string,
    name: string,
    auditorId: number,
    namePrefix: string,
    firstName: string,
    lastName: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    version?: number
  ) {
    super(
      userId,
      email,
      hashedPassword,
      name,
      UserRole.AUDITOR,
      createdAt,
      updatedAt
    );
    this.auditorId = auditorId;
    this.namePrefix = namePrefix;
    this.firstName = firstName;
    this.lastName = lastName;
    this.version = version;
  }

  static async createAuditor(
    email: string,
    password: string,
    namePrefix: string,
    firstName: string,
    lastName: string
  ): Promise<AuditorModel> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const name = `${namePrefix}${firstName} ${lastName}`;

    return new AuditorModel(
      0, // userId will be generated
      email,
      hashedPassword,
      name,
      0, // auditorId will be generated
      namePrefix,
      firstName,
      lastName
    );
  }

  override validate(): boolean {
    return (
      super.validate() &&
      this.namePrefix.trim().length > 0 &&
      this.firstName.trim().length > 0 &&
      this.lastName.trim().length > 0
    );
  }

  override toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      auditorId: this.auditorId,
      namePrefix: this.namePrefix,
      firstName: this.firstName,
      lastName: this.lastName,
      version: this.version,
    };
  }
}
