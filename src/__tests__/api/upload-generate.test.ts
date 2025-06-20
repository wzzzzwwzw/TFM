
jest.mock("server-only", () => ({}));
import { POST } from "@/app/api/upload-and-generate/route";
import { FormData as NodeFormData } from "formdata-node";
global.FormData = NodeFormData as any;
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("@/lib/gptadmin", () => ({
  strict_output: jest.fn(),
}));

const mockFile = (opts: { name: string; type: string; text: string }) => ({
  name: opts.name,
  type: opts.type,
  text: jest.fn().mockResolvedValue(opts.text),
});

describe("/api/upload-and-generate POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if not admin", async () => {
    const { getServerSession } = require("next-auth");
    getServerSession.mockResolvedValue({ user: { isAdmin: false } });

    const req = { formData: async () => new FormData() };
    const res = await POST(req as any);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 if no file uploaded", async () => {
    const { getServerSession } = require("next-auth");
    getServerSession.mockResolvedValue({ user: { isAdmin: true } });

    const req = { formData: async () => new FormData() };
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("No file uploaded.");
  });

  it("returns 400 for invalid file type", async () => {
    const { getServerSession } = require("next-auth");
    getServerSession.mockResolvedValue({ user: { isAdmin: true } });

    const file = mockFile({ name: "file.pdf", type: "application/pdf", text: "irrelevant" });
    const formData = { get: () => file };
    const req = { formData: async () => formData };
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Only JSON or TXT files are accepted.");
  });

  it("returns 400 for invalid JSON file", async () => {
    const { getServerSession } = require("next-auth");
    getServerSession.mockResolvedValue({ user: { isAdmin: true } });

    const file = mockFile({ name: "file.json", type: "application/json", text: "not a json" });
    const formData = { get: () => file };
    const req = { formData: async () => formData };
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid JSON file.");
  });

  it("returns 400 for missing course content in JSON", async () => {
  const { getServerSession } = require("next-auth");
  getServerSession.mockResolvedValue({ user: { isAdmin: true } });

  const file = mockFile({ name: "file.json", type: "application/json", text: "{}" });
  const formData = { get: () => file };
  const req = { formData: async () => formData };
  const res = await POST(req as any);
  expect(res.status).toBe(400);
  const json = await res.json();
  expect(json.error).toBe("Course content is too short or missing."); // <--- Cambia aquí
});

  it("returns 400 for too short content", async () => {
    const { getServerSession } = require("next-auth");
    getServerSession.mockResolvedValue({ user: { isAdmin: true } });

    const file = mockFile({ name: "file.txt", type: "text/plain", text: "short" });
    const formData = { get: () => file };
    const req = { formData: async () => formData };
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Course content is too short or missing.");
  });

  it("returns 200 and questions for valid txt file", async () => {
    const { getServerSession } = require("next-auth");
    const { strict_output } = require("@/lib/gptadmin");
    getServerSession.mockResolvedValue({ user: { isAdmin: true } });
    strict_output.mockResolvedValue([
      { question: "Q1", answer: "A1" },
      { question: "Q2", answer: "A2" },
    ]);

    const file = mockFile({ name: "file.txt", type: "text/plain", text: "This is a valid course content for quiz generation." });
    const formData = { get: () => file };
    const req = { formData: async () => formData };
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.questions)).toBe(true);
    expect(json.questions.length).toBe(2);
  });

  it("returns 500 if OpenAI fails", async () => {
    const { getServerSession } = require("next-auth");
    const { strict_output } = require("@/lib/gptadmin");
    getServerSession.mockResolvedValue({ user: { isAdmin: true } });
    strict_output.mockRejectedValue(new Error("OpenAI error"));

    const file = mockFile({ name: "file.txt", type: "text/plain", text: "This is a valid course content for quiz generation." });
    const formData = { get: () => file };
    const req = { formData: async () => formData };
    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Failed to generate quiz.");
    expect(Array.isArray(json.questions)).toBe(true);
  });
});