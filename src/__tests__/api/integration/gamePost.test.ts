import request from "supertest";

const baseUrl = "http://localhost:3000";


const sessionCookie = "next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..jLS29KaXQjMILd5v.5TkoP8GFaNvXnCRQHiL8yIE7DM-Qw5wcnIYrQMtS4G54y22tyvshOdSrTXDIBfBtjmgvyJqhDkoKUYd75fbYNXcN6qCNThfmx89fDejPgVKKgkwCW0Avuf6TA9EwWriB0nbY7J5WfmlgaM2MMwuDXYu7G2RNCE78w3kvBs2N8hy-igjfY_iDZEaoptLeyUKQXG50GE1KkhDTFO5sJ0QLhHTcz7uhNV2AOH91KhfheNWpF5s6lL5RMrVRP5N6PX8aI__XseceJNGJo9fGF-UdY7QYeaJkjRRqn9G_whCg1DKU1Bt-3YUqxDazJA4fdePsamb0VNUDWjwdX1ElZQNqe2YZiV6A_Sh7LVm1ti_NAJJHO1VGiPZQqVaNOjbMiWJaGfyLnqnuAxsz5XYlU5BZ_4MKGCWcqzuMFGqPj99Ap-sceO4f2C2I7A_wktRg-eAeB1xeAdOEVRF4X_IhlVcRwZc.rYvCz2GbZ9UATKkcp625UQ";

describe("POST /api/game integration", () => {
  it("creates a game and questions (MCQ)", async () => {
    const response = await request(baseUrl)
      .post("/api/game")
      .set("Cookie", sessionCookie)
      .send({
        topic: "integration-test-topic",
        type: "mcq",
        amount: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body.gameId).toBeDefined();
  });
  it("creates a game and questions (open_ended)", async () => {
  const response = await request(baseUrl)
    .post("/api/game")
    .set("Cookie", sessionCookie)
    .send({
      topic: "iwzwz",
      type: "open_ended",
      amount: 2,
    });

  expect(response.status).toBe(200);
  expect(response.body.gameId).toBeDefined();
});

  it("returns 401 if not authenticated", async () => {
    const response = await request(baseUrl)
      .post("/api/game")
      .send({
        topic: "wzwz",
        type: "mcq",
        amount: 2,
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
  });

  it("returns 400 for invalid input", async () => {
    const response = await request(baseUrl)
      .post("/api/game")
      .set("Cookie", sessionCookie)
      .send({
        topic: "",
        type: "invalid-type",
        amount: -1,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
  });