jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

import { POST } from "@/app/api/endGame/route";
import { prisma } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  prisma: {
    game: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));
//wzwz
describe("/api/endGame POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 404 if game not found", async () => {
    (prisma.game.findUnique as jest.Mock).mockResolvedValue(null);

    const req = { json: jest.fn().mockResolvedValue({ gameId: "g1" }) } as any;
    const res = {} as any;
    const response = await POST(req, res);
    expect(response).toBeDefined();
    if (!response) throw new Error("No response returned from POST");
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.message).toBe("Game not found");
  });

  it("ends the game and returns success message", async () => {
    (prisma.game.findUnique as jest.Mock).mockResolvedValue({ id: "g1" });
    (prisma.game.update as jest.Mock).mockResolvedValue({});

    const req = { json: jest.fn().mockResolvedValue({ gameId: "g1" }) } as any;
    const res = {} as any;
    const response = await POST(req, res);
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.message).toBe("Game ended");
    expect(prisma.game.update).toHaveBeenCalledWith({
      where: { id: "g1" },
      data: { timeEnded: expect.any(Date) },
    });
  });

  it("returns 500 on unexpected error", async () => {
    (prisma.game.findUnique as jest.Mock).mockRejectedValue(new Error("fail"));

    const req = { json: jest.fn().mockResolvedValue({ gameId: "g1" }) } as any;
    const res = {} as any;
    const response = await POST(req, res);
    expect(response).toBeDefined();
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.message).toBe("Something went wrong");
  });
});