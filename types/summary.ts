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

export type TodayWeekSummary = {
  today: { distanceKm: number; movingTimeMin: number; avgPace: number | null };
  thisWeek: {
    distanceKm: number;
    movingTimeMin: number;
    avgPace: number | null;
  };
};
