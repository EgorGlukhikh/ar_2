import { hash } from "bcryptjs";

import { prisma, UserRole } from "../src/index.js";
import { seedShowcaseAcademy } from "./showcase-seed.js";

const adminEmail = process.env.ADMIN_EMAIL ?? "test@mail.ru";
const adminPassword = process.env.ADMIN_PASSWORD ?? "123456";
const bootstrapUserEmail = process.env.BOOTSTRAP_USER_EMAIL?.trim().toLowerCase();
const bootstrapUserPassword = process.env.BOOTSTRAP_USER_PASSWORD;
const bootstrapUserName = process.env.BOOTSTRAP_USER_NAME?.trim();
const bootstrapUserRole = process.env.BOOTSTRAP_USER_ROLE?.trim().toUpperCase();

function resolveBootstrapUserRole() {
  if (!bootstrapUserRole) {
    return UserRole.AUTHOR;
  }

  if (Object.values(UserRole).includes(bootstrapUserRole as UserRole)) {
    return bootstrapUserRole as UserRole;
  }

  console.warn(
    `Skipping bootstrap workspace user because BOOTSTRAP_USER_ROLE="${bootstrapUserRole}" is invalid.`,
  );

  return null;
}

async function main() {
  console.log(`[seed] Starting database seed at ${new Date().toISOString()}`);
  const passwordHash = await hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Test Admin",
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      passwordHash,
    },
    update: {
      name: "Test Admin",
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      passwordHash,
    },
  });

  console.log(`[seed] Admin user ensured for ${adminEmail}`);

  if (!bootstrapUserEmail && !bootstrapUserPassword) {
    console.log("[seed] No bootstrap workspace user configured. Skipping.");
    await seedShowcaseAcademy(null);
    console.log("[seed] Showcase academy catalog ensured.");
    return;
  }

  if (!bootstrapUserEmail || !bootstrapUserPassword) {
    console.warn(
      "Skipping bootstrap workspace user because BOOTSTRAP_USER_EMAIL or BOOTSTRAP_USER_PASSWORD is missing.",
    );
    return;
  }

  const role = resolveBootstrapUserRole();

  if (!role) {
    return;
  }

  const bootstrapPasswordHash = await hash(bootstrapUserPassword, 10);

  await prisma.user.upsert({
    where: { email: bootstrapUserEmail },
    create: {
      email: bootstrapUserEmail,
      name: bootstrapUserName || bootstrapUserEmail,
      role,
      emailVerified: new Date(),
      passwordHash: bootstrapPasswordHash,
    },
    update: {
      name: bootstrapUserName || bootstrapUserEmail,
      role,
      emailVerified: new Date(),
      passwordHash: bootstrapPasswordHash,
    },
  });

  console.log(
    `[seed] Bootstrap workspace user ensured for ${bootstrapUserEmail} with role ${role}`,
  );

  await seedShowcaseAcademy(bootstrapUserEmail);
  console.log("[seed] Showcase academy catalog ensured.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
