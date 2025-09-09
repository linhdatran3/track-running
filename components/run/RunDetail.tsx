"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { activityById, activityStreamById } from "@/services/activities";
import { Run, Stream } from "@/types/run";
import { useMemo } from "react";
import { fmtPace, toPaceMinPerKm } from "./functions";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function RunDetail({ id }: { id: string }) {
  const { data: activity, isLoading } = useQuery<Run>(activityById(id));

  const { data: streams, refetch } = useQuery<Stream>(activityStreamById(id));

  const series = useMemo(() => {
    if (!streams?.velocity_smooth)
      return [] as { t: number; pace: number | null; hr: number | null }[];
    const v: number[] = streams.velocity_smooth || [];
    const t: number[] | undefined = streams.time;
    const hr: number[] | undefined = streams.heartrate;
    return v
      .map((mps, i) => ({
        t: t ? t[i] : i,
        pace: toPaceMinPerKm(mps),
        hr: hr ? hr[i] ?? null : null,
      }))
      .filter((d) => d.pace !== null);
  }, [streams]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Run detail</h1>
        <div className="flex gap-2">
          <Link
            href="/"
            className="px-3 py-2 rounded-lg border border-black/10 hover:bg-black/5"
          >
            Back
          </Link>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-3 py-2 rounded-lg border border-black/10 hover:bg-black/5 disabled:opacity-60"
          >
            {isLoading ? "Refreshing…" : "Refresh (pull & save streams)"}
          </button>
        </div>
      </div>

      {activity && (
        <div className="p-4 rounded-2xl border border-black/10 bg-black/5">
          <div className="font-medium">{activity.name}</div>
          <div className="text-sm opacity-80">
            {new Date(activity.start_local).toLocaleString()}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>Distance: {activity.distance_km.toFixed(2)} km</div>
            <div>Time: {activity.moving_time_min.toFixed(1)} phút</div>
            <div>Avg HR: {activity.avg_hr ?? "—"}</div>
            <div>Elev gain: {activity.elev_gain_m ?? "—"} m</div>
            <div>Device: {activity.device ?? "—"}</div>
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl border border-black/10 bg-black/5">
        <div className="font-medium mb-2">Pace (min/km) over time</div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                tickFormatter={(x) => `${Math.floor(Number(x) / 60)}m`}
              />
              <YAxis reversed tickFormatter={(y) => fmtPace(Number(y))} />
              <Tooltip
                formatter={(v, n) =>
                  n === "pace" ? fmtPace(Number(v)) : String(v)
                }
                labelFormatter={(l) => `${Math.round(Number(l))} s`}
              />
              <Line type="monotone" dataKey="pace" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
