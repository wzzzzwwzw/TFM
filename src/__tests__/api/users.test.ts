jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

import { GET } from "@/app/api/users/route";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";

jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("@/lib/nextauth", () => ({
  authOptions: {},
}));

describe("/api/users GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if not admin", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: false } });
    const response = await GET();
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns users if admin", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    const users = [
      { id: "1", email: "a@test.com", lastSeen: "2024-01-01", banned: false },
      { id: "2", email: "b@test.com", lastSeen: "2024-01-02", banned: true },
    ];
    (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

    const response = await GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(users);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        email: true,
        lastSeen: true,
        banned: true,
      },
    });
  });
  it("returns 401 if no session", async () => {
  (getServerSession as jest.Mock).mockResolvedValue(null);
  const response = await GET();
  expect(response.status).toBe(401);
  const json = await response.json();
  expect(json.error).toBe("Unauthorized");
});
});