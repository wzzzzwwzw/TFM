import { authOptions } from "@/lib/nextauth";

// Mock the prisma module to always have a user.update mock
jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      update: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";

describe("NextAuth signIn callback", () => {
  it("sets isOnline to true when signing in with Google", async () => {
    const user = { id: "1", email: "test@example.com" };
    const account = { provider: "google", providerAccountId: "google-1", type: "oauth" as const };

    (prisma.user.update as jest.Mock).mockResolvedValue({});

    const result = await authOptions.callbacks?.signIn?.({
      user,
      account,
      profile: {},
      email: {},
      credentials: {},
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      data: { isOnline: true },
    });
    expect(result).toBe(true);
  });
});