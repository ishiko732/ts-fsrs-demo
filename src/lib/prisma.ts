import { PrismaClient } from "@prisma/client";
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}?connection_limit=40&pool_timeout=0`,
      },
    },
    log: [
      "warn",
      "error",
      {
        level: "query",
        emit: "event",
      },
    ],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
