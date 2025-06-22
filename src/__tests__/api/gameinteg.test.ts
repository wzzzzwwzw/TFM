jest.mock("@/lib/db", () => ({
  prisma: {
    game: {
      create: jest.fn().mockResolvedValue({ id: "game123", gameType: "mcq", timeStarted: new Date(), userId: "user1", topic: "Math" }),
      findUnique: jest.fn().mockResolvedValue({
        id: "game123",
        gameType: "mcq",
        timeStarted: new Date(),
        userId: "user1",
        topic: "Math",
        questions: [
          { question: "Q1", answer: "A1", options: ["A1", "B1", "C1", "D1"], questionType: "mcq" }
        ]
      }),
    },
    topicCount: { upsert: jest.fn() },
    question: { createMany: jest.fn() },
  },
}));
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            { message: { content: '{"question":"Q1","answer":"A1","option1":"B1","option2":"C1","option3":"D1"}' } }
          ]
        })
      }
    }
  }));
});
jest.mock("next-auth", () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { id: "user1" } }),
}));
jest.mock("@/lib/nextauth", () => ({
  getAuthSession: jest.fn().mockResolvedValue({ user: { id: "user1" } }),
}));

import { POST, GET } from "@/app/api/game/route";

// Utility to parse NextResponse body
async function parseNextResponseBody(res: any) {
  if (typeof res.body === "string") {
    return JSON.parse(res.body);
  }
  if (res.body && typeof res.body.getReader === "function") {
    const reader = res.body.getReader();
    let result = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += Buffer.from(value).toString("utf8");
    }
    return JSON.parse(result);
  }
  throw new Error("Unknown response body type");
}

// ... your jest.mock() code remains unchanged ...

describe("/api/game integration", () => {
  it("creates a game and fetches it", async () => {
    const reqPost = { json: async () => ({ topic: "Math", type: "mcq", amount: 1 }) } as any;
    const resPost = await POST(reqPost, {} as Response);
    expect(resPost.status).toBe(200);
    const postData = await parseNextResponseBody(resPost);
    expect(postData.gameId).toBe("game123");

    const reqGet = { url: "http://localhost/api/game?gameId=game123" } as any;
    const resGet = await GET(reqGet, {} as Response);
    expect(resGet.status).toBe(200);
    const getData = await parseNextResponseBody(resGet);
    expect(getData.game.id).toBe("game123");
    expect(getData.game.questions[0].question).toBe("Q1");
  });

  it("returns 401 if not logged in", async () => {
    const { getAuthSession } = require("@/lib/nextauth");
    getAuthSession.mockResolvedValueOnce(null);

    const reqPost = { json: async () => ({ topic: "Math", type: "mcq", amount: 1 }) } as any;
    const resPost = await POST(reqPost, {} as Response);
    expect(resPost.status).toBe(401);
  });

  it("returns 400 if missing gameId on GET", async () => {
    const reqGet = { url: "http://localhost/api/game" } as any;
    const resGet = await GET(reqGet, {} as Response);
    expect(resGet.status).toBe(400);
  });

  it("returns 404 if game not found", async () => {
    const { prisma } = require("@/lib/db");
    prisma.game.findUnique.mockResolvedValueOnce(null);

    const reqGet = { url: "http://localhost/api/game?gameId=notfound" } as any;
    const resGet = await GET(reqGet, {} as Response);
    expect(resGet.status).toBe(404);
  });
});