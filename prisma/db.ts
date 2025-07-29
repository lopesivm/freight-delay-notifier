import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

if (!global.__prisma__) {
  const client = new PrismaClient();

  const shutdown = async () => {
    try {
      await client.$disconnect();
      // eslint-disable-next-line no-process-exit
      process.exit(0);
    } catch (err) {
      console.error('Error during Prisma disconnect', err);
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  process.once('beforeExit', async () => {
    await client.$disconnect();
  });

  global.__prisma__ = client;
}

prisma = global.__prisma__;
export default prisma;
