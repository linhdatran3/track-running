import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActivities, refreshAccessToken, isRun } from "@/lib/strava";
import { IActivityFromStrava, upsertActivityFromStrava } from "@/lib/activity";

async function getValidAccessToken() {
  const u = await prisma.user.findFirst({
    where: { stravaAthleteId: { not: null } },
  });
  if (!u?.refreshToken) throw new Error("No connected Strava user");
  let token = u.accessToken || "";
  const now = Math.floor(Date.now() / 1000);
  if (!u.expiresAt || u.expiresAt <= now) {
    const refreshed = await refreshAccessToken(u.refreshToken);
    await prisma.user.update({
      where: { id: u.id },
      data: {
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token,
        expiresAt: refreshed.expires_at,
      },
    });
    token = refreshed.access_token;
  }
  return token;
}

export async function POST(req: NextRequest) {
  try {
    const { pages = 5, perPage = 50 } = await req.json().catch(() => ({}));
    const token = await getValidAccessToken();

    let saved = 0;
    for (let p = 1; p <= pages; p++) {
      const acts = await getActivities(token, p, perPage);
      if (!acts.length) break;
      const runs = acts.filter(isRun);
      for (const a of runs) {
        await upsertActivityFromStrava(a as IActivityFromStrava);
        saved++;
      }
    }
    return NextResponse.json({ ok: true, saved });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as { message: string }).message },
      { status: 500 }
    );
  }
}
