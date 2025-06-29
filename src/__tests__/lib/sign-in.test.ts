import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("NextAuth Google sign-in", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("adds user fields to JWT and session after Google sign-in", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: "user123",
      isAdmin: true,
      banned: false,
      email: "test@example.com",
    });
    (prisma.user.update as jest.Mock).mockResolvedValue({});

    const token = { email: "test@example.com", id: "" };
    // @ts-expect-error: ignore type mismatch for test
    const jwt = await authOptions.callbacks!.jwt!({ token });

    const session = { user: {}, expires: "" };
    // @ts-expect-error: ignore type mismatch for test
    const sessionOut = await authOptions.callbacks!.session!({ session, token: jwt }); // <-- await here
    expect(sessionOut.user).toBeDefined();
    expect((sessionOut.user as { id: string; isAdmin: boolean; banned: boolean }).id).toBe("user123");
    expect((sessionOut.user as { id: string; isAdmin: boolean; banned: boolean }).isAdmin).toBe(true);
    expect((sessionOut.user as { id: string; isAdmin: boolean; banned: boolean }).banned).toBe(false);
  });

  it("retries DB update on lock timeout error", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: "user123",
      isAdmin: false,
      banned: false,
      email: "test@example.com",
    });
    let callCount = 0;
    (prisma.user.update as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount < 2) {
        const err = new Error("Lock wait timeout");
        // @ts-ignore
        err.code = "P2034";
        throw err;
      }
      return {};
    });

    const token = { email: "test@example.com", id: "" };
    // @ts-expect-error: ignore type mismatch for test
    await authOptions.callbacks!.jwt!({ token });
    expect(callCount).toBe(2);
  });

  it("throws error if DB update fails with unknown error", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: "user123",
      isAdmin: false,
      banned: false,
      email: "test@example.com",
    });
    (prisma.user.update as jest.Mock).mockImplementation(() => {
      throw new Error("Some other DB error");
    });

    const token = { email: "test@example.com", id: "" };
    // @ts-expect-error: ignore type mismatch for test
    await expect(authOptions.callbacks!.jwt!({ token })).rejects.toThrow("Some other DB error");
  });

  it("returns token unchanged if user not found", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

    const token = { email: "notfound@example.com", id: "" };
    // @ts-expect-error: ignore type mismatch for test
    const jwt = await authOptions.callbacks!.jwt!({ token });
    expect(jwt).toBe(token);
  });
});