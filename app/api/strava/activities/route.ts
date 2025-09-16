import { NextRequest, NextResponse } from "next/server";
import {
  getActivities,
  isRun,
  calcPaceMinPerKm,
  getValidAccessTokenFromReq,
} from "@/lib/strava";

export async function GET(req: NextRequest) {
  try {
    const accessToken = await getValidAccessTokenFromReq(req);

    const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const perPage = Number(req.nextUrl.searchParams.get("per_page") ?? 30);

    const acts = await getActivities(accessToken, page, perPage);
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
      sport_type: a?.sport_type,
    }));

    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as { message: string }).message },
      { status: 500 }
    );
  }
}
