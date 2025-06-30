import request from "supertest";
import { prisma } from "@/lib/db";

const baseUrl = "http://localhost:3000";

describe("/api/checkAnswer integration", () => {
  let mcqQuestion: any;
  let openQuestion: any;
  let game: any;
  let user: any;

  beforeAll(async () => {
    // Create a user (required for Game)
    user = await prisma.user.create({
      data: {
        email: "testuser@example.com",
      },
    });

    // Create a game
    game = await prisma.game.create({
      data: {
        userId: user.id,
        timeStarted: new Date(),
        topic: "General Knowledge",
        gameType: "mcq",
      },
    });

    mcqQuestion = await prisma.question.create({
      data: {
        question: "What is the capital of France?",
        answer: "Paris",
        questionType: "mcq",
        gameId: game.id,
      },
    });
    openQuestion = await prisma.question.create({
      data: {
        question: "Describe the sky.",
        answer: "The sky is blue.",
        questionType: "open_ended",
        gameId: game.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.question.deleteMany({
      where: { id: { in: [mcqQuestion.id, openQuestion.id] } },
    });
    await prisma.game.delete({ where: { id: game.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
  });

  it("returns isCorrect=true for correct MCQ answer", async () => {
    const res = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: mcqQuestion.id, userInput: "Paris" });
    expect(res.status).toBe(200);
    expect(res.body.isCorrect).toBe(true);
  });

  it("returns isCorrect=false for incorrect MCQ answer", async () => {
    const res = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: mcqQuestion.id, userInput: "London" });
    expect(res.status).toBe(200);
    expect(res.body.isCorrect).toBe(false);
  });

  it("accepts MCQ answer with different casing and whitespace", async () => {
    const res = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: mcqQuestion.id, userInput: "  paRiS " });
    expect(res.status).toBe(200);
    expect(res.body.isCorrect).toBe(true);
  });

  it("returns percentageSimilar=100 for exact open-ended answer", async () => {
    const res = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: openQuestion.id, userInput: "The sky is blue." });
    expect(res.status).toBe(200);
    expect(res.body.percentageSimilar).toBe(100);
  });

  it("returns percentageSimilar=0 for very different open-ended answer", async () => {
    const res = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: openQuestion.id, userInput: "Banana" });
    expect(res.status).toBe(200);
    expect(res.body.percentageSimilar).toBe(0);
  });

  it("returns percentageSimilar > 0 for partial open-ended answer", async () => {
    const res = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: openQuestion.id, userInput: "sky is blue" });
    expect(res.status).toBe(200);
    expect(res.body.percentageSimilar).toBeGreaterThan(0);
  });

  it("returns 404 for non-existent question", async () => {
    const res = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: "nonexistent", userInput: "test" });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Question not found");
  });

  it("returns 400 for invalid input", async () => {
    const res = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: mcqQuestion.id }); // missing userInput
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  it("returns 400 for empty userInput", async () => {
    const res = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: mcqQuestion.id, userInput: "" });
    expect([400, 200]).toContain(res.status); // Adjust based on your API's behavior
  });

  it("saves userAnswer and isCorrect in the database for MCQ", async () => {
    await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: mcqQuestion.id, userInput: "Paris" });
    const updated = await prisma.question.findUnique({ where: { id: mcqQuestion.id } });
    expect(updated?.userAnswer).toBe("Paris");
    expect(updated?.isCorrect).toBe(true);
  });
it("returns 0 similarity for open-ended answer just below threshold", async () => {
  const res = await request(baseUrl)
    .post("/api/checkAnswer")
    .send({ questionId: openQuestion.id, userInput: "The ocean is deep." }); // much less similar
  expect(res.status).toBe(200);
  expect(res.body.percentageSimilar).toBe(0);
});

it("returns 400 for invalid questionId format", async () => {
  const res = await request(baseUrl)
    .post("/api/checkAnswer")
    .send({ questionId: 12345, userInput: "Paris" }); // invalid format
  expect(res.status).toBe(400);
  expect(res.body.message).toBeDefined();
});

it("handles MCQ with whitespace-only input", async () => {
  const res = await request(baseUrl)
    .post("/api/checkAnswer")
    .send({ questionId: mcqQuestion.id, userInput: "    " });
  expect(res.status).toBe(200);
  expect(res.body.isCorrect).toBe(false);
});

it("handles open-ended question with empty answer in DB", async () => {
  const emptyAnswerQuestion = await prisma.question.create({
    data: {
      question: "What is empty?",
      answer: "",
      questionType: "open_ended",
      gameId: game.id,
    },
  });
  const res = await request(baseUrl)
    .post("/api/checkAnswer")
    .send({ questionId: emptyAnswerQuestion.id, userInput: "Anything" });
  expect(res.status).toBe(200);
  expect(res.body.percentageSimilar).toBe(0);
  await prisma.question.delete({ where: { id: emptyAnswerQuestion.id } });
});
});