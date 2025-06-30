jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

import { POST, GET, DELETE } from "@/app/api/quiz-review/route";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";


jest.mock("@/lib/db", () => ({
  prisma: {
    adminQuiz: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("@/lib/nextauth", () => ({
  authOptions: {},
}));

describe("/api/quiz-review", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("returns 401 if not admin", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: false } });
      const req = { json: jest.fn().mockResolvedValue({}) } as any;
      const res = {} as any;
      const response = await POST(req);
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("creates a quiz with title from fileName if title missing", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
      (prisma.adminQuiz.create as jest.Mock).mockResolvedValue({
        id: "1",
        title: "SampleQuiz",
        category: "cat",
        difficulty: "easy",
        questions: [{ question: "Q1", answer: "A1" }],
      });
      const req = {
        json: jest.fn().mockResolvedValue({
          fileName: "SampleQuiz.json",
          category: "cat",
          difficulty: "easy",
          questions: [{ question: "Q1", answer: "A1" }],
        }),
      } as any;
      const res = {} as any;
      const response = await POST(req);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.quiz.title).toBe("SampleQuiz");
      expect(prisma.adminQuiz.create).toHaveBeenCalled();
    });

    it("creates a quiz with 'Untitled Quiz' if no title or fileName", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
      (prisma.adminQuiz.create as jest.Mock).mockResolvedValue({
        id: "2",
        title: "Untitled Quiz",
        category: "cat",
        difficulty: "easy",
        questions: [{ question: "Q2", answer: "A2" }],
      });
      const req = {
        json: jest.fn().mockResolvedValue({
          category: "cat",
          difficulty: "easy",
          questions: [{ question: "Q2", answer: "A2" }],
        }),
      } as any;
      const res = {} as any;
      const response = await POST(req);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.quiz.title).toBe("Untitled Quiz");
    });

    it("returns 500 on error", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
      (prisma.adminQuiz.create as jest.Mock).mockRejectedValue(new Error("fail"));
      const req = {
        json: jest.fn().mockResolvedValue({
          title: "Quiz",
          category: "cat",
          difficulty: "easy",
          questions: [{ question: "Q", answer: "A" }],
        }),
      } as any;
      const res = {} as any;
      const response = await POST(req);
      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Failed to save quiz");
    });
  });

  describe("GET", () => {
    it("returns 401 if not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      const req = { url: "http://localhost/api/quiz-review" } as any;
      const res = {} as any;
      const response = await GET(req);
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("returns quizzes with filters", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
      (prisma.adminQuiz.findMany as jest.Mock).mockResolvedValue([
        { id: "1", title: "Quiz1", category: "cat", difficulty: "easy", questions: [] },
      ]);
      const req = { url: "http://localhost/api/quiz-review?category=cat&difficulty=easy" } as any;
      const res = {} as any;
      const response = await GET(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.quizzes.length).toBe(1);
      expect(prisma.adminQuiz.findMany).toHaveBeenCalledWith({
        where: { category: "cat", difficulty: "easy" },
        include: { questions: true },
      });
    });
  });

  describe("DELETE", () => {
    it("returns 401 if not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      const req = { url: "http://localhost/api/quiz-review?id=1" } as any;
      const res = {} as any;
      const response = await DELETE(req);
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("returns 400 if id is missing", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
      const req = { url: "http://localhost/api/quiz-review" } as any;
      const res = {} as any;
      const response = await DELETE(req);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Missing quiz id");
    });

    it("deletes quiz and returns success", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
      (prisma.adminQuiz.delete as jest.Mock).mockResolvedValue({});
      const req = { url: "http://localhost/api/quiz-review?id=1" } as any;
      const res = {} as any;
      const response = await DELETE(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(prisma.adminQuiz.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("returns 500 on error", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
      (prisma.adminQuiz.delete as jest.Mock).mockRejectedValue(new Error("fail"));
      const req = { url: "http://localhost/api/quiz-review?id=1" } as any;
      const res = {} as any;
      const response = await DELETE(req);
      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Failed to delete quiz");
    });
  });
});