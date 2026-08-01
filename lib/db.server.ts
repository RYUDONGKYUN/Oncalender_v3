let prisma: any;

try {
  const { PrismaClient } = require('@prisma/client');
  const globalForPrisma = global as unknown as { prisma: any };

  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: ['query'],
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} catch (error) {
  console.error('Failed to load Prisma client:', error);
}

export { prisma };
