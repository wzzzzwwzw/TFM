import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Adjust the import path if needed

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, difficulty, questions } = body;

    const quiz = await prisma.adminQuiz.create({
      data: {
        title,
        category,
        difficulty,
        status: "approved", // or "pending" if you want to review later
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            answer: q.answer,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save quiz", details: error }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");

  const where: any = {};
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;

  const quizzes = await prisma.adminQuiz.findMany({
    where,
    include: { questions: true },
  });

  return NextResponse.json({ quizzes });
}