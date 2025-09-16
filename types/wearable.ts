import { SyncLog } from "@prisma/client";

export type Device = {
  deviceName: string;
  count: number; //number of activities
  img?: string;
};

export type WearableSyncRes = {
  ok: boolean;
  saved: number;
  devices: Device[];
};

export type WearableRes = {
  syncLog: SyncLog;
  devices: Device[];
};
