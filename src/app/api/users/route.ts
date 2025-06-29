import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Fetch all users for admin management
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      lastSeen: true,
      banned: true,
      revoked: true,
      isAdmin: true,
    },
  });
  return NextResponse.json(users);
}