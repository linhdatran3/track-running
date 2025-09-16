import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserBySessionToken } from "@/lib/auth";
import { FetchError } from "@/utils/fetcher";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value ?? null;
    const user = await getUserBySessionToken(token);
    if (!user)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    // lấy deviceName của user từ Activity (không lấy null)
    const activities = await prisma.activity.findMany({
      //   where: { userId: user.id },
      orderBy: { startLocal: "desc" },
      select: { id: true, stravaId: true, name: true, deviceName: true },
      take: 1000,
    });

    const logs = await prisma.syncLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    let syncLog = undefined;
    for (const log of logs) {
      if (log.type === "wearables_sync") {
        syncLog = log;
        break;
      }
    }

    const counts: Record<string, number> = {};
    for (const a of activities) {
      if (a?.deviceName) {
        const d = a.deviceName.trim();
        counts[d] = (counts[d] ?? 0) + 1;
      }
    }

    const devices = Object.entries(counts).map(([deviceName, count]) => ({
      deviceName,
      count,
    }));

    return NextResponse.json({ devices, syncLog });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as FetchError).message },
      { status: 500 }
    );
  }
}
