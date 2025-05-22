import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  // You need to track online status in your user model or session table
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      isOnline: true, // Make sure this field exists in your user model
      banned: true,   // Optional: add a banned field
    },
  });
  return NextResponse.json(users);
}