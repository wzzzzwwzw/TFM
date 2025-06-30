import { POST } from "@/app/api/sign-out/route";
import { prisma } from "@/lib/db";
import * as nextAuth from "next-auth";
import { NextRequest } from "next/server";


jest.mock("next-auth");

beforeAll(() => {
  // @ts-ignore
  prisma.user = { update: jest.fn() };
  jest.spyOn(console, "error").mockImplementation(() => {});
});
describe("POST /api/sign-out (unit)", () => {
  it("returns success true when user signs out", async () => {
    // Mock session
    (nextAuth.getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "test@example.com" },
    });
    // Mock prisma update
    (prisma.user.update as jest.Mock).mockResolvedValue({});

    const req = {} as NextRequest;
    const res = await POST(req);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
    where: { email: "test@example.com" },
    data: { isOnline: false },
  });
  });

  it("returns 404 if user not found", async () => {
    (nextAuth.getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "notfound@example.com" },
    });
    (prisma.user.update as jest.Mock).mockRejectedValue({ code: "P2025" });

    const req = {} as NextRequest;
    const res = await POST(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/no encontrado/i);
  });

  it("returns 503 if DB connection error", async () => {
    (nextAuth.getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "test@example.com" },
    });
    (prisma.user.update as jest.Mock).mockRejectedValue({ code: "ECONNREFUSED" });

    const req = {} as NextRequest;
    const res = await POST(req);

    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/base de datos/i);
  });

  it("returns 500 for unexpected error", async () => {
    (nextAuth.getServerSession as jest.Mock).mockResolvedValue({
      user: { email: "test@example.com" },
    });
    (prisma.user.update as jest.Mock).mockRejectedValue(new Error("fail"));

    const req = {} as NextRequest;
    const res = await POST(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/inesperado/i);
  });
});