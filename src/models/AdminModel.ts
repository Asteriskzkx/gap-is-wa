import { UserModel, UserRole } from "./UserModel";
import bcrypt from "bcrypt";

export class AdminModel extends UserModel {
    adminId: number;
    namePrefix: string;
    firstName: string;
    lastName: string;

    constructor(
        userId: number,
        email: string,
        password: string,
        hashedPassword: string,
        name: string,
        adminId: number,
        namePrefix: string,
        firstName: string,
        lastName: string,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date()
    ) {
        super(userId, email, password, hashedPassword, name, UserRole.ADMIN, createdAt, updatedAt);
        this.adminId = adminId;
        this.namePrefix = namePrefix;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    static async createAdmin(
        email: string,
        password: string,
        namePrefix: string,
        firstName: string,
        lastName: string
    ): Promise<AdminModel> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const name = `${namePrefix}${firstName} ${lastName}`;

        return new AdminModel(
            0, // userId will be generated
            email,
            password,
            hashedPassword,
            name,
            0, // adminId will be generated
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
            adminId: this.adminId,
            namePrefix: this.namePrefix,
            firstName: this.firstName,
            lastName: this.lastName
        };
    }
}