export type AdminInfo = {
  adminId: number;
  namePrefix: string;
  firstName: string;
  lastName: string;

  // System/Metadata Fields
  createdAt: Date; // ⏱ icon suggests a Date/Time type
  updatedAt: Date; // ⏱ icon suggests a Date/Time type
  userId: number; // Foreign Key, connects to User table
  version: number;
};

export type AuditorInfo = {
  auditorId: number;
  namePrefix: string;
  firstName: string;
  lastName: string;

  // System/Metadata Fields
  createdAt: Date; // ⏱ icon suggests a Date/Time type
  updatedAt: Date; // ⏱ icon suggests a Date/Time type
  userId: number; // Foreign Key, connects to User table
  version: number;
};

export type CommitteeInfo = {
  committeeId: number;
  namePrefix: string;
  firstName: string;
  lastName: string;
  
  // System/Metadata Fields
  createdAt: Date; // ⏱ icon suggests a Date/Time type
  updatedAt: Date; // ⏱ icon suggests a Date/Time type
  userId: number; // Foreign Key, connects to User table
  version: number;
};

export type FarmerInfo = {
  // Primary Key
  farmerId: number;

  // Personal Info
  namePrefix: string;
  firstName: string;
  lastName: string;
  identificationNumber: string;
  birthDate: Date; // ⏱ icon suggests a Date/Time type
  gender: string;

  // Address Info
  houseNo: string;
  villageName: string;
  moo: number;
  road: string;
  alley: string;
  subDistrict: string;
  district: string;
  provinceName: string;
  zipCode: string;

  // Contact Info
  phoneNumber: string;
  mobilePhoneNumber: string;

  // System/Metadata Fields
  createdAt: Date; // ⏱ icon suggests a Date/Time type
  updatedAt: Date; // ⏱ icon suggests a Date/Time type
  userId: number; // Foreign Key, connects to User table
  version: number;
}

export type NormalizedUser = {
  userId: number;
  email: string;
  role: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  admin?: AdminInfo;
  committee?: CommitteeInfo;
  farmer?: FarmerInfo;
  auditor?: AuditorInfo;
};


