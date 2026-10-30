import { PrismaClient } from "@prisma/client";

const runtimeDatabaseUrl = process.env.DATABASE_URL
  ? (() => {
      const url = new URL(process.env.DATABASE_URL);

      // Prisma Client 6's library engine cannot connect to Neon with this option.
      // TLS remains required by the `sslmode=require` URL option.
      url.searchParams.delete("channel_binding");
      // Allow time for Neon to wake its compute and establish the connection.
      if (!url.searchParams.has("connect_timeout")) {
        url.searchParams.set("connect_timeout", "15");
      }
      if (!url.searchParams.has("pool_timeout")) {
        url.searchParams.set("pool_timeout", "20");
      }

      return url.toString();
    })()
  : undefined;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaDatabaseUrl?: string;
};

export const prisma =
  (globalForPrisma.prismaDatabaseUrl === runtimeDatabaseUrl
    ? globalForPrisma.prisma
    : undefined) ??
  new PrismaClient({
    ...(runtimeDatabaseUrl
      ? { datasources: { db: { url: runtimeDatabaseUrl } } }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaDatabaseUrl = runtimeDatabaseUrl;
}

export default prisma;
