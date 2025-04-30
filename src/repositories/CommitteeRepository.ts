import { PrismaClient, Committee as PrismaCommittee, User as PrismaUser } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { CommitteeModel } from '../models/CommitteeModel';
import { UserRole } from '../models/UserModel';

export class CommitteeRepository extends BaseRepository<CommitteeModel> {

    async create(model: CommitteeModel): Promise<CommitteeModel> {
        try {
            // Create the user first with the committee relation
            const user = await this.prisma.user.create({
                data: {
                    email: model.email,
                    password: model.password,
                    hashedPassword: model.hashedPassword,
                    name: model.name,
                    role: UserRole.COMMITTEE,
                    committee: {
                        create: {
                            namePrefix: model.namePrefix,
                            firstName: model.firstName,
                            lastName: model.lastName
                        }
                    }
                },
                include: {
                    committee: true
                }
            });

            if (!user.committee) {
                throw new Error('Failed to create committee record');
            }

            return this.mapToModel(user, user.committee);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    async findById(id: string): Promise<CommitteeModel | null> {
        try {
            const committee = await this.prisma.committee.findUnique({
                where: { committeeId: id },
                include: {
                    user: true
                }
            });

            return committee && committee.user ? this.mapToModel(committee.user, committee) : null;
        } catch (error) {
            console.error('Error finding committee by ID:', error);
            return null;
        }
    }

    async findByUserId(userId: string): Promise<CommitteeModel | null> {
        try {
            const committee = await this.prisma.committee.findUnique({
                where: { userId },
                include: {
                    user: true
                }
            });

            return committee && committee.user ? this.mapToModel(committee.user, committee) : null;
        } catch (error) {
            console.error('Error finding committee by user ID:', error);
            return null;
        }
    }

    async findAll(): Promise<CommitteeModel[]> {
        try {
            const committees = await this.prisma.committee.findMany({
                include: {
                    user: true
                }
            });

            return committees
                .filter(committee => committee.user !== null)
                .map(committee => this.mapToModel(committee.user!, committee));
        } catch (error) {
            console.error('Error finding all committees:', error);
            return [];
        }
    }

    async update(id: string, data: Partial<CommitteeModel>): Promise<CommitteeModel | null> {
        try {
            // First, find the committee to get the userId
            const existingCommittee = await this.prisma.committee.findUnique({
                where: { committeeId: id },
                select: { userId: true }
            });

            if (!existingCommittee) {
                return null;
            }

            // Start a transaction to update both User and Committee
            const [updatedUser, updatedCommittee] = await this.prisma.$transaction([
                // Update User record
                this.prisma.user.update({
                    where: { userId: existingCommittee.userId },
                    data: {
                        email: data.email,
                        name: data.name,
                        updatedAt: new Date()
                    }
                }),

                // Update Committee record
                this.prisma.committee.update({
                    where: { committeeId: id },
                    data: {
                        namePrefix: data.namePrefix,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        updatedAt: new Date()
                    }
                })
            ]);

            return this.mapToModel(updatedUser, updatedCommittee);
        } catch (error) {
            console.error('Error updating committee:', error);
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            // Find the committee to get the userId
            const committee = await this.prisma.committee.findUnique({
                where: { committeeId: id },
                select: { userId: true }
            });

            if (!committee) {
                return false;
            }

            // Delete the user (which will cascade delete the committee)
            await this.prisma.user.delete({
                where: { userId: committee.userId }
            });

            return true;
        } catch (error) {
            console.error('Error deleting committee:', error);
            return false;
        }
    }

    private mapToModel(user: PrismaUser, committee: PrismaCommittee): CommitteeModel {
        return new CommitteeModel(
            user.userId,
            user.email,
            '', // We don't store or return plain text passwords
            user.hashedPassword,
            user.name,
            committee.committeeId,
            committee.namePrefix,
            committee.firstName,
            committee.lastName,
            committee.createdAt,
            committee.updatedAt
        );
    }
}