import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const stravaId = (await ctx.params).id;
  const act = await prisma.activity.findUnique({
    where: { stravaId: BigInt(stravaId) },
    select: {
      id: true,
      stravaId: true,
      name: true,
      startLocal: true,
      distanceM: true,
      movingTimeS: true,
      averageHeartrate: true,
      averageSpeed: true,
      sportType: true,
      deviceName: true,
      totalElevationGain: true,
    },
  });
  if (!act) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: act.id,
    stravaId: act.stravaId.toString(),
    name: act.name,
    start_local: act.startLocal.toISOString(),
    distance_km: act.distanceM / 1000,
    moving_time_min: act.movingTimeS / 60,
    avg_hr: act.averageHeartrate,
    avg_speed_mps: act.averageSpeed,
    sport_type: act.sportType,
    device: act.deviceName,
    elev_gain_m: act.totalElevationGain,
  });
}
