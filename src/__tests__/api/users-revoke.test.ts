import { POST } from "@/app/api/users/[userId]/revoke/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      update: jest.fn().mockResolvedValue({ id: "1", revoked: true }),
    },
  },
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { isAdmin: true } }),
}));
jest.mock("@/lib/nextauth", () => ({}));

describe("/api/users/[userId]/revoke", () => {
  it("revokes a user if admin", async () => {
    const req = {} as NextRequest;
    const context = { params: { userId: "1" } };
    const res = await POST(req, context);
    expect((await res.json()).success).toBe(true);
  });
});