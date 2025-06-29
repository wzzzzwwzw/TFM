jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

import { POST, GET } from "@/app/api/user-quiz-stats/route";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";

jest.mock("@/lib/db", () => ({
  prisma: {
    userQuizAttempt: {
      create: jest.fn(),
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

describe("/api/user-quiz-stats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("creates a user quiz attempt and returns it", async () => {
      const mockAttempt = {
        id: "1",
        userId: "u1",
        quizId: "q1",
        quizTitle: "Quiz 1",
        answers: [{ q: 1, a: "A" }],
        score: 80,
      };
      (prisma.userQuizAttempt.create as jest.Mock).mockResolvedValue(mockAttempt);

      const req = {
        json: jest.fn().mockResolvedValue({
          userId: "u1",
          quizId: "q1",
          quizTitle: "Quiz 1",
          answers: [{ q: 1, a: "A" }],
          score: 80,
        }),
      } as any;
      const res = {} as any;
      const response = await POST(req);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.attempt).toEqual(mockAttempt);
      expect(prisma.userQuizAttempt.create).toHaveBeenCalledWith({
        data: {
          userId: "u1",
          quizId: "q1",
          quizTitle: "Quiz 1",
          answers: [{ q: 1, a: "A" }],
          score: 80,
        },
      });
    });

    it("returns 500 on error", async () => {
      (prisma.userQuizAttempt.create as jest.Mock).mockRejectedValue(new Error("fail"));

      const req = {
        json: jest.fn().mockResolvedValue({
          userId: "u1",
          quizId: "q1",
          quizTitle: "Quiz 1",
          answers: [{ q: 1, a: "A" }],
          score: 80,
        }),
      } as any;
      const res = {} as any;
      const response = await POST(req);
      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Failed to save attempt");
    });
  });

  describe("GET", () => {
    it("returns empty quizStats if not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const req = {} as any;
      const res = {} as any;
      const response = await GET(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.quizStats).toEqual([]);
    });

    it("returns aggregated quiz stats for user", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
      (prisma.userQuizAttempt.findMany as jest.Mock).mockResolvedValue([
        {
          quizId: "q1",
          quizTitle: "Quiz 1",
          score: 80,
          createdAt: new Date("2024-01-01"),
        },
        {
          quizId: "q1",
          quizTitle: "Quiz 1",
          score: 90,
          createdAt: new Date("2024-01-02"),
        },
        {
          quizId: "q2",
          quizTitle: "Quiz 2",
          score: 70,
          createdAt: new Date("2024-01-03"),
        },
      ]);

      const req = {} as any;
      const res = {} as any;
      const response = await GET(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.quizStats.length).toBe(2);
      expect(json.quizStats).toEqual([
        {
          id: "q1",
          title: "Quiz 1",
          attempts: 2,
          averageScore: 85,
          lastAttempt: new Date("2024-01-02"),
        },
        {
          id: "q2",
          title: "Quiz 2",
          attempts: 1,
          averageScore: 70,
          lastAttempt: new Date("2024-01-03"),
        },
      ]);
    });

    it("returns empty quizStats on error", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
      (prisma.userQuizAttempt.findMany as jest.Mock).mockRejectedValue(new Error("fail"));

      const req = {} as any;
      const res = {} as any;
      const response = await GET(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.quizStats).toEqual([]);
    });
  });
});