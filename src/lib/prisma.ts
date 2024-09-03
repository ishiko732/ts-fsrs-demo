import { PrismaClient } from '@prisma/client';
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}`,
      },
    },
    log: [
      'warn',
      'error',
      // {
      //   level: 'query',
      //   emit: process.env.NODE_ENV === 'production' ? 'event' : 'stdout',
      // },
    ],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
