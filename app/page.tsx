"use client";
import { useEffect, useState } from "react";
import { fmtPace } from "@/lib/strava"; // or relative path

type Run = {
  id: number;
  name: string;
  start_local: string;
  distance_km: number;
  moving_time_min: number;
  pace_min_per_km: number | null;
  avg_hr: number | null;
  device?: string | null;
};

export default function Home() {
  const [data, setData] = useState<Run[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/strava/activities")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setData(d);
        else setErr(d?.error || "Unknown error");
      })
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Track Running Schedule</h1>
        <a
          href="/api/strava/authorize"
          className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5"
        >
          Connect Strava
        </a>
      </div>

      {err && <div className="text-red-600 text-sm mb-3">Error: {err}</div>}
      {!data && !err && <div>Loading…</div>}

      {data && (
        <ul className="space-y-3">
          {data.map((run) => (
            <li
              key={run.id}
              className="p-4 rounded-2xl border border-black/10 bg-black/5"
            >
              <div className="font-medium">{run.name}</div>
              <div className="text-sm opacity-80">
                {new Date(run.start_local).toLocaleString()}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>Distance: {run.distance_km.toFixed(2)} km</div>
                <div>Time: {run.moving_time_min.toFixed(1)} phút</div>
                <div>Pace: {fmtPace(run.pace_min_per_km)}</div>
                <div>Avg HR: {run.avg_hr ?? "—"}</div>
                <div className="col-span-2 opacity-70">
                  Device: {run.device ?? "—"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
