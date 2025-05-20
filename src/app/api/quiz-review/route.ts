import { NextRequest, NextResponse } from "next/server";

// Dummy in-memory store for demonstration
let quizzes: any[] = [];

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Save quiz (replace with DB logic)
  const quiz = { id: Date.now(), ...body, approved: true };
  quizzes.push(quiz);
  return NextResponse.json({ quiz }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");

  let filtered = quizzes;
  if (category) filtered = filtered.filter(q => q.category === category);
  if (difficulty) filtered = filtered.filter(q => q.difficulty === difficulty);

  return NextResponse.json({ quizzes: filtered });
}