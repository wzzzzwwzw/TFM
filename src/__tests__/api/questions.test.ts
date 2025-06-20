import { POST } from "@/app/api/questions/route";

// Mock strict_output (OpenAI)
jest.mock("@/lib/gpt", () => ({
  strict_output: jest.fn().mockImplementation((_prompt, _arr, _schema) => {
    // Return different mock data based on schema
    if (_schema.option1) {
      // MCQ
      return Promise.resolve([
        {
          question: "MCQ Q1",
          answer: "A1",
          option1: "B1",
          option2: "C1",
          option3: "D1",
        },
      ]);
    }
    // Open-ended
    return Promise.resolve([
      {
        question: "Open Q1",
        answer: "A1",
      },
    ]);
  }),
}));

// Mock session
jest.mock("@/lib/nextauth", () => ({
  getAuthSession: jest.fn().mockResolvedValue({ user: { id: "1" } }),
}));

// Mock schema validation
jest.mock("@/schemas/questions", () => ({
  getQuestionsSchema: {
    parse: (x: any) => x,
  },
}));

describe("/api/questions", () => {
  it("POST returns open-ended questions", async () => {
    const req = { json: async () => ({ amount: 1, topic: "Math", type: "open_ended" }) } as any;
    const res = await POST(req, {} as Response);
    const data = await res.json();
    expect(data.questions.length).toBeGreaterThan(0);
    expect(data.questions[0]).toHaveProperty("question");
    expect(data.questions[0]).toHaveProperty("answer");
  });

  it("POST returns MCQ questions", async () => {
    const req = { json: async () => ({ amount: 1, topic: "Math", type: "mcq" }) } as any;
    const res = await POST(req, {} as Response);
    const data = await res.json();
    expect(data.questions.length).toBeGreaterThan(0);
    expect(data.questions[0]).toHaveProperty("question");
    expect(data.questions[0]).toHaveProperty("answer");
    expect(data.questions[0]).toHaveProperty("option1");
    expect(data.questions[0]).toHaveProperty("option2");
    expect(data.questions[0]).toHaveProperty("option3");
  });
});