import { hash } from "bcryptjs";

import { prisma, UserRole } from "../src/index.js";

const adminEmail = process.env.ADMIN_EMAIL ?? "test@mail.ru";
const adminPassword = process.env.ADMIN_PASSWORD ?? "12345";

async function main() {
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
