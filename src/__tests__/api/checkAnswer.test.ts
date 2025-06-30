
jest.mock("next/server", () => {
  return {
    NextResponse: {
      json: (data: any, init?: any) => ({
        status: init?.status ?? 200,
        json: async () => data,
      }),
    },
  };
});
import 'cross-fetch/polyfill';
import { POST } from "@/app/api/checkAnswer/route";
import { prisma } from "@/lib/db";


jest.mock("@/lib/db", () => ({
  prisma: {
    question: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("/api/checkAnswer POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 if question not found", async () => {
    (prisma.question.findUnique as jest.Mock).mockResolvedValue(null);

    const req = { json: jest.fn().mockResolvedValue({ questionId: "q1", userInput: "A" }) } as any;
    const res = {} as any;
    const response = await POST(req, res);
    expect(response).toBeDefined();
    if (!response) throw new Error("No response returned from POST");

    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.message).toBe("Question not found");
  });

  it("checks MCQ answer and returns isCorrect", async () => {
    (prisma.question.findUnique as jest.Mock).mockResolvedValue({
      id: "q1",
      questionType: "mcq",
      answer: "A",
    });

    const req = { json: jest.fn().mockResolvedValue({ questionId: "q1", userInput: "a" }) } as any;
    const res = {} as any;
    (prisma.question.update as jest.Mock).mockResolvedValue({});

    const response = await POST(req, res);
    expect(response).toBeDefined();
    if (!response) throw new Error("No response returned from POST");
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.isCorrect).toBe(true);
    expect(prisma.question.update).toHaveBeenCalledWith({
      where: { id: "q1" },
      data: { isCorrect: true },
    });
  });

  it("checks open_ended answer and returns percentageSimilar", async () => {
    (prisma.question.findUnique as jest.Mock).mockResolvedValue({
      id: "q2",
      questionType: "open_ended",
      answer: "Hello",
    });

    const req = { json: jest.fn().mockResolvedValue({ questionId: "q2", userInput: "hello" }) } as any;
    const res = {} as any;
    (prisma.question.update as jest.Mock).mockResolvedValue({});

    const response = await POST(req, res);
    expect(response).toBeDefined();
    if (!response) throw new Error("No response returned from POST");
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.percentageSimilar).toBe(100);
    expect(prisma.question.update).toHaveBeenCalledWith({
      where: { id: "q2" },
      data: { percentageCorrect: 100 },
    });
  });

  it("returns 400 for invalid input", async () => {
    // Missing userInput
    const req = { json: jest.fn().mockResolvedValue({ questionId: "q1" }) } as any;
    const res = {} as any;
    const response = await POST(req, res);
    expect(response).toBeDefined();
    if (!response) throw new Error("No response returned from POST");
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.message).toBeDefined();
  });
});