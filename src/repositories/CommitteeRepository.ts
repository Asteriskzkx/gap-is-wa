import {
  PrismaClient,
  Committee as PrismaCommittee,
  User as PrismaUser,
} from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { CommitteeModel } from "../models/CommitteeModel";
import { UserRole } from "../models/UserModel";
import { BaseMapper } from "../mappers/BaseMapper";
import { OptimisticLockError } from "../errors/OptimisticLockError";

export class CommitteeRepository extends BaseRepository<CommitteeModel> {
  constructor(mapper: BaseMapper<any, CommitteeModel>) {
    super(mapper);
  }

  async create(model: CommitteeModel): Promise<CommitteeModel> {
    try {
      // Create the user first with the committee relation
      const user = await this.prisma.user.create({
        data: {
          email: model.email,
          hashedPassword: model.hashedPassword,
          name: model.name,
          role: UserRole.COMMITTEE,
          committee: {
            create: {
              namePrefix: model.namePrefix,
              firstName: model.firstName,
              lastName: model.lastName,
            },
          },
        },
        include: {
          committee: true,
        },
      });

      if (!user.committee) {
        throw new Error("Failed to create committee record");
      }

      return this.mapToModel(user, user.committee);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<CommitteeModel | null> {
    try {
      const committee = await this.prisma.committee.findUnique({
        where: { committeeId: id },
        include: {
          user: true,
        },
      });

      return committee && committee.user
        ? this.mapToModel(committee.user, committee)
        : null;
    } catch (error) {
      console.error("Error finding committee by ID:", error);
      return null;
    }
  }

  async findByUserId(userId: number): Promise<CommitteeModel | null> {
    try {
      const committee = await this.prisma.committee.findUnique({
        where: { userId },
        include: {
          user: true,
        },
      });

      return committee && committee.user
        ? this.mapToModel(committee.user, committee)
        : null;
    } catch (error) {
      console.error("Error finding committee by user ID:", error);
      return null;
    }
  }

  async findAll(): Promise<CommitteeModel[]> {
    try {
      const committees = await this.prisma.committee.findMany({
        include: {
          user: true,
        },
      });

      return committees
        .filter((committee) => committee.user !== null)
        .map((committee) => this.mapToModel(committee.user!, committee));
    } catch (error) {
      console.error("Error finding all committees:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<CommitteeModel>
  ): Promise<CommitteeModel | null> {
    try {
      // First, find the committee to get the userId
      const existingCommittee = await this.prisma.committee.findUnique({
        where: { committeeId: id },
        select: { userId: true },
      });

      if (!existingCommittee) {
        return null;
      }

      // Prepare user data - only include defined values
      const userData: any = { updatedAt: new Date() };
      if (data.email !== undefined) userData.email = data.email;
      if (data.name !== undefined) userData.name = data.name;

      // Prepare committee data - only include defined values
      const committeeData: any = { updatedAt: new Date() };
      if (data.namePrefix !== undefined) committeeData.namePrefix = data.namePrefix;
      if (data.firstName !== undefined) committeeData.firstName = data.firstName;
      if (data.lastName !== undefined) committeeData.lastName = data.lastName;

      // Start a transaction to update both User and Committee
      const [updatedUser, updatedCommittee] = await this.prisma.$transaction([
        // Update User record
        this.prisma.user.update({
          where: { userId: existingCommittee.userId },
          data: userData,
        }),

        // Update Committee record
        this.prisma.committee.update({
          where: { committeeId: id },
          data: committeeData,
        }),
      ]);

      return this.mapToModel(updatedUser, updatedCommittee);
    } catch (error) {
      console.error("Error updating committee:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      // Find the committee to get the userId
      const committee = await this.prisma.committee.findUnique({
        where: { committeeId: id },
        select: { userId: true },
      });

      if (!committee) {
        return false;
      }

      // Delete the user (which will cascade delete the committee)
      await this.prisma.user.delete({
        where: { userId: committee.userId },
      });

      return true;
    } catch (error) {
      console.error("Error deleting committee:", error);
      return false;
    }
  }

  private mapToModel(
    user: PrismaUser,
    committee: PrismaCommittee
  ): CommitteeModel {
    return this.mapper.toDomain({ user, committee });
  }

  /**
   * Update committee with optimistic locking
   */
  async updateWithLock(
    id: number,
    data: Partial<CommitteeModel>,
    currentVersion: number
  ): Promise<CommitteeModel> {
    try {
      // First, find the committee to get the userId and verify version
      const existingCommittee = await this.prisma.committee.findUnique({
        where: { committeeId: id },
        select: { userId: true, version: true },
      });

      if (!existingCommittee) {
        throw new Error(`Committee with ID ${id} not found`);
      }

      // Check version for optimistic locking
      if (existingCommittee.version !== currentVersion) {
        throw new OptimisticLockError(
          "committee",
          id,
          currentVersion,
          existingCommittee.version ?? -1
        );
      }

      // Prepare user data - only include defined values
      const userData: any = { updatedAt: new Date() };
      if (data.email !== undefined) userData.email = data.email;
      if (data.name !== undefined) userData.name = data.name;

      // Prepare committee data - only include defined values
      const committeeData: any = {
        version: currentVersion + 1,
        updatedAt: new Date(),
      };
      if (data.namePrefix !== undefined) committeeData.namePrefix = data.namePrefix;
      if (data.firstName !== undefined) committeeData.firstName = data.firstName;
      if (data.lastName !== undefined) committeeData.lastName = data.lastName;

      // Start a transaction to update both User and Committee
      const [updatedUser, updatedCommittee] = await this.prisma.$transaction([
        this.prisma.user.update({
          where: { userId: existingCommittee.userId },
          data: userData,
        }),
        this.prisma.committee.update({
          where: { committeeId: id },
          data: committeeData,
        }),
      ]);

      return this.mapToModel(updatedUser, updatedCommittee);
    } catch (error) {
      if (error instanceof OptimisticLockError) {
        throw error;
      }
      console.error("Error updating committee with optimistic lock:", error);
      throw error;
    }
  }
}
