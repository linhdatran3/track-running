import { NextRequest, NextResponse } from "next/server";
import { getActivities, isRun, getValidAccessTokenFromReq } from "@/lib/strava";
import { IActivityFromStrava, upsertActivityFromStrava } from "@/lib/activity";

export async function POST(req: NextRequest) {
  try {
    const { pages = 5, perPage = 50 } = await req.json().catch(() => ({}));
    const token = await getValidAccessTokenFromReq(req);

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
