import { NextResponse } from "next/server";
import { startOfWeek, endOfWeek } from "date-fns";
import { prisma } from "@/lib/db";
import { Activity } from "@prisma/client";
import { TodayWeekSummary } from "@/types/summary";

function pace(distanceM: number, movingS: number) {
  if (!distanceM) return null;
  return movingS / 60 / (distanceM / 1000);
}

export async function GET() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const todayActs = await prisma.activity.findMany({
    where: { startLocal: { gte: todayStart } },
  });
  const weekActs = await prisma.activity.findMany({
    where: { startLocal: { gte: weekStart, lte: weekEnd } },
  });

  function sum(acts: Activity[]) {
    const dist = acts.reduce((a, r) => a + (r.distanceM ?? 0), 0);
    const mov = acts.reduce((a, r) => a + (r.movingTimeS ?? 0), 0);
    return {
      distanceKm: dist / 1000,
      movingTimeMin: mov / 60,
      avgPace: pace(dist, mov),
    };
  }

  const res: TodayWeekSummary = {
    today: sum(todayActs),
    thisWeek: sum(weekActs),
  };
  return NextResponse.json(res);
}
