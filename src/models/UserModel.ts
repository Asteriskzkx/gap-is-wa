import { BaseModel } from "./BaseModel";
import bcrypt from "bcrypt";

export enum UserRole {
    BASIC = 'BASIC',
    FARMER = 'FARMER',
    AUDITOR = 'AUDITOR',
    COMMITTEE = 'COMMITTEE',
    ADMIN = 'ADMIN',
}

export class UserModel extends BaseModel {
    email: string;
    password: string;
    hashedPassword: string;
    name: string;
    role: UserRole;

    constructor(
        userId: number, // เปลี่ยนจาก string เป็น number
        email: string,
        password: string,
        hashedPassword: string,
        name: string,
        role: UserRole = UserRole.BASIC,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date()
    ) {
        super(userId, createdAt, updatedAt);
        this.email = email;
        this.password = password;
        this.hashedPassword = hashedPassword;
        this.name = name;
        this.role = role;
    }

    static async create(
        email: string,
        password: string,
        name: string,
        role: UserRole = UserRole.BASIC
    ): Promise<UserModel> {
        const hashedPassword = await bcrypt.hash(password, 10);
        return new UserModel(
            0, // userId จะถูกสร้างโดยฐานข้อมูล ใช้ 0 เป็นค่าเริ่มต้นแทน empty string
            email,
            password,
            hashedPassword,
            name,
            role
        );
    }

    async comparePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.hashedPassword);
    }

    validate(): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return (
            emailRegex.test(this.email) &&
            this.password.length >= 8 &&
            this.name.trim().length > 0 &&
            Object.values(UserRole).includes(this.role)
        );
    }

    hasPermission(permission: string): boolean {
        // Basic permission implementation
        const permissionMap: Record<UserRole, string[]> = {
            [UserRole.BASIC]: ['view_profile'],
            [UserRole.FARMER]: ['view_profile', 'manage_farm'],
            [UserRole.AUDITOR]: ['view_profile', 'audit_farms'],
            [UserRole.COMMITTEE]: ['view_profile', 'review_audits', 'approve_certifications'],
            [UserRole.ADMIN]: ['*'] // Admin has all permissions
        };

        if (this.role === UserRole.ADMIN) return true;
        return permissionMap[this.role].includes(permission);
    }

    toJSON(): Record<string, any> {
        return {
            userId: this.id,
            email: this.email,
            name: this.name,
            role: this.role,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}