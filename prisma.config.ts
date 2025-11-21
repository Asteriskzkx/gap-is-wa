// Prisma configuration for Migrate and runtime client options.
// Move connection URLs here (migrateUrl, shadowDatabaseUrl).
// At runtime, pass either { adapter } (direct DB) or { accelerateUrl } to PrismaClient.

export const migrateUrl = process.env.DATABASE_URL;
export const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL;

export function getPrismaClientOptions(): any {
  // If using Prisma Accelerate, provide its URL
  if (process.env.PRISMA_ACCELERATE_URL) {
    return { accelerateUrl: process.env.PRISMA_ACCELERATE_URL };
  }

  // Otherwise, provide adapter value for a direct DB connection (migrateUrl moved here)
  if (process.env.DATABASE_URL) {
    return { adapter: process.env.DATABASE_URL };
  }

  return {};
}
