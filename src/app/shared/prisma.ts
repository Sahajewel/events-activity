import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
// src/app/shared/prisma.ts

import { Pool } from "pg";
// import { PrismaPg } from "@prisma/adapter-pg"; // CORRECTED IMPORT NAME

// 1. Create the Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. Create the PrismaPg adapter
const adapter = new PrismaPg(pool); // CORRECTED CLASS NAME

// 3. Initialize Prisma Client with the adapter
const prisma = new PrismaClient({
  adapter: adapter,
});

export default prisma;
