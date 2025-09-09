import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { JsonValue } from "@prisma/client/runtime/library";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const stravaId = (await ctx.params).id;
  const act = await prisma.activity.findUnique({
    where: { stravaId: BigInt(stravaId) },
    select: { id: true },
  });
  if (!act)
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  const rows = await prisma.activityStream.findMany({
    where: { activityId: act.id },
    select: { type: true, data: true },
  });
  const out: Record<string, JsonValue> = {};
  for (const r of rows) out[r.type] = r.data;
  return NextResponse.json(out);
}
