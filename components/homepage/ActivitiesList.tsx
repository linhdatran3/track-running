"use client";
import Link from "next/link";
import { calcPaceMinPerKm, fmtPace } from "@/lib/strava";
import { FetchError } from "@/utils/fetcher";
import { useActivities } from "@/hooks/useActivities";

export default function ActivitiesList({
  onError,
}: {
  onError?: (m?: string) => void;
}) {
  const { data: runs, isLoading, error } = useActivities();

  if (error) onError?.((error as FetchError)?.message);

  if (isLoading) return <div>Loading…</div>;

  if (!runs || runs.length === 0) {
    return <div className="text-sm opacity-70">Chưa có hoạt động nào</div>;
  }

  return (
    <div className="space-y-3">
      {runs.map((run) => (
        <Link
          href={`/run/${run.stravaId ?? run.id}`}
          key={run.id}
          className="block p-4 border rounded-2xl h-full"
        >
          <div className="font-medium">{run.name}</div>
          <div className="text-sm opacity-80">
            {new Date(run.start_local).toLocaleString()}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>Distance: {run.distance_km.toFixed(2)} km</div>
            <div>Time: {run.moving_time_min.toFixed(1)} phút</div>
            <div>
              Pace:{" "}
              {fmtPace?.(
                calcPaceMinPerKm(run.moving_time_min, run.distance_km) ?? null
              )}
            </div>
            <div>Type: {run.sport_type ?? "—"}</div>
            <div className="col-span-2 opacity-70">
              Device: {run.device ?? "—"}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
