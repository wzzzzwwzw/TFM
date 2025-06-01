import { POST, GET } from "@/app/api/game/route";

jest.mock("@/lib/db", () => ({
  prisma: {
    game: {
      create: jest.fn().mockResolvedValue({ id: "1" }),
      findUnique: jest.fn().mockResolvedValue({ id: "1", questions: [] }),
    },
    topicCount: {
      upsert: jest.fn(),
    },
    question: {
      createMany: jest.fn(),
    },
  },
}));
jest.mock("next-auth", () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { id: "1" } }),
}));
jest.mock("@/lib/nextauth", () => ({
  getAuthSession: jest.fn().mockResolvedValue({ user: { id: "1" } }),
}));
jest.mock("axios", () => ({
  post: jest.fn().mockResolvedValue({ data: { questions: [] } }),
}));

describe("/api/game", () => {
  it("POST creates a game", async () => {
    const req = { json: async () => ({ topic: "Math", type: "mcq", amount: 5 }) } as any;
    const res = await POST(req, {} as Response);
    const data = await res.json();
    expect(data.gameId).toBe("1");
  });

  it("GET returns a game", async () => {
    const req = { url: "http://localhost/api/game?gameId=1" } as any;
    const res = await GET(req, {} as Response);
    expect((await res.json()).game.id).toBe("1");
  });
});