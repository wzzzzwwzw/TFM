import { generateQuestions } from "@/lib/generateQuestions";

jest.mock("@/lib/gpt", () => ({
  strict_output: jest.fn().mockResolvedValue([{ question: "Q", answer: "A" }]),
}));

describe("generateQuestions", () => {
  it("calls strict_output for open_ended", async () => {
    const result = await generateQuestions({ amount: 1, topic: "Math", type: "open_ended" });
    expect(result[0].question).toBe("Q");
  });

  it("calls strict_output for mcq", async () => {
    const result = await generateQuestions({ amount: 1, topic: "Math", type: "mcq" });
    expect(result[0].question).toBe("Q");
  });

  it("returns [] for unknown type", async () => {
    const result = await generateQuestions({ amount: 1, topic: "Math", type: "other" });
    expect(result).toEqual([]);
  });
});