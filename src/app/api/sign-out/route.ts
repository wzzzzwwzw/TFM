import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { isOnline: false },
    });
  }
  // Clear the admin_auth cookie as well
  return NextResponse.json(
    { success: true },
    {
      headers: {
        "Set-Cookie": `admin_auth=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`,
      },
    }
  );
}