import { UserModel, UserRole } from "./UserModel";
import bcrypt from "bcrypt";

export class FarmerModel extends UserModel {
  farmerId: number; // เปลี่ยนจาก string เป็น number
  namePrefix: string;
  firstName: string;
  lastName: string;
  identificationNumber: string;
  birthDate: Date;
  gender: string;
  houseNo: string;
  villageName: string;
  moo: number;
  road: string;
  alley: string;
  subDistrict: string;
  district: string;
  provinceName: string;
  zipCode: string;
  phoneNumber: string;
  mobilePhoneNumber: string;
  version?: number; // Optimistic locking

  constructor(
    userId: number, // เปลี่ยนจาก string เป็น number
    email: string,
    hashedPassword: string,
    name: string,
    farmerId: number, // เปลี่ยนจาก string เป็น number
    namePrefix: string,
    firstName: string,
    lastName: string,
    identificationNumber: string,
    birthDate: Date,
    gender: string,
    houseNo: string,
    villageName: string,
    moo: number,
    road: string,
    alley: string,
    subDistrict: string,
    district: string,
    provinceName: string,
    zipCode: string,
    phoneNumber: string,
    mobilePhoneNumber: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    version?: number
  ) {
    super(
      userId,
      email,
      hashedPassword,
      name,
      UserRole.FARMER,
      undefined, // requirePasswordChange
      createdAt,
      updatedAt
    );
    this.farmerId = farmerId;
    this.namePrefix = namePrefix;
    this.firstName = firstName;
    this.lastName = lastName;
    this.identificationNumber = identificationNumber;
    this.birthDate = birthDate;
    this.gender = gender;
    this.houseNo = houseNo;
    this.villageName = villageName;
    this.moo = moo;
    this.road = road;
    this.alley = alley;
    this.subDistrict = subDistrict;
    this.district = district;
    this.provinceName = provinceName;
    this.zipCode = zipCode;
    this.phoneNumber = phoneNumber;
    this.mobilePhoneNumber = mobilePhoneNumber;
    this.version = version;
  }

  static async createFarmer(
    email: string,
    password: string,
    namePrefix: string,
    firstName: string,
    lastName: string,
    identificationNumber: string,
    birthDate: Date,
    gender: string,
    houseNo: string,
    villageName: string,
    moo: number,
    road: string,
    alley: string,
    subDistrict: string,
    district: string,
    provinceName: string,
    zipCode: string,
    phoneNumber: string,
    mobilePhoneNumber: string,
    requirePasswordChange?: boolean
  ): Promise<FarmerModel> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const name = `${namePrefix}${firstName} ${lastName}`;

    const farmer = new FarmerModel(
      0, // userId จะถูกสร้างโดยฐานข้อมูล (เปลี่ยนจาก '' เป็น 0)
      email,
      hashedPassword,
      name,
      0, // farmerId จะถูกสร้างโดยฐานข้อมูล (เปลี่ยนจาก '' เป็น 0)
      namePrefix,
      firstName,
      lastName,
      identificationNumber,
      birthDate,
      gender,
      houseNo,
      villageName,
      moo,
      road,
      alley,
      subDistrict,
      district,
      provinceName,
      zipCode,
      phoneNumber,
      mobilePhoneNumber
    );

    // Set requirePasswordChange if provided
    if (requirePasswordChange !== undefined) {
      farmer.requirePasswordChange = requirePasswordChange;
    }

    return farmer;
  }

  override validate(): boolean {
    return (
      super.validate() &&
      this.namePrefix.trim().length > 0 &&
      this.firstName.trim().length > 0 &&
      this.lastName.trim().length > 0 &&
      this.identificationNumber.trim().length > 0 &&
      this.gender.trim().length > 0 &&
      this.moo >= 0 &&
      this.subDistrict.trim().length > 0 &&
      this.district.trim().length > 0 &&
      this.provinceName.trim().length > 0 &&
      this.zipCode.trim().length > 0 &&
      this.mobilePhoneNumber.trim().length > 0
    );
  }

  override toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      farmerId: this.farmerId,
      namePrefix: this.namePrefix,
      firstName: this.firstName,
      lastName: this.lastName,
      identificationNumber: this.identificationNumber,
      birthDate: this.birthDate,
      gender: this.gender,
      houseNo: this.houseNo,
      villageName: this.villageName,
      moo: this.moo,
      road: this.road,
      alley: this.alley,
      subDistrict: this.subDistrict,
      district: this.district,
      provinceName: this.provinceName,
      zipCode: this.zipCode,
      phoneNumber: this.phoneNumber,
      mobilePhoneNumber: this.mobilePhoneNumber,
      version: this.version,
    };
  }
}
