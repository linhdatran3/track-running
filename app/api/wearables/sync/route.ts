// app/api/wearables/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { upsertActivityFromStrava } from "@/lib/activity";
import { getValidAccessTokenFromReq, isRun } from "@/lib/strava";
import { prisma } from "@/lib/db";
import { FetchError } from "@/utils/fetcher";
import { WearableSyncRes } from "@/types/wearable";

/**
 * Sync wearables: for each page we:
 * - fetch athlete activities list
 * - filter runs
 * - for each run: if DB already has deviceName -> skip detail call
 * - otherwise fetch detail but only up to `maxDetailsPerPage` details per page
 *
 * This keeps number of /activities/{id} calls small and avoids re-fetching already-known activities.
 */

export async function POST(req: NextRequest) {
  try {
    const accessToken = await getValidAccessTokenFromReq(req);
    // if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const pages = Number(body.pages ?? 3);
    const perPage = Number(body.perPage ?? 3);
    const maxDetailsPerPage = Number(body.maxDetailsPerPage ?? 3);

    let saved = 0;
    const deviceCounts: Record<string, number> = {};

    for (let p = 1; p <= pages; p++) {
      const listRes = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?page=${p}&per_page=${perPage}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!listRes.ok) break;
      const list = await listRes.json();
      if (!Array.isArray(list) || list.length === 0) break;

      const runItems = list.filter(isRun);
      if (!runItems.length) continue;

      // Pre-check: which runs already have deviceName in our DB (skip those)
      const ids = runItems.map((r: { id: string }) => BigInt(r.id));
      const existing = await prisma.activity.findMany({
        where: { stravaId: { in: ids } },
        select: { stravaId: true, deviceName: true },
      });
      const existingMap = new Map<string, string | null>();
      for (const e of existing)
        existingMap.set(e.stravaId.toString(), e.deviceName ?? null);

      // For runs that lack DB deviceName, fetch detail but limit to maxDetailsPerPage
      let detailsFetched = 0;

      for (const r of runItems) {
        const sid = String(r.id);
        // if DB already has deviceName non-null, skip detail call and count it
        const knownDevice = existingMap.get(sid);
        if (knownDevice) {
          deviceCounts[knownDevice] = (deviceCounts[knownDevice] ?? 0) + 1;
          continue;
        }

        if (detailsFetched >= maxDetailsPerPage) {
          // skip calling details for remaining items in this page to avoid rate-limit
          continue;
        }

        // fetch activity detail (this is the expensive call)
        try {
          const detRes = await fetch(
            `https://www.strava.com/api/v3/activities/${sid}?include_all_efforts=false`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (!detRes.ok) {
            // If Strava returns an error for this detail, skip it
            detailsFetched++;
            continue;
          }
          const detail = await detRes.json();
          // upsert activity and attach to user
          await upsertActivityFromStrava(detail);
          saved++;
          detailsFetched++;

          const dn = (detail.device_name ?? "Unknown").trim() || "Unknown";
          deviceCounts[dn] = (deviceCounts[dn] ?? 0) + 1;
        } catch (err) {
          // swallow per-activity errors, but count toward detail limit to be safe
          console.error("detail fetch error for", sid, err);
          detailsFetched++;
        }
      } // end for runItems
    } // end pages loop

    const devices = Object.entries(deviceCounts).map(([deviceName, count]) => ({
      deviceName,
      count,
    }));
    return NextResponse.json({ ok: true, saved, devices } as WearableSyncRes);
  } catch (e: unknown) {
    const status = (e as FetchError)?.status === 401 ? 401 : 500;
    return NextResponse.json({ error: (e as FetchError).message }, { status });
  }
}
