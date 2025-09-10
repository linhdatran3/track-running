import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // or relative: "../../../lib/db"
import {
  getActivities,
  refreshAccessToken,
  isRun,
  calcPaceMinPerKm,
} from "@/lib/strava";

export async function GET(req: NextRequest) {
  try {
    // Demo: lấy user Strava đầu tiên
    const user = await prisma.user.findFirst({
      where: { stravaAthleteId: { not: null } },
    });
    if (!user || !user.refreshToken)
      return NextResponse.json([], { status: 200 });

    let accessToken = user.accessToken || "";
    const now = Math.floor(Date.now() / 1000);
    if (!user.expiresAt || user.expiresAt <= now) {
      const refreshed = await refreshAccessToken(user.refreshToken);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token,
          expiresAt: refreshed.expires_at,
        },
      });
      accessToken = refreshed.access_token;
    }

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const perPage = Number(req.nextUrl.searchParams.get("per_page") ?? 30);

    const acts = await getActivities(accessToken, page, perPage);
    console.log("acts", acts)
    const runs = acts.filter(isRun);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = runs.map((a: any) => ({
      id: a.id,
      name: a.name,
      start_local: a.start_date_local,
      distance_km: (a.distance ?? 0) / 1000,
      moving_time_min: (a.moving_time ?? 0) / 60,
      pace_min_per_km: calcPaceMinPerKm(a.moving_time, a.distance),
      avg_hr: a.average_heartrate ?? null,
      device: a.device_name ?? null,
    }));

    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as { message: string }).message },
      { status: 500 }
    );
  }
}
