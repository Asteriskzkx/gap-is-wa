import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

export async function seedAdmin(prisma: PrismaClient) {
  console.log(`Seeding default admin user...`);

  const email = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.DEFAULT_ADMIN_PASSWORD ?? "admin1234"; // change in prod
  const name = process.env.DEFAULT_ADMIN_NAME ?? "System Admin";

  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  let user;
  if (existingUser) {
    // User already exists - don't update password or other fields
    console.log(`Admin user already exists: ${email} - skipping update`);
    user = existingUser;
  } else {
    // Hash password for new user only
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        name,
        role: UserRole.ADMIN,
      },
    });
    console.log(`Created new admin user: ${email}`);
  }

  // Ensure admin profile exists (safe to upsert profile without sensitive data)
  const existingAdmin = await prisma.admin.findUnique({
    where: { userId: user.userId },
  });

  if (existingAdmin) {
    console.log(`Admin profile already exists for user: ${email}`);
  } else {
    await prisma.admin.create({
      data: {
        userId: user.userId,
        namePrefix: "นาย",
        firstName: name,
        lastName: name,
      },
    });
    console.log(`Created admin profile for user: ${email}`);
  }

  console.log("NOTE: change DEFAULT_ADMIN_PASSWORD in env before production.");
}
