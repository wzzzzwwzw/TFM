import { POST } from "@/app/api/users/[userId]/ban/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      update: jest.fn().mockResolvedValue({ id: "1", banned: true }),
    },
  },
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { isAdmin: true } }),
}));
jest.mock("@/lib/nextauth", () => ({}));

describe("/api/users/[userId]/ban", () => {
  it("bans a user if admin", async () => {
    const req = {} as NextRequest;
    const context = { params: { userId: "1" } };
    const res = await POST(req, context);
    expect((await res.json()).success).toBe(true);
  });
});