import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

type GlobalPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalPrisma;

const createPrismaClient = (): PrismaClient => {
  const connectionString =
    process.env.DATABASE_URL ?? process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL or DIRECT_URL must be set for Prisma Client.");
  }

  const connectionUrl = new URL(connectionString);
  connectionUrl.searchParams.delete("sslmode");
  connectionUrl.searchParams.delete("sslcert");
  connectionUrl.searchParams.delete("sslkey");
  connectionUrl.searchParams.delete("sslrootcert");
  const adapterConnectionString = connectionUrl.toString();

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: adapterConnectionString,
      ssl: { rejectUnauthorized: false },
    }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
};

const getPrismaClient = (): PrismaClient => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
};

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrismaClient();
    return Reflect.get(client, property, receiver);
  },
});
