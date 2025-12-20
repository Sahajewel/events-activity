"use strict";
// prisma/seed.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg"); // pg package already আছে তোমার project-এ
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // .env থেকে DATABASE_URL load করবে
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
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
