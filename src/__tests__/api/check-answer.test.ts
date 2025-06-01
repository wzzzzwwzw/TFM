import { POST }  from "@/app/api/checkAnswer/route";

jest.mock("@/lib/db", () => ({
  prisma: {
    question: {
      findUnique: jest.fn().mockResolvedValue({ id: "1", answer: "42", questionType: "mcq" }),
      update: jest.fn().mockResolvedValue({}),
    },
  },
}));
jest.mock("@/schemas/questions", () => ({
  checkAnswerSchema: { parse: (x: any) => x },
}));
jest.mock("string-similarity", () => ({
  compareTwoStrings: jest.fn().mockReturnValue(1),
}));

describe("/api/checkAnswer", () => {
  it("returns isCorrect for MCQ", async () => {
    const req = { json: async () => ({ questionId: "1", userInput: "42" }) } as any;
    const res = await POST(req, {} as Response);
    expect(res).toBeDefined();
    if (res) {
      expect((await res.json()).isCorrect).toBe(true);
    }
  });
});