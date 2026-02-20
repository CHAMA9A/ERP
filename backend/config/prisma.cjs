// @ts-check
/**
 * Prisma Client Singleton
 * Ensures only one PrismaClient instance is created across the application
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

module.exports = prisma;
