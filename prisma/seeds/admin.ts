import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

export async function seedAdmin(prisma: PrismaClient) {
  console.log(`Seeding default admin user...`);

  const email = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.DEFAULT_ADMIN_PASSWORD ?? "admin1234"; // change in prod
  const name = process.env.DEFAULT_ADMIN_NAME ?? "System Admin";

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Upsert user by email (idempotent)
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      hashedPassword,
      role: UserRole.ADMIN,
    },
    create: {
      email,
      hashedPassword,
      name,
      role: UserRole.ADMIN,
    },
  });

  // Upsert admin profile (required fields)
  // Use a simple default namePrefix/firstName/lastName — adjust as needed
  await prisma.admin.upsert({
    where: { userId: user.userId },
    update: {
      firstName: name,
      lastName: name,
    },
    create: {
      userId: user.userId,
      namePrefix: "นาย",
      firstName: name,
      lastName: name,
    },
  });

  console.log(`Default admin ensured: ${email}`);
  console.log("NOTE: change DEFAULT_ADMIN_PASSWORD in env before production.");
}
