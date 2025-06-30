import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";

export async function POST(req: NextRequest) {
  try {
    const { userId, quizId, quizTitle, answers, score } = await req.json();
    const attempt = await prisma.userQuizAttempt.create({
      data: {
        userId,
        quizId,
        quizTitle,
        answers,
        score,
      },
    });
    return NextResponse.json({ attempt }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save attempt", details: error },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ quizStats: [] });
    }

    const attempts = await prisma.userQuizAttempt.findMany({
      where: { userId: session.user.id },
    });

    // Aggregate stats per quiz
    const statsMap: Record<string, any> = {};
    for (const att of attempts) {
      if (!statsMap[att.quizId]) {
        statsMap[att.quizId] = {
          id: att.quizId,
          title: att.quizTitle,
          attempts: 0,
          totalScore: 0,
          lastAttempt: att.createdAt,
        };
      }
      statsMap[att.quizId].attempts += 1;
      statsMap[att.quizId].totalScore += att.score;
      if (att.createdAt > statsMap[att.quizId].lastAttempt) {
        statsMap[att.quizId].lastAttempt = att.createdAt;
      }
    }

    const quizStats = Object.values(statsMap).map((stat: any) => ({
      id: stat.id,
      title: stat.title,
      attempts: stat.attempts,
      averageScore: stat.attempts ? stat.totalScore / stat.attempts : null,
      lastAttempt: stat.lastAttempt,
    }));

    return NextResponse.json({ quizStats });
  } catch (error) {
    // Always return valid JSON, even on error
    return NextResponse.json({ quizStats: [] });
  }
}
