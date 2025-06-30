jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

import { POST } from "@/app/api/users/[userId]/unrevoke/route";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";

jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      update: jest.fn(),
    },
  },
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("@/lib/nextauth", () => ({
  authOptions: {},
}));

describe("/api/users/[userId]/unrevoke POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if not admin", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: false } });
    const req = {} as any;
    const context = { params: { userId: "1" } };
    const response = await POST(req, context);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 401 if no session", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = {} as any;
    const context = { params: { userId: "1" } };
    const response = await POST(req, context);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("unrevokes user if admin", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    (prisma.user.update as jest.Mock).mockResolvedValue({});
    const req = {} as any;
    const context = { params: { userId: "1" } };
    const response = await POST(req, context);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { revoked: false },
    });
  });

  it("returns 500 if update fails", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    (prisma.user.update as jest.Mock).mockRejectedValue(new Error("fail"));
    const req = {} as any;
    const context = { params: { userId: "1" } };
    const response = await POST(req, context);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Failed to unrevoke user");
  });
});