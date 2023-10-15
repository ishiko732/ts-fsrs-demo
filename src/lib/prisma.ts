import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `${process.env.DATABASE_URL}&connection_limit=40&pool_timeout=0`,
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
export default prisma
