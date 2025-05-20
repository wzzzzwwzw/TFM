import { NextResponse } from 'next/server';

export async function GET() {
  const statistics = [
    {
      id: 1,
      title: "Sample Quiz",
      attempts: 10,
      averageScore: 80,
      completionRate: 90,
    },
  ];
  return NextResponse.json(statistics, { status: 200 });
}