// db.ts - ไฟล์สำหรับ singleton PrismaClient
import { PrismaClient } from "@prisma/client";
import { getPrismaClientOptions } from "../../prisma.config";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const options = getPrismaClientOptions();

export const prisma = globalForPrisma.prisma || new PrismaClient(options);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
