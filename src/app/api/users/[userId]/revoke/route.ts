import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";

export async function POST(
  req: NextRequest,
  context: { params: { userId: string } },
) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const updated = await prisma.user.update({
      where: { id: params.userId },
      data: { revoked: true },
    });
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to revoke user" },
      { status: 500 },
    );
  }
}
export async function GET(
  req: NextRequest,
  context: { params: { userId: string } },
) {
  const { params } = context;
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { revoked: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ revoked: user.revoked }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}
