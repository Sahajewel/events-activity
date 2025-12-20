// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg"; // pg package already আছে তোমার project-এ
import dotenv from "dotenv";

dotenv.config(); // .env থেকে DATABASE_URL load করবে

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.coupon.upsert({
    where: { code: "WELCOME20" },
    update: {},
    create: {
      code: "WELCOME20",
      discount: 20,
      type: "PERCENTAGE",
      isActive: true,
      maxUses: null,
      usedCount: 0,
      expiresAt: null,
      minAmount: 0,
    },
  });

  console.log("WELCOME20 coupon seeded successfully! 🎉");
}

main()
  .catch((e) => {
    console.error("Error seeding coupon:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // pool close করা important
  });
