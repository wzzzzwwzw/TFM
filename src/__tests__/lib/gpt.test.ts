import { openai, strict_output } from "../../lib/gpttest";

jest.spyOn(openai.chat.completions, "create");

describe("strict_output", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("parses valid JSON response from OpenAI", async () => {
    (openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: '{"question":"What is AI?","answer":"Artificial Intelligence"}',
          },
        },
      ],
    });

    const output = await strict_output(
      "System prompt",
      "What is AI?",
      { question: "", answer: "" }
    );

    expect(output).toEqual({
      question: "What is AI?",
      answer: "Artificial Intelligence",
    });
  });

  it("returns empty array if OpenAI returns invalid JSON", async () => {
    (openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: "This is not JSON",
          },
        },
      ],
    });

    const output = await strict_output(
      "System prompt",
      "Invalid test",
      { foo: "" },
      "",
      false,
      "gpt-3.5-turbo",
      1,
      1
    );

    expect(output).toEqual([]);
  });

  it("returns empty array after all retries fail", async () => {
    (openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: "Not JSON again",
          },
        },
      ],
    });

    const output = await strict_output(
      "System prompt",
      "Failing test",
      { foo: "" },
      "",
      false,
      "gpt-3.5-turbo",
      1,
      2
    );

    expect(output).toEqual([]);
  });

  it("retries once then succeeds", async () => {
    (openai.chat.completions.create as jest.Mock)
      .mockResolvedValueOnce({
        choices: [{ message: { content: "Bad JSON" } }],
      })
      .mockResolvedValueOnce({
        choices: [
          { message: { content: '{"question":"Retry","answer":"Success"}' } },
        ],
      });

    const output = await strict_output(
      "System prompt",
      "Retry test",
      { question: "", answer: "" },
      "",
      false,
      "gpt-3.5-turbo",
      1,
      2
    );

    expect(output).toEqual({ question: "Retry", answer: "Success" });
  });

  it("handles output_value_only parameter", async () => {
    (openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: '[{"question":"Q","answer":"A"}]',
          },
        },
      ],
    });

    const output = await strict_output(
      "System prompt",
      "Output value only",
      { question: "", answer: "" },
      "",
      true,
      "gpt-3.5-turbo",
      1,
      1
    );

    expect(output).toEqual(["Q", "A"]);
  });

  it("handles list input and output", async () => {
    (openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: '[{"question":"Q1","answer":"A1"},{"question":"Q2","answer":"A2"}]',
          },
        },
      ],
    });

    const output = await strict_output(
      "System prompt",
      ["Q1", "Q2"],
      { question: "", answer: "" }
    );

    expect(output).toEqual([
      { question: "Q1", answer: "A1" },
      { question: "Q2", answer: "A2" },
    ]);
  });

  it("normalizes output value with default_category", async () => {
    (openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: '{"category":"unknown"}',
          },
        },
      ],
    });

    const output = await strict_output(
      "System prompt",
      "Test",
      { category: ["cat1", "cat2"] },
      "cat1"
    );

    expect(output).toEqual({ category: "cat1" });
  });

  it("handles dynamic elements in output_format", async () => {
    (openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: '{"<dynamic>":"value"}',
          },
        },
      ],
    });

    const output = await strict_output(
      "System prompt",
      "Test",
      { "<dynamic>": "" }
    );

    expect(output).toEqual({ "<dynamic>": "value" });
  });

  it("handles output with extra text before JSON", async () => {
    (openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Here is your answer: {"question":"Q","answer":"A"}',
          },
        },
      ],
    });

    const output = await strict_output(
      "System prompt",
      "Test",
      { question: "", answer: "" }
    );

    expect(output).toEqual({ question: "Q", answer: "A" });
  });

  it("handles output with extra text before JSON array", async () => {
    (openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: 'Here: [{"question":"Q1","answer":"A1"}]',
          },
        },
      ],
    });

    const output = await strict_output(
      "System prompt",
      ["Q1"],
      { question: "", answer: "" }
    );

    expect(output).toEqual([{ question: "Q1", answer: "A1" }]);
  });

  it("handles output_value_only with single value", async () => {
    (openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: '[{"foo":"bar"}]',
          },
        },
      ],
    });

    const output = await strict_output(
      "System prompt",
      "Test",
      { foo: "" },
      "",
      true,
      "gpt-3.5-turbo",
      1,
      1
    );

    expect(output).toEqual("bar");
  });

  it("throws error if required key is missing in output", async () => {
    (openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: '{"bar":"baz"}',
          },
        },
      ],
    });

    const output = await strict_output(
      "System prompt",
      "Test",
      { foo: "" }
    );

    expect(output).toEqual([]);
  });

  it("handles property names not quoted in JSON", async () => {
    (openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: '{question:"Q",answer:"A"}',
          },
        },
      ],
    });

    const output = await strict_output(
      "System prompt",
      "Test",
      { question: "", answer: "" }
    );

    expect(output).toEqual({ question: "Q", answer: "A" });
  });
});