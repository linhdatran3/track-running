import { prisma } from "@/lib/db";

export interface IActivityFromStrava {
  id: string;
  name?: string;
  start_date_local: Date;
  start_date: Date;
  moving_time: number;
  distance: number;
  elapsed_time?: number;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  total_elevation_gain?: number;
  type?: string;
  sport_type?: string;
  device_name?: string;
  external_id?: string;
}


function isGarmin(a: IActivityFromStrava) {
  const d = (a?.device_name || "").toLowerCase();
  const ext = (a?.external_id || "").toLowerCase();
  return d.includes("garmin") || ext.endsWith(".fit");
}

export async function upsertActivityFromStrava(a: IActivityFromStrava) {
  const stravaId = BigInt(a.id);
  const data = {
    id: a.id,
    name: a.name ?? "",
    startLocal: new Date(a.start_date_local),
    startUtc: a.start_date ? new Date(a.start_date) : null,
    distanceM: Math.round(a.distance ?? 0),
    movingTimeS: a.moving_time ?? 0,
    elapsedTimeS: a.elapsed_time ?? null,
    averageSpeed: a.average_speed ?? null,
    maxSpeed: a.max_speed ?? null,
    averageHeartrate: a.average_heartrate ?? null,
    maxHeartrate: a.max_heartrate ?? null,
    averageCadence: a.average_cadence ?? null,
    totalElevationGain: a.total_elevation_gain ?? null,
    sportType: a.sport_type ?? a.type ?? null,
    deviceName: a.device_name ?? null,
    externalId: a.external_id ?? null,
    isGarmin: isGarmin(a),
    rawJson: a as unknown as undefined,
  };
  await prisma.activity.upsert({
    where: { stravaId },
    update: data,
    create: { ...data, stravaId },
  });
}
