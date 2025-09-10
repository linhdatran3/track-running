import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const take = Number(req.nextUrl.searchParams.get("take") ?? 30);
    const rows = await prisma.activity.findMany({
      orderBy: { startLocal: "desc" },
      take,
      select: {
        id: true,
        stravaId: true,
        name: true,
        startLocal: true,
        distanceM: true,
        movingTimeS: true,
        averageHeartrate: true,
        deviceName: true,
      },
    });

    const list = rows.map((r) => ({
      id: r.id,
      stravaId: r.stravaId.toString(),
      name: r.name,
      start_local: r.startLocal.toISOString(),
      distance_km: r.distanceM / 1000,
      moving_time_min: r.movingTimeS / 60,
      avg_hr: r.averageHeartrate,
      device: r.deviceName,
    }));
    return NextResponse.json(list);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as { message: string }).message },
      { status: 500 }
    );
  }
}
