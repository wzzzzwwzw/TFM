import { POST, GET } from "@/app/api/user-quiz-stats/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/db", () => ({
  prisma: {
    userQuizAttempt: {
      create: jest.fn().mockResolvedValue({ id: "1" }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { id: "1" } }),
}));
jest.mock("@/lib/nextauth", () => ({}));

describe("/api/user-quiz-stats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { getServerSession } = require("next-auth");
    getServerSession.mockResolvedValue({ user: { id: "1" } });
  });

  it("POST saves an attempt", async () => {
    const req = { json: async () => ({ userId: "1", quizId: "1", quizTitle: "Quiz", answers: [], score: 100 }) } as any;
    const res = await POST(req);
    expect((await res.json()).attempt).toBeDefined();
  });

  it("POST returns 500 if DB error", async () => {
    const { prisma } = require("@/lib/db");
    prisma.userQuizAttempt.create.mockImplementationOnce(async () => { throw new Error("DB error"); });
    const req = { json: async () => ({ userId: "1", quizId: "1", quizTitle: "Quiz", answers: [], score: 100 }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Failed to save attempt");
  });

  it("GET returns stats", async () => {
    const req = {} as NextRequest;
    const res = await GET(req);
    expect((await res.json()).quizStats).toBeDefined();
  });

  it("GET returns empty stats if no session", async () => {
    const { getServerSession } = require("next-auth");
    getServerSession.mockResolvedValueOnce(null);
    const req = {} as NextRequest;
    const res = await GET(req);
    expect((await res.json()).quizStats).toEqual([]);
  });

  it("GET aggregates stats correctly", async () => {
    const { prisma } = require("@/lib/db");
    const now = new Date();
    prisma.userQuizAttempt.findMany.mockResolvedValueOnce([
      { quizId: "1", quizTitle: "Quiz 1", score: 80, createdAt: now },
      { quizId: "1", quizTitle: "Quiz 1", score: 100, createdAt: now },
      { quizId: "2", quizTitle: "Quiz 2", score: 50, createdAt: now },
    ]);
    const req = {} as NextRequest;
    const res = await GET(req);
    const stats = (await res.json()).quizStats;
    expect(stats.length).toBe(2);
    expect(stats.find((s: any) => s.id === "1").averageScore).toBe(90);
    expect(stats.find((s: any) => s.id === "2").averageScore).toBe(50);
  });

  it("GET returns empty stats if DB error", async () => {
    const { prisma } = require("@/lib/db");
    prisma.userQuizAttempt.findMany.mockImplementationOnce(async () => { throw new Error("DB error"); });
    const req = {} as NextRequest;
    const res = await GET(req);
    expect((await res.json()).quizStats).toEqual([]);
  });
});