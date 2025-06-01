import { POST, GET, DELETE } from "@/app/api/quiz-review/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/db", () => ({
  prisma: {
    adminQuiz: {
      create: jest
        .fn()
        .mockResolvedValue({ id: "1", title: "Quiz", questions: [] }),
      findMany: jest
        .fn()
        .mockResolvedValue([{ id: "1", title: "Quiz", questions: [] }]),
      delete: jest.fn().mockResolvedValue({}),
    },
  },
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { isAdmin: true } }),
}));
jest.mock("@/lib/nextauth", () => ({}));

describe("/api/quiz-review", () => {
  it("POST creates a quiz for admin", async () => {
    const req = { json: async () => ({ title: "Quiz", questions: [] }) } as any;
    const res = await POST(req);
    expect((await res.json()).quiz.title).toBe("Quiz");
  });

  it("GET returns quizzes for user", async () => {
    const req = { url: "http://localhost/api/quiz-review" } as any;
    const res = await GET(req);
    expect((await res.json()).quizzes.length).toBeGreaterThanOrEqual(0);
  });

  it("DELETE removes a quiz for admin", async () => {
    const req = { url: "http://localhost/api/quiz-review?id=1" } as any;
    const res = await DELETE(req);
    expect((await res.json()).success).toBe(true);
  });
});
