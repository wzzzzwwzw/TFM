import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateQuestions } from "@/lib/generateQuestions";

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a game." },
        { status: 401 }
      );
    }
    const body = await req.json();
    const { topic, type, amount } = quizCreationSchema.parse(body);

    const game = await prisma.game.create({
      data: {
        gameType: type, // must be "mcq" or "open_ended" (lowercase, as in your schema)
        timeStarted: new Date(),
        userId: session.user.id,
        topic,
      },
    });

    await prisma.topicCount.upsert({
      where: { topic },
      create: { topic, count: 1 },
      update: { count: { increment: 1 } },
    });

    // Generate questions directly
    const questions = await generateQuestions({ amount, topic, type });

    if (type === "mcq") {
      const manyData = questions
        .filter(
          (q: any) =>
            q.question && q.answer && q.option1 && q.option2 && q.option3
        )
        .map((question: any) => {
          const options = [
            question.option1,
            question.option2,
            question.option3,
            question.answer,
          ].sort(() => Math.random() - 0.5);
          return {
            question: question.question,
            answer: question.answer,
            options, // Prisma will store this as JSON
            gameId: game.id,
            questionType: "mcq" as any, // Fix: cast as any to satisfy TS
          };
        });

      await prisma.question.createMany({
        data: manyData,
      });
    } else if (type === "open_ended") {
      await prisma.question.createMany({
        data: questions.map((question: any) => ({
          question: question.question,
          answer: question.answer,
          gameId: game.id,
          questionType: "open_ended" as any, // Fix: cast as any to satisfy TS
        })),
      });
    }

    return NextResponse.json({ gameId: game.id }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        { status: 500 }
      );
    }
  }
}

export async function GET(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a game." },
        { status: 401 }
      );
    }
    const url = new URL(req.url);
    const gameId = url.searchParams.get("gameId");
    if (!gameId) {
      return NextResponse.json(
        { error: "You must provide a game id." },
        { status: 400 }
      );
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { questions: true },
    });
    if (!game) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    return NextResponse.json({ game }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
