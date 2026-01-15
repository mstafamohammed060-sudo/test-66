// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as typeof globalThis & { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], // optional
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
