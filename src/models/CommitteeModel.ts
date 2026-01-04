import { UserModel, UserRole } from "./UserModel";
import bcrypt from "bcrypt";

export class CommitteeModel extends UserModel {
  committeeId: number;
  namePrefix: string;
  firstName: string;
  lastName: string;
  version?: number;

  constructor(
    userId: number,
    email: string,
    hashedPassword: string,
    name: string,
    committeeId: number,
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
      UserRole.COMMITTEE,
      undefined, // requirePasswordChange
      createdAt,
      updatedAt
    );
    this.committeeId = committeeId;
    this.namePrefix = namePrefix;
    this.firstName = firstName;
    this.lastName = lastName;
    this.version = version;
  }

  static async createCommittee(
    email: string,
    password: string,
    namePrefix: string,
    firstName: string,
    lastName: string
  ): Promise<CommitteeModel> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const name = `${namePrefix}${firstName} ${lastName}`;

    return new CommitteeModel(
      0, // userId will be generated
      email,
      hashedPassword,
      name,
      0, // committeeId will be generated
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
      committeeId: this.committeeId,
      namePrefix: this.namePrefix,
      firstName: this.firstName,
      lastName: this.lastName,
      version: this.version,
    };
  }
}
