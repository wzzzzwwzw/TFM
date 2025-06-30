jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

import { POST } from "@/app/api/upload-and-generate/route";
import { getServerSession } from "next-auth";
import { strict_output } from "@/lib/gptadmin";
import { authOptions } from "@/lib/nextauth";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("@/lib/gptadmin", () => ({
  strict_output: jest.fn(),
}));
jest.mock("@/lib/nextauth", () => ({
  authOptions: {},
}));

function createMockFile({ name, type, text }: { name: string; type: string; text: string }) {
  return {
    name,
    type,
    text: async () => text,
  } as any;
}

function createMockFormData(file: any) {
  return {
    get: (key: string) => (key === "file" ? file : undefined),
  } as any;
}

describe("/api/upload-and-generate POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if not admin", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: false } });
    const req = { formData: jest.fn() } as any;
    const response = await POST(req);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 400 if no file uploaded", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    const req = { formData: jest.fn().mockResolvedValue({ get: () => undefined }) } as any;
    const response = await POST(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("No file uploaded.");
  });

  it("returns 400 if file type is not accepted", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    const file = createMockFile({ name: "file.exe", type: "application/octet-stream", text: "..." });
    const req = { formData: jest.fn().mockResolvedValue(createMockFormData(file)) } as any;
    const response = await POST(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Only JSON or TXT files are accepted.");
  });

  it("returns 400 if JSON file is invalid", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    const file = createMockFile({ name: "file.json", type: "application/json", text: "not-json" });
    const req = { formData: jest.fn().mockResolvedValue(createMockFormData(file)) } as any;
    const response = await POST(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Invalid JSON file.");
  });

  it("returns 400 if no course content in JSON", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    const file = createMockFile({ name: "file.json", type: "application/json", text: "{}" });
    const req = { formData: jest.fn().mockResolvedValue(createMockFormData(file)) } as any;
    const response = await POST(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Course content is too short or missing.");
  });

  it("returns 400 if course content is too short", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    const file = createMockFile({ name: "file.txt", type: "text/plain", text: "short" });
    const req = { formData: jest.fn().mockResolvedValue(createMockFormData(file)) } as any;
    const response = await POST(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Course content is too short or missing.");
  });

  it("returns 200 and questions for valid JSON file", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    (strict_output as jest.Mock).mockResolvedValue([
      { question: "Q1", answer: "A1" },
      { question: "Q2", answer: "A2" },
    ]);
    const file = createMockFile({
      name: "file.json",
      type: "application/json",
      text: JSON.stringify({ content: "This is a course content with enough length." }),
    });
    const req = { formData: jest.fn().mockResolvedValue(createMockFormData(file)) } as any;
    const response = await POST(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.questions.length).toBe(2);
    expect(strict_output).toHaveBeenCalled();
  });

  it("returns 200 and questions for valid TXT file", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    (strict_output as jest.Mock).mockResolvedValue([
      { question: "Q1", answer: "A1" },
    ]);
    const file = createMockFile({
      name: "file.txt",
      type: "text/plain",
      text: "This is a course content with enough length.",
    });
    const req = { formData: jest.fn().mockResolvedValue(createMockFormData(file)) } as any;
    const response = await POST(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.questions.length).toBe(1);
    expect(strict_output).toHaveBeenCalled();
  });

  it("returns 500 if OpenAI fails", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { isAdmin: true } });
    (strict_output as jest.Mock).mockRejectedValue(new Error("fail"));
    const file = createMockFile({
      name: "file.txt",
      type: "text/plain",
      text: "This is a course content with enough length.",
    });
    const req = { formData: jest.fn().mockResolvedValue(createMockFormData(file)) } as any;
    const response = await POST(req);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Failed to generate quiz.");
  });
});