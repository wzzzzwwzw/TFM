import request from "supertest";
import { prisma } from "@/lib/db";

const baseUrl = "http://localhost:3000";

describe("/api/checkAnswer integration", () => {
  let mcqQuestion: any;
  let openQuestion: any;

  beforeAll(async () => {
  // Ensure the game exists
  await prisma.game.upsert({
    where: { id: "1" },
    update: {},
    create: {
      id: "1",
      timeStarted: new Date(),
      topic: "Sample Topic",
      gameType: "mcq", // or another valid enum value
      user: {
        connectOrCreate: {
          where: { id: "test-user-id" },
          create: { id: "test-user-id", name: "Test User", email: "test@example.com" }
        }
      }
    }
  });
    // Create a sample MCQ question
    mcqQuestion = await prisma.question.create({
      data: {
        question: "What is 2+2?",
        answer: "4",
        questionType: "mcq",
        game: {
          // Replace 'connect' value with a valid game id from your test database
          connect: { id: "1" }
        }
      },
    });
    // Create a sample open-ended question
    openQuestion = await prisma.question.create({
      data: {
        question: "Name a programming language that starts with J.",
        answer: "JavaScript",
        questionType: "open_ended",
        game: {
          // Replace 'connect' value with a valid game id from your test database
          connect: { id: "1" }
        }
      },
    });
  });

  afterAll(async () => {
    await prisma.question.deleteMany({
      where: {
        id: { in: [mcqQuestion.id, openQuestion.id] },
      },
    });
    await prisma.$disconnect();
  });

  it("returns isCorrect=true for correct MCQ answer", async () => {
    const response = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: mcqQuestion.id, userInput: "4" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.isCorrect).toBe(true);
  });

  it("returns isCorrect=false for incorrect MCQ answer", async () => {
    const response = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: mcqQuestion.id, userInput: "5" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.isCorrect).toBe(false);
  });

  it("returns percentageSimilar=100 for exact open-ended answer", async () => {
    const response = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: openQuestion.id, userInput: "JavaScript" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.percentageSimilar).toBe(100);
  });

  it("returns percentageSimilar=0 for very different open-ended answer", async () => {
    const response = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: openQuestion.id, userInput: "Python" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.percentageSimilar).toBe(0);
  });

  it("returns 404 for non-existent question", async () => {
    const response = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: "non-existent-id", userInput: "test" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Question not found");
  });

  it("returns 404 for invalid input", async () => {
    const response = await request(baseUrl)
      .post("/api/checkAnswer")
      .send({ questionId: "", userInput: "" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Question not found");
  });
});