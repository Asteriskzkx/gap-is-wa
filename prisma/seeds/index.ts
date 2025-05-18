import { prisma } from "../../src/utils/db";
import { seedInspectionTypes } from "./inspection-types";
import { seedInspectionItems } from "./inspection-items";
import { seedRequirements } from "./requirements";

async function main() {
  console.log(`Start seeding...`);

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
