"use client";

import { fmtPace } from "@/lib/strava";
import { todayWeekSummary } from "@/services/summary";
import { useQuery } from "@tanstack/react-query";

const TodayWeekSummarySection = () => {
  const { data, isLoading } = useQuery(todayWeekSummary());

  if (isLoading) {
    return <p>...Loading</p>;
  }
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="p-4 rounded-xl border bg-card text-foreground shadow">
        <div className="text-sm opacity-70 mb-1">Today</div>
        <div className="space-y-1 text-sm">
          <div>
            Distance:{" "}
            <span className="font-medium">
              {data.today?.distanceKm.toFixed(2)} km
            </span>
          </div>
          <div>
            Time:{" "}
            <span className="font-medium">
              {data.today?.movingTimeMin.toFixed(1)} min
            </span>
          </div>
          <div>
            Pace:{" "}
            <span className="font-medium">{fmtPace(data.today?.avgPace)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border bg-card text-foreground shadow">
        <div className="text-sm opacity-70 mb-1">This week</div>
        <div className="space-y-1 text-sm">
          <div>
            Distance:{" "}
            <span className="font-medium">
              {data.thisWeek?.distanceKm.toFixed(2)} km
            </span>
          </div>
          <div>
            Time:{" "}
            <span className="font-medium">
              {data.thisWeek?.movingTimeMin.toFixed(1)} min
            </span>
          </div>
          <div>
            Pace:{" "}
            <span className="font-medium">
              {fmtPace(data.thisWeek?.avgPace)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayWeekSummarySection;
