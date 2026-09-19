import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await bcrypt.hash("password123", 10);
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {
      nmPengguna: "Administrator Sistem Bapenda",
      level: 1,
      roleName: "ADMIN",
      status: 1,
    },
    create: {
      username: "admin",
      password: defaultPassword,
      nmPengguna: "Administrator Sistem Bapenda",
      email: "admin@bphtb.daerah.go.id",
      level: 1,
      roleName: "ADMIN",
      status: 1,
    },
  });
  console.log("Admin BPHTB default siap:", admin.username);
}

main().finally(async () => {
  await prisma.$disconnect();
});
