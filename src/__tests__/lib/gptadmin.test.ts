import OpenAI from "openai";
import { strict_output } from "@/lib/gptadmintest"; // adjust import path

// Mock OpenAI client
const createMockOpenAI = (responses: any[]) => {
  let callCount = 0;
  return {
    chat: {
      completions: {
        create: jest.fn().mockImplementation(() => {
          if (callCount < responses.length) {
            return Promise.resolve(responses[callCount++]);
          }
          return Promise.resolve(responses[responses.length - 1]);
        }),
      },
    },
  } as unknown as OpenAI;
};

describe("strict_output", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("parses valid JSON output on first try", async () => {
    const mockOpenAI = createMockOpenAI([
      {
        choices: [
          {
            message: {
              content: JSON.stringify([
                { question: "Q1", answer: "A1" },
                { question: "Q2", answer: "A2" },
              ]),
            },
          },
        ],
      },
    ]);

    const output = await strict_output(
      "System prompt",
      "User prompt",
      { question: "", answer: "" },
      "",
      false,
      "gpt-3.5-turbo",
      1,
      3,
      false,
      mockOpenAI
    );

    expect(output).toEqual([
      { question: "Q1", answer: "A1" },
      { question: "Q2", answer: "A2" },
    ]);
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
  });

  it("retries on JSON parse error and eventually returns empty array", async () => {
    const mockOpenAI = createMockOpenAI([
      { choices: [{ message: { content: "bad json 1" } }] },
      { choices: [{ message: { content: "bad json 2" } }] },
      { choices: [{ message: { content: "bad json 3" } }] },
    ]);

    const output = await strict_output(
      "System prompt",
      "User prompt",
      { question: "", answer: "" },
      "",
      false,
      "gpt-3.5-turbo",
      1,
      3,
      false,
      mockOpenAI
    );

    expect(output).toEqual([]);
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(3);
  });

  it("retries once then succeeds", async () => {
    const mockOpenAI = createMockOpenAI([
      { choices: [{ message: { content: "bad json" } }] },
      {
        choices: [
          {
            message: {
              content: JSON.stringify([{ question: "Retry", answer: "Success" }]),
            },
          },
        ],
      },
    ]);

    const output = await strict_output(
      "System prompt",
      "User prompt",
      { question: "", answer: "" },
      "",
      false,
      "gpt-3.5-turbo",
      1,
      3,
      false,
      mockOpenAI
    );

    expect(output).toEqual([{ question: "Retry", answer: "Success" }]);
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
  });

  it("handles list user_prompt and returns array output", async () => {
    const mockOpenAI = createMockOpenAI([
      {
        choices: [
          {
            message: {
              content: JSON.stringify([
                { question: "Q1", answer: "A1" },
                { question: "Q2", answer: "A2" },
              ]),
            },
          },
        ],
      },
    ]);

    const output = await strict_output(
      "System prompt",
      ["input1", "input2"],
      { question: "", answer: "" },
      "",
      false,
      "gpt-3.5-turbo",
      1,
      1,
      false,
      mockOpenAI
    );

    expect(output).toEqual([
      { question: "Q1", answer: "A1" },
      { question: "Q2", answer: "A2" },
    ]);
  });

  it("replaces invalid answers with default_category when allowed answers are set", async () => {
    const mockOpenAI = createMockOpenAI([
      {
        choices: [
          {
            message: {
              content: JSON.stringify([{ question: "Q", answer: "InvalidAnswer" }]),
            },
          },
        ],
      },
    ]);

    const output_format = { question: "", answer: ["Yes", "No"] };

    const output = await strict_output(
      "System prompt",
      "User prompt",
      output_format,
      "No",
      false,
      "gpt-3.5-turbo",
      1,
      1,
      false,
      mockOpenAI
    );

    expect(output).toEqual([{ question: "Q", answer: "No" }]);
  });

  it("keeps allowed answer as is", async () => {
    const mockOpenAI = createMockOpenAI([
      {
        choices: [
          {
            message: {
              content: JSON.stringify([{ question: "Q", answer: "Yes" }]),
            },
          },
        ],
      },
    ]);

    const output_format = { question: "", answer: ["Yes", "No"] };

    const output = await strict_output(
      "System prompt",
      "User prompt",
      output_format,
      "No",
      false,
      "gpt-3.5-turbo",
      1,
      1,
      false,
      mockOpenAI
    );

    expect(output).toEqual([{ question: "Q", answer: "Yes" }]);
  });

  it("skips validation on keys matching <dynamic>", async () => {
    const mockOpenAI = createMockOpenAI([
      {
        choices: [
          {
            message: {
              content: JSON.stringify([{ question: "Q", "<dynamic>": "value", answer: "A" }]),
            },
          },
        ],
      },
    ]);

    const output_format = { question: "", "<dynamic>": "", answer: "" };

    const output = await strict_output(
      "System prompt",
      "User prompt",
      output_format,
      "",
      false,
      "gpt-3.5-turbo",
      1,
      1,
      false,
      mockOpenAI
    );

    expect(output).toEqual([{ question: "Q", "<dynamic>": "value", answer: "A" }]);
  });

  it("returns output values only if output_value_only=true", async () => {
    const mockOpenAI = createMockOpenAI([
      {
        choices: [
          {
            message: {
              content: JSON.stringify([{ question: "Q", answer: "A" }]),
            },
          },
        ],
      },
    ]);

    const output = await strict_output(
      "System prompt",
      "User prompt",
      { question: "", answer: "" },
      "",
      true, // output_value_only
      "gpt-3.5-turbo",
      1,
      1,
      false,
      mockOpenAI
    );

    // Cambiado: ahora espera el formato de objeto, no array de arrays
    expect(output).toEqual([{ question: "Q", answer: "A" }]);
  });

  it("prints verbose logs if verbose=true", async () => {
    const mockOpenAI = createMockOpenAI([
      {
        choices: [
          {
            message: {
              content: JSON.stringify([{ question: "Q", answer: "A" }]),
            },
          },
        ],
      },
    ]);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    await strict_output(
      "System prompt",
      "User prompt",
      { question: "", answer: "" },
      "",
      false,
      "gpt-3.5-turbo",
      1,
      1,
      true, // verbose
      mockOpenAI
    );

    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});