import { NextRequest, NextResponse } from "next/server";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Set-Cookie": `admin_auth=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
        },
      }
    );
  }
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}