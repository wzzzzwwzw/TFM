describe("prisma client singleton", () => {
  afterEach(() => {
    jest.resetModules();
    delete (global as any).cachedPrisma;
  });

  it("creates a new PrismaClient in production", () => {
    (process.env as any).NODE_ENV = "production";
    jest.resetModules();
    const { prisma } = require("@/lib/db");
    // Only check for a PrismaClient method:
    expect(typeof prisma.$connect).toBe("function");
  });

  it("reuses global PrismaClient in development", () => {
    (process.env as any).NODE_ENV = "development";
    jest.resetModules();
    const { prisma: prisma1 } = require("@/lib/db");
    const { prisma: prisma2 } = require("@/lib/db");
    expect(prisma1).toBe(prisma2);
  });

  it("returns the cached PrismaClient if already set in development", () => {
    (process.env as any).NODE_ENV = "development";
    jest.resetModules();
    const fake = { test: "cached" };
    (global as any).cachedPrisma = fake;
    const { prisma } = require("@/lib/db");
    expect(prisma).toBe(fake);
  });
});