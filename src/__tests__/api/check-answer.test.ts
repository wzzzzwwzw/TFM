import { POST } from "@/app/api/checkAnswer/route";
import { ZodError } from "zod";

jest.mock("@/lib/db", () => ({
  prisma: {
    question: {
      findUnique: jest.fn().mockResolvedValue({ id: "1", answer: "42", questionType: "mcq" }),
      update: jest.fn().mockResolvedValue({}),
    },
  }
}));

jest.mock("@/schemas/questions", () => ({
  checkAnswerSchema: { parse: (x: any) => x },
}));
jest.mock("string-similarity", () => ({
  compareTwoStrings: jest.fn().mockReturnValue(1),
}));

describe("/api/checkAnswer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns isCorrect for MCQ", async () => {
    const req = { json: async () => ({ questionId: "1", userInput: "42" }) } as any;
    const res = await POST(req as Request, {} as Response);
    expect(res).toBeDefined();
    if (!res) throw new Error("Response is undefined");
    const json = await res.json();
    expect(json.isCorrect).toBe(true);
  });

  it("returns percentageSimilar for open_ended", async () => {
    const { prisma } = require("@/lib/db");
    prisma.question.findUnique.mockResolvedValueOnce({
      id: "2",
      answer: "answer",
      questionType: "open_ended",
    });
    const req = { json: async () => ({ questionId: "2", userInput: "answer" }) } as any;
    const res = await POST(req as Request, {} as Response);
    expect(res).toBeDefined();
    if (!res) throw new Error("Response is undefined");
    const json = await res.json();
    expect(json.percentageSimilar).toBe(100);
  });

  it("returns 404 if question not found", async () => {
    const { prisma } = require("@/lib/db");
    prisma.question.findUnique.mockResolvedValueOnce(null);
    const req = { json: async () => ({ questionId: "999", userInput: "foo" }) } as any;
    const res = await POST(req as Request, {} as Response);
    expect(res).toBeDefined();
    if (!res) throw new Error("Response is undefined");
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.message).toBe("Question not found");
  });

  it("returns 400 if validation fails", async () => {
    // Override the parse method to throw a ZodError
    const { checkAnswerSchema } = require("@/schemas/questions");
    checkAnswerSchema.parse = () => { throw new ZodError([{ code: "custom", message: "Invalid", path: ["questionId"] }]); };

    const req = { json: async () => ({}) } as any;
    const res = await POST(req as Request, {} as Response);
    expect(res).toBeDefined();
    if (!res) throw new Error("Response is undefined");
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBeDefined();
  });
});