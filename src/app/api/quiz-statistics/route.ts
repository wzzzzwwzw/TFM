import { NextResponse } from 'next/server';
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
export async function GET() {
   const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Group attempts by quizTitle
  const attempts = await prisma.userQuizAttempt.findMany();

  // Aggregate statistics by quizTitle
  const statsMap: Record<string, { quizId: string, attempts: number, totalScore: number }> = {};

  for (const attempt of attempts) {
    if (!statsMap[attempt.quizTitle]) {
      statsMap[attempt.quizTitle] = {
        quizId: attempt.quizId,
        attempts: 0,
        totalScore: 0,
      };
    }
    statsMap[attempt.quizTitle].attempts += 1;
    statsMap[attempt.quizTitle].totalScore += attempt.score || 0;
  }

const statistics = Object.entries(statsMap).map(([quizTitle, data]) => ({
  quizId: data.quizId,
  quizTitle,
  attempts: data.attempts,
  averageScore: data.attempts > 0 ? Math.round((data.totalScore / data.attempts) * 100) / 100 : 0,
  completionRate: 100, // Add this line
}));

  return NextResponse.json(statistics, { status: 200 });
}