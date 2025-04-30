import { BaseModel } from "./BaseModel";
import bcrypt from "bcrypt";

export enum UserRole {
    BASIC = 'BASIC',
    FARMER = 'FARMER',
    AUDITOR = 'AUDITOR',
    COMMITTEE = 'COMMITTEE',
    ADMIN = 'ADMIN',
}