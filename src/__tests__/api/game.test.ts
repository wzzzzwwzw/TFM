import { POST, /*GET*/ } from "@/app/api/game/route";


// Mock dependencies
jest.mock("@/lib/db", () => ({
  prisma: {
    game: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    topicCount: {
      upsert: jest.fn(),
    },
    question: {
      createMany: jest.fn(),
    },
  },
}));
jest.mock("@/lib/nextauth", () => ({
  getAuthSession: jest.fn(),
}));
jest.mock("@/lib/generateQuestions", () => ({
  generateQuestions: jest.fn(),
}));

import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { generateQuestions } from "@/lib/generateQuestions";

describe("/api/game route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("returns 401 if not authenticated", async () => {
      (getAuthSession as jest.Mock).mockResolvedValue(null);

      const req = { json: jest.fn() } as any;
      const res = {} as any;
      const response = await POST(req, res);
      expect(response.status).toBe(401);
    });

    it("returns 400 for invalid input", async () => {
      (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: "user1" } });
      const req = { json: jest.fn().mockResolvedValue({ topic: "JS" }) } as any;
      const res = {} as any;
      const response = await POST(req, res);
      expect(response.status).toBe(400);
    });

    it("creates a new MCQ game and questions", async () => {
      (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: "user1" } });
      const body = { topic: "JavaScript", type: "mcq", amount: 2 };
      const req = { json: jest.fn().mockResolvedValue(body) } as any;
      const res = {} as any;

      (prisma.game.create as jest.Mock).mockResolvedValue({ id: "game1" });
      (prisma.topicCount.upsert as jest.Mock).mockResolvedValue({});
      (generateQuestions as jest.Mock).mockResolvedValue([
        {
          question: "Q1",
          answer: "A1",
          option1: "O1",
          option2: "O2",
          option3: "O3",
        },
        {
          question: "Q2",
          answer: "A2",
          option1: "O1",
          option2: "O2",
          option3: "O3",
        },
      ]);
      (prisma.question.createMany as jest.Mock).mockResolvedValue({});

      const response = await POST(req, res);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.gameId).toBe("game1");
      expect(prisma.game.create).toHaveBeenCalled();
      expect(prisma.question.createMany).toHaveBeenCalled();
    });

    it("creates a new open_ended game and questions", async () => {
      (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: "user1" } });
      const body = { topic: "JavaScript", type: "open_ended", amount: 1 };
      const req = { json: jest.fn().mockResolvedValue(body) } as any;
      const res = {} as any;

      (prisma.game.create as jest.Mock).mockResolvedValue({ id: "game2" });
      (prisma.topicCount.upsert as jest.Mock).mockResolvedValue({});
      (generateQuestions as jest.Mock).mockResolvedValue([
        { question: "Q1", answer: "A1" },
      ]);
      (prisma.question.createMany as jest.Mock).mockResolvedValue({});

      const response = await POST(req, res);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.gameId).toBe("game2");
      expect(prisma.game.create).toHaveBeenCalled();
      expect(prisma.question.createMany).toHaveBeenCalled();
    });

    it("returns 500 on unexpected error", async () => {
      (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: "user1" } });
      const req = { json: jest.fn().mockRejectedValue(new Error("fail")) } as any;
      const res = {} as any;
      const response = await POST(req, res);
      expect(response.status).toBe(500);
    });
  });

 /* describe("GET", () => {
    it("returns 401 if not authenticated", async () => {
      (getAuthSession as jest.Mock).mockResolvedValue(null);
      const req = { url: "http://localhost/api/game?gameId=game1" } as any;
      const res = {} as any;
      const response = await GET(req, res);
      expect(response.status).toBe(401);
    });

    it("returns 400 if gameId is missing", async () => {
      (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: "user1" } });
      const req = { url: "http://localhost/api/game" } as any;
      const res = {} as any;
      const response = await GET(req, res);
      expect(response.status).toBe(400);
    });

    it("returns 404 if game not found", async () => {
      (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: "user1" } });
      (prisma.game.findUnique as jest.Mock).mockResolvedValue(null);
      const req = { url: "http://localhost/api/game?gameId=notfound" } as any;
      const res = {} as any;
      const response = await GET(req, res);
      expect(response.status).toBe(404);
    });

    it("returns the game with questions", async () => {
      (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: "user1" } });
      (prisma.game.findUnique as jest.Mock).mockResolvedValue({
        id: "game1",
        questions: [{ question: "Q1", answer: "A1" }],
      });
      const req = { url: "http://localhost/api/game?gameId=game1" } as any;
      const res = {} as any;
      const response = await GET(req, res);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.game).toBeDefined();
      expect(json.game.questions.length).toBeGreaterThan(0);
    });

    it("returns 500 on unexpected error", async () => {
      (getAuthSession as jest.Mock).mockResolvedValue({ user: { id: "user1" } });
      (prisma.game.findUnique as jest.Mock).mockRejectedValue(new Error("fail"));
      const req = { url: "http://localhost/api/game?gameId=game1" } as any;
      const res = {} as any;
      const response = await GET(req, res);
      expect(response.status).toBe(500);
    });
  });*/
});