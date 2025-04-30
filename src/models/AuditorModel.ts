import { UserModel, UserRole } from "./UserModel";
import bcrypt from "bcrypt";

export class AuditorModel extends UserModel {
    auditorId: string;
    namePrefix: string;
    firstName: string;
    lastName: string;

    constructor(
        userId: string,
        email: string,
        password: string,
        hashedPassword: string,
        name: string,
        auditorId: string,
        namePrefix: string,
        firstName: string,
        lastName: string,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date()
    ) {
        super(userId, email, password, hashedPassword, name, UserRole.AUDITOR, createdAt, updatedAt);
        this.auditorId = auditorId;
        this.namePrefix = namePrefix;
        this.firstName = firstName;
        this.lastName = lastName;
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
            '', // userId will be generated
            email,
            password,
            hashedPassword,
            name,
            '', // auditorId will be generated
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
            lastName: this.lastName
        };
    }
}