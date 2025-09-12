import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  if (token) {
    // delete session if exists
    await prisma.session.deleteMany({ where: { token } });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "session",
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  return res;
}
