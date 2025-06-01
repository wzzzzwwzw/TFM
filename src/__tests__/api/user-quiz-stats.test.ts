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
  it("POST saves an attempt", async () => {
    const req = { json: async () => ({ userId: "1", quizId: "1", quizTitle: "Quiz", answers: [], score: 100 }) } as any;
    const res = await POST(req);
    expect((await res.json()).attempt).toBeDefined();
  });

  it("GET returns stats", async () => {
    const req = {} as NextRequest;
    const res = await GET(req);
    expect((await res.json()).quizStats).toBeDefined();
  });
});