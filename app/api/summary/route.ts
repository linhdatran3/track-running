import { NextRequest, NextResponse } from "next/server";
import { startOfWeek, subWeeks } from "date-fns";
import { prisma } from "@/lib/db";
import { Summary } from "@/types/summary";

function paceMinPerKm(distanceM: number, movingTimeS: number) {
  if (!distanceM || distanceM === 0) return null;
  const min = movingTimeS / 60;
  const km = distanceM / 1000;
  return min / km;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const fromDate = from ? new Date(from) : subWeeks(new Date(), 12);
  const toDate = to ? new Date(to) : new Date();

  const activities = await prisma.activity.findMany({
    where: {
      startLocal: {
        gte: fromDate,
        lte: toDate,
      },
    },
    orderBy: { startLocal: "asc" },
  });

  // Totals
  const totalDistance = activities.reduce((a, r) => a + (r.distanceM ?? 0), 0);
  const totalMoving = activities.reduce((a, r) => a + (r.movingTimeS ?? 0), 0);
  const avgPace = paceMinPerKm(totalDistance, totalMoving);

  const hrValues = activities
    .map((r) => r.averageHeartrate)
    .filter((x) => x != null) as number[];
  const avgHr =
    hrValues.length > 0
      ? hrValues.reduce((a, b) => a + b, 0) / hrValues.length
      : null;

  // Weekly breakdown
  const weeks: Record<string, { distanceKm: number; runs: number }> = {};
  for (const r of activities) {
    const wk = startOfWeek(r.startLocal, { weekStartsOn: 1 }).toISOString();
    if (!weeks[wk]) weeks[wk] = { distanceKm: 0, runs: 0 };
    weeks[wk].distanceKm += (r.distanceM ?? 0) / 1000;
    weeks[wk].runs += 1;
  }
  const weekly = Object.entries(weeks)
    .map(([weekStartISO, d]) => ({ weekStartISO, ...d }))
    .sort((a, b) => (a.weekStartISO < b.weekStartISO ? -1 : 1));

  const res: Summary = {
    total: {
      distanceKm: totalDistance / 1000,
      movingTimeMin: totalMoving / 60,
      avgPaceMinPerKm: avgPace,
      avgHr,
    },
    weekly,
  };
  return NextResponse.json(res);
}
