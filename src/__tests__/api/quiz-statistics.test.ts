import { GET } from "@/app/api/quiz-statistics/route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

jest.mock("next-auth");
jest.mock("@/lib/db", () => ({
  prisma: {
    userQuizAttempt: {
      findMany: jest.fn(),
    },
  },
}));

describe("/api/quiz-statistics GET", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if not admin", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: false } });
    const response = await GET();
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns statistics for quizzes with attempts", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    (prisma.userQuizAttempt.findMany as jest.Mock).mockResolvedValue([
      { quizId: "q1", quizTitle: "Quiz 1", score: 8 },
      { quizId: "q1", quizTitle: "Quiz 1", score: 6 },
      { quizId: "q2", quizTitle: "Quiz 2", score: 10 },
    ]);
    const response = await GET();
    expect(response.status).toBe(200);
    const stats = await response.json();
    expect(stats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          quizId: "q1",
          quizTitle: "Quiz 1",
          attempts: 2,
          averageScore: 7,
          completionRate: 100,
        }),
        expect.objectContaining({
          quizId: "q2",
          quizTitle: "Quiz 2",
          attempts: 1,
          averageScore: 10,
          completionRate: 100,
        }),
      ])
    );
  });

  it("returns 0 averageScore if no attempts", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    (prisma.userQuizAttempt.findMany as jest.Mock).mockResolvedValue([]);
    const response = await GET();
    expect(response.status).toBe(200);
    const stats = await response.json();
    expect(stats).toEqual([]);
  });

  it("returns 0 averageScore if quiz has 0 attempts (edge case)", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    (prisma.userQuizAttempt.findMany as jest.Mock).mockResolvedValue([]);
    const response = await GET();
    expect(response.status).toBe(200);
    const stats = await response.json();
    expect(stats).toEqual([]);
  });
});