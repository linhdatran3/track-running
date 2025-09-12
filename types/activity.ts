import { JsonValue } from "@prisma/client/runtime/binary";

export type Activity = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  stravaId: bigint;
  startLocal: Date;
  startUtc: Date | null;
  distanceM: number;
  movingTimeS: number;
  elapsedTimeS: number | null;
  averageSpeed: number | null;
  maxSpeed: number | null;
  averageHeartrate: number | null;
  maxHeartrate: number | null;
  averageCadence: number | null;
  totalElevationGain: number | null;
  sportType: string | null;
  deviceName: string | null;
  externalId: string | null;
  isGarmin: boolean;
  rawJson: JsonValue | null;
};
