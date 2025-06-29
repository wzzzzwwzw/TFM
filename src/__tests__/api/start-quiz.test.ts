jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));
import { GET } from "@/app/api/start-quiz/route";
import { prisma } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  prisma: {
    adminQuiz: {
      findUnique: jest.fn(),
    },
  },
}));

describe("/api/start-quiz/[id] GET", () => {
  const mockParams = (id: string) => ({ params: { id } });

  it("returns 400 if no quizId", async () => {
    const req = {} as any;
    const response = await GET(req, { params: { id: "" } });
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Quiz ID is required.");
  });

  it("returns 404 if quiz not found", async () => {
    (prisma.adminQuiz.findUnique as jest.Mock).mockResolvedValue(null);
    const req = {} as any;
    const response = await GET(req, mockParams("nonexistent"));
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe("Quiz not found.");
  });

  it("returns quiz if found", async () => {
    const quiz = { id: "1", title: "Test Quiz", questions: [] };
    (prisma.adminQuiz.findUnique as jest.Mock).mockResolvedValue(quiz);
    const req = {} as any;
    const response = await GET(req, mockParams("1"));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.quiz).toEqual(quiz);
  });

  it("returns 500 on error", async () => {
    (prisma.adminQuiz.findUnique as jest.Mock).mockRejectedValue(new Error("fail"));
    const req = {} as any;
    const response = await GET(req, mockParams("1"));
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Failed to load quiz.");
  });
});