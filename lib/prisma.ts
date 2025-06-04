import { PrismaClient } from '@prisma/client';
import { env, isDevelopment } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log queries in development, not production for security
    log: isDevelopment ? ['query'] : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

if (isDevelopment) globalForPrisma.prisma = prisma;
