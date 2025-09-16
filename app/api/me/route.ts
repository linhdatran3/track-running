import { NextRequest, NextResponse } from "next/server";
import { getUserBySessionToken } from "@/lib/auth";
import { User } from "@prisma/client";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const user = await getUserBySessionToken(token);
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    profilePhoto: user.profilePhoto,
    stravaAthleteId: user.stravaAthleteId,
  } as User);
}
