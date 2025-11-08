import { PrismaClient } from "@prisma/client";
import { seedAdmin } from "./admin";
import { seedInspectionItems } from "./inspection-items";
import { seedInspectionTypes } from "./inspection-types";
import { seedRequirements } from "./requirements";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding...`);

  // Create default admin first so other seeds can reference users if needed
  await seedAdmin(prisma);

  await seedInspectionTypes(prisma);
  await seedInspectionItems(prisma);
  await seedRequirements(prisma);

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
