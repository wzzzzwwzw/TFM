import { POST } from "@/app/api/setAdmin/route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

jest.mock("next-auth");
jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      update: jest.fn(),
    },
  },
}));

describe("/api/setAdmin POST", () => {
  const mockParams = { id: "user123" };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if user is not admin", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: false } });
    const req = {} as Request;
    const res = await POST(req, { params: mockParams });
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("assigns admin role and returns success if user is admin", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    (prisma.user.update as jest.Mock).mockResolvedValue({ id: "user123", isAdmin: true });
    const req = {} as Request;
    const res = await POST(req, { params: mockParams });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.user).toEqual({ id: "user123", isAdmin: true });
  });

  it("returns 500 if prisma throws error", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    (prisma.user.update as jest.Mock).mockRejectedValue(new Error("DB error"));
    const req = {} as Request;
    const res = await POST(req, { params: mockParams });
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Failed to assign admin role.");
  });
});