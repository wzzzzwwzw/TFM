import { POST, GET } from "@/app/api/game/route";

// Mock prisma
jest.mock("@/lib/db", () => ({
  prisma: {
    game: {
      create: jest.fn().mockResolvedValue({ id: "1" }),
      findUnique: jest.fn().mockResolvedValue({ id: "1", questions: [] }),
    },
    topicCount: {
      upsert: jest.fn(),
    },
    question: {
      createMany: jest.fn(),
    },
  },
}));

// Mock session
jest.mock("@/lib/nextauth", () => ({
  getAuthSession: jest.fn().mockResolvedValue({ user: { id: "1" } }),
}));

// Mock question generation
jest.mock("@/lib/generateQuestions", () => ({
  generateQuestions: jest.fn().mockImplementation(({ type }) => {
    if (type === "mcq") {
      return Promise.resolve([
        {
          question: "Q1",
          answer: "A1",
          option1: "B1",
          option2: "C1",
          option3: "D1",
        },
      ]);
    }
    // open_ended
    return Promise.resolve([
      {
        question: "Q2",
        answer: "A2",
      },
    ]);
  }),
}));

// Mock schema validation
jest.mock("@/schemas/forms/quiz", () => ({
  quizCreationSchema: {
    parse: (x: any) => x,
  },
}));

describe("/api/game", () => {
  it("POST creates an MCQ game", async () => {
    const req = { json: async () => ({ topic: "Math", type: "mcq", amount: 1 }) } as any;
    const res = await POST(req, {} as Response);
    const data = await res.json();
    expect(data.gameId).toBe("1");
  });

  it("POST creates an open-ended game", async () => {
    const req = { json: async () => ({ topic: "Math", type: "open_ended", amount: 1 }) } as any;
    const res = await POST(req, {} as Response);
    const data = await res.json();
    expect(data.gameId).toBe("1");
  });

  it("GET returns a game", async () => {
    const req = { url: "http://localhost/api/game?gameId=1" } as any;
    const res = await GET(req, {} as Response);
    const data = await res.json();
    expect(data.game.id).toBe("1");
    expect(Array.isArray(data.game.questions)).toBe(true);
  });
});