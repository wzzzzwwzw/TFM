import OpenAI from "openai";
import { strict_output } from "@/lib/gptadmintest";

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

const defaultArgs = [
  "System prompt",
  "User prompt",
  { question: "", answer: "" },
  "",
  false,
  "gpt-3.5-turbo",
  1,
];

const runStrictOutputTest = async (
  responses: any[],
  args: any[] = defaultArgs,
  numTries = 1,
  verbose = false,
  expected: any,
  expectedCalls: number,
) => {
  const mockOpenAI = createMockOpenAI(responses);
  const output = await strict_output(
    ...(args.slice(0, 7) as [any, any, any, any, any, any, any]),
    numTries,
    verbose,
    mockOpenAI
  );
  expect(output).toEqual(expected);
  expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(expectedCalls);
};

describe("strict_output", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("parses valid JSON output on first try", async () => {
    await runStrictOutputTest(
      [
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
      ],
      defaultArgs,
      3,
      false,
      [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
      ],
      1
    );
  });

  it("retries on JSON parse error and eventually returns empty array", async () => {
    await runStrictOutputTest(
      [
        { choices: [{ message: { content: "bad json 1" } }] },
        { choices: [{ message: { content: "bad json 2" } }] },
        { choices: [{ message: { content: "bad json 3" } }] },
      ],
      defaultArgs,
      3,
      false,
      [],
      3
    );
  });

  it("retries once then succeeds", async () => {
    await runStrictOutputTest(
      [
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
      ],
      defaultArgs,
      3,
      false,
      [{ question: "Retry", answer: "Success" }],
      2
    );
  });

  it("handles list user_prompt and returns array output", async () => {
    const args = [
      "System prompt",
      ["input1", "input2"],
      { question: "", answer: "" },
      "",
      false,
      "gpt-3.5-turbo",
      1,
    ];
    await runStrictOutputTest(
      [
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
      ],
      args,
      1,
      false,
      [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
      ],
      1
    );
  });

  it("replaces invalid answers with default_category when allowed answers are set", async () => {
    const output_format = { question: "", answer: ["Yes", "No"] };
    const args = [
      "System prompt",
      "User prompt",
      output_format,
      "No",
      false,
      "gpt-3.5-turbo",
      1,
    ];
    await runStrictOutputTest(
      [
        {
          choices: [
            {
              message: {
                content: JSON.stringify([{ question: "Q", answer: "InvalidAnswer" }]),
              },
            },
          ],
        },
      ],
      args,
      1,
      false,
      [{ question: "Q", answer: "No" }],
      1
    );
  });

  it("keeps allowed answer as is", async () => {
    const output_format = { question: "", answer: ["Yes", "No"] };
    const args = [
      "System prompt",
      "User prompt",
      output_format,
      "No",
      false,
      "gpt-3.5-turbo",
      1,
    ];
    await runStrictOutputTest(
      [
        {
          choices: [
            {
              message: {
                content: JSON.stringify([{ question: "Q", answer: "Yes" }]),
              },
            },
          ],
        },
      ],
      args,
      1,
      false,
      [{ question: "Q", answer: "Yes" }],
      1
    );
  });

  it("skips validation on keys matching <dynamic>", async () => {
    const output_format = { question: "", "<dynamic>": "", answer: "" };
    const args = [
      "System prompt",
      "User prompt",
      output_format,
      "",
      false,
      "gpt-3.5-turbo",
      1,
    ];
    await runStrictOutputTest(
      [
        {
          choices: [
            {
              message: {
                content: JSON.stringify([{ question: "Q", "<dynamic>": "value", answer: "A" }]),
              },
            },
          ],
        },
      ],
      args,
      1,
      false,
      [{ question: "Q", "<dynamic>": "value", answer: "A" }],
      1
    );
  });

  it("returns output values only if output_value_only=true", async () => {
    const args = [
      "System prompt",
      "User prompt",
      { question: "", answer: "" },
      "",
      true, // output_value_only
      "gpt-3.5-turbo",
      1,
    ];
    await runStrictOutputTest(
      [
        {
          choices: [
            {
              message: {
                content: JSON.stringify([{ question: "Q", answer: "A" }]),
              },
            },
          ],
        },
      ],
      args,
      1,
      false,
      [{ question: "Q", answer: "A" }],
      1
    );
  });

  it("prints verbose logs if verbose=true", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    await runStrictOutputTest(
      [
        {
          choices: [
            {
              message: {
                content: JSON.stringify([{ question: "Q", answer: "A" }]),
              },
            },
          ],
        },
      ],
      defaultArgs,
      1,
      true,
      [{ question: "Q", answer: "A" }],
      1
    );
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});