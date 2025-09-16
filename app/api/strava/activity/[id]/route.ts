import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getValidAccessTokenFromReq } from "@/lib/strava";
import { upsertActivityFromStrava } from "@/lib/activity";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const stravaId = (await ctx.params).id;
    // const token = await getAccessToken();
    const token = await getValidAccessTokenFromReq(req);

    // 1) Kéo chi tiết & lưu Activity
    const detRes = await fetch(
      `https://www.strava.com/api/v3/activities/${stravaId}?include_all_efforts=true`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!detRes.ok) throw new Error(`detail failed: ${detRes.status}`);
    const detail = await detRes.json();

    await upsertActivityFromStrava(detail);

    // 2) Kéo streams
    const keys =
      "time,latlng,distance,altitude,heartrate,cadence,velocity_smooth";
    const stRes = await fetch(
      `https://www.strava.com/api/v3/activities/${stravaId}/streams?keys=${keys}&key_by_type=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!stRes.ok) throw new Error(`streams failed: ${stRes.status}`);
    const streams = await stRes.json();

    // 3) Lưu streams
    const act = await prisma.activity.findUnique({
      where: { stravaId: BigInt(stravaId) },
    });
    if (act) {
      await prisma.activityStream.deleteMany({ where: { activityId: act.id } });
      const entries = Object.entries(streams) as [string, { data: unknown }][];
      for (const [type, payload] of entries) {
        await prisma.activityStream.create({
          data: {
            activityId: act.id,
            type,
            data: payload?.data ?? payload ?? [],
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      detailId: stravaId,
      savedStreamTypes: Object.keys(streams).length,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as { message: string }).message },
      { status: 500 }
    );
  }
}
