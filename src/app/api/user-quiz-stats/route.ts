import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/nextauth"; // adjust path as needed

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ quizStats: [] });
  }

  // Fetch stats from your DB here using session.user.email or id
  // Example dummy data:
  const quizStats = [
    {
      id: "1",
      title: "Math Basics",
      attempts: 3,
      completed: 2,
      averageScore: 85.5,
      lastAttempt: new Date().toISOString(),
    },
    // ...more quizzes
  ];

  return NextResponse.json({ quizStats });
}