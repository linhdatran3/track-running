export type Run = {
  id: string;
  stravaId?: string;
  name: string;
  start_local: string;
  distance_km: number;
  moving_time_min: number;
  pace_min_per_km?: number | null;
  avg_hr: number | null;
  device?: string | null;
  elev_gain_m?: number | null;
};

export type SyncReq = { pages: number; perPage: number };
export type SyncResp = { saved: number };

export type Stream = {
  velocity_smooth?: number[];
  time?: number[];
  heartrate?: number[];
  altitude?: number[];
  distance?: number[];
  latlng?: number[];
};
