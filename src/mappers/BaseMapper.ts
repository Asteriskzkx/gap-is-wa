export interface BaseMapper<PrismaEntity, DomainEntity> {
  toDomain(prismaEntity: PrismaEntity): DomainEntity;
  toPrisma(domainEntity: DomainEntity): any; // Return type for Prisma create/update operations
}
