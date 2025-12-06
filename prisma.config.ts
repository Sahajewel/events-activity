import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma",
  datasource: {
    url: process.env.DATABASE_URL!, // Prisma 7 uses this instead of schema.prisma
  }, // FIXED path
  migrations: {
    path: "./prisma/migrations",
  },
});
