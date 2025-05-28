import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    let { title, category, difficulty, questions, fileName } = body;

    // If no title, use fileName without extension, or fallback to "Untitled Quiz"
    if ((!title || title.trim() === "") && fileName) {
      title = fileName.replace(/\.[^/.]+$/, "");
    }
    if (!title || title.trim() === "") {
      title = "Untitled Quiz";
    }

    const quiz = await prisma.adminQuiz.create({
      data: {
        title,
        category,
        difficulty,
        status: "approved",
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing quiz id" }, { status: 400 });
  }
  try {
    await prisma.adminQuiz.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
  }
}