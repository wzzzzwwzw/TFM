jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

import { POST } from "@/app/api/questions/route";
import { getAuthSession } from "@/lib/nextauth";
import { strict_output } from "@/lib/gpt";

jest.mock("@/lib/nextauth", () => ({
  getAuthSession: jest.fn(),
}));
jest.mock("@/lib/gpt", () => ({
  strict_output: jest.fn(),
}));

describe("/api/questions POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and questions for open_ended", async () => {
    (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
    (strict_output as jest.Mock).mockResolvedValue([
      { question: "Q1", answer: "A1" },
      { question: "Q2", answer: "A2" },
    ]);

    const req = {
      json: jest.fn().mockResolvedValue({
        amount: 2,
        topic: "Math",
        type: "open_ended",
      }),
    } as any;
    const res = {} as any;

    const response = await POST(req, res);
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.questions.length).toBe(2);
    expect(strict_output).toHaveBeenCalled();
  });

  it("returns 200 and questions for mcq", async () => {
    (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
    (strict_output as jest.Mock).mockResolvedValue([
      {
        question: "Q1",
        answer: "A1",
        option1: "O1",
        option2: "O2",
        option3: "O3",
      },
    ]);

    const req = {
      json: jest.fn().mockResolvedValue({
        amount: 1,
        topic: "Science",
        type: "mcq",
      }),
    } as any;
    const res = {} as any;

    const response = await POST(req, res);
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.questions.length).toBe(1);
    expect(strict_output).toHaveBeenCalled();
  });

  it("returns 400 for invalid input", async () => {
    (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });

    const req = {
      json: jest.fn().mockResolvedValue({
        topic: "Math",
        type: "mcq",
        // missing amount
      }),
    } as any;
    const res = {} as any;

    const response = await POST(req, res);
    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it("returns 500 for unexpected error", async () => {
    (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: "u1" } });
    (strict_output as jest.Mock).mockRejectedValue(new Error("fail"));

    const req = {
      json: jest.fn().mockResolvedValue({
        amount: 1,
        topic: "Science",
        type: "mcq",
      }),
    } as any;
    const res = {} as any;

    const response = await POST(req, res);
    expect(response).toBeDefined();
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("An unexpected error occurred.");
  });
});