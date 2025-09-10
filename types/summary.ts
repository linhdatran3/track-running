export type Summary = {
  total: {
    distanceKm: number;
    movingTimeMin: number;
    avgPaceMinPerKm: number | null;
    avgHr: number | null;
  };
  weekly: {
    distanceKm: number;
    runs: number;
    weekStartISO: string;
  }[];
};
