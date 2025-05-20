import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false, // Not required in App Router, but harmless
  },
};

export async function POST(req: NextRequest) {
  // You can handle the file upload here if needed
    console.log("Received POST to /api/quiz-upload");

  return NextResponse.json({ message: 'Quiz uploaded successfully!' }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}