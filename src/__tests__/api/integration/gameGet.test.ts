import request from "supertest";

const baseUrl = "http://localhost:3000";
const sessionCookie = "next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Nn8sS9uD6BsUsJrn.K74qAAnY6C0ZnwLz1LEA2MJ2vUPiMmVNjaeehlilA3dA_lTqO4-4cV54T97hA-mPB-jLqyXl33qJjhBErxh08kOxBDsQWN5Tsd46iYyge90JfaTnKwcXORefI92AQ6LURQ551VpvrGrD33BrzzyUyhriHF8UTdsZcTncd_O4jCDjwOKr484LHKJDG9kQ2L52tnM0qopEOf0_me38LY7FESNA7VdGKzB5LzCZQnj2gtDn2MxLW2AoIxiKzJAGijrOojvEtUsFrYOBHSeA7o2jCqWsAqdD4NpfWiW6covQCjHqq9_YV_ayN2iEZ1xOTVbT3BllJQZC_hm50h00ZG5fBPlYw4pV2xlU_wUXdJBF8nS-zBpSllex3_m5cSMkfZirxjSVISfuuHx5MhXgBRx4k5IGs-UVruYa-ca49UvpdGR74cDS15GyFpYR6ZBW0ikBniJoRjCtGRiwp48kgYMbJrUL.DBRLMlgb0OdGT30H2yHKGg"
describe("GET /api/game integration", () => {
  let createdGameId: string;

  beforeAll(async () => {
    // Create a game to test GET
    const response = await request(baseUrl)
      .post("/api/game")
      .set("Cookie", sessionCookie)
      .send({
        topic: "integration-test-topic",
        type: "mcq",
        amount: 1,
      });
    createdGameId = response.body.gameId;
  });

  it("returns game data for a valid gameId", async () => {
    const response = await request(baseUrl)
      .get(`/api/game?gameId=${createdGameId}`)
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(200);
    expect(response.body.game).toBeDefined();
    expect(response.body.game.id).toBe(createdGameId);
    expect(Array.isArray(response.body.game.questions)).toBe(true);
  });

  it("returns 401 if not authenticated", async () => {
    const response = await request(baseUrl)
      .get(`/api/game?gameId=${createdGameId}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
  });

  it("returns 400 if gameId is missing", async () => {
    const response = await request(baseUrl)
      .get("/api/game")
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it("returns 404 if game not found", async () => {
    const response = await request(baseUrl)
      .get("/api/game?gameId=nonexistentid123")
      .set("Cookie", sessionCookie);

    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
  });
});