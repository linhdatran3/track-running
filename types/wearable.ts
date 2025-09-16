export type Wearable = {
  deviceName: string;
  count: number; //number of activities
  img?: string;
};

export type WearableSyncRes = {
  ok: boolean;
  saved: number;
  devices: Wearable[];
};
