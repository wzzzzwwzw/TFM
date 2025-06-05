import { POST } from "@/app/api/questions/route";

jest.mock("@/lib/gpt", () => ({
  strict_output: jest.fn().mockResolvedValue([{ question: "Q", answer: "A" }]),
}));
jest.mock("@/lib/nextauth", () => ({
  getAuthSession: jest.fn().mockResolvedValue({ user: { id: "1" } }),
}));
jest.mock("@/schemas/questions", () => ({
  getQuestionsSchema: { parse: (x: any) => x },
}));
jest.mock("zod", () => ({
  ZodError: class extends Error {},
}));

describe("/api/questions", () => {
  it("POST returns questions", async () => {
    const req = { json: async () => ({ amount: 1, topic: "Math", type: "open_ended" }) } as any;
    const res = await POST(req, {} as Response); 
    expect((await res.json()).questions.length).toBeGreaterThan(0);
  });
});