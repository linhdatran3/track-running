"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function toPaceMinPerKm(mps?: number | null) {
  if (!mps || mps <= 0) return null;
  return 1000 / mps / 60;
}
function fmtPace(minPerKm?: number | null) {
  if (minPerKm == null) return "—";
  const totalSec = Math.round(minPerKm * 60);
  const mm = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function RunDetailClient({ id }: { id: string }) {
  const [activity, setActivity] = useState(null);
  const [streams, setStreams] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [aRes, sRes] = await Promise.all([
        fetch(`/api/activities/${id}`),
        fetch(`/api/activities/${id}/streams`),
      ]);
      const a = await aRes.json();
      const s = await sRes.json();
      if (!aRes.ok) throw new Error(a?.error || "Activity not found");
      setActivity(a);
      setStreams(s);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function pullAndSave() {
    setPulling(true);
    setError(null);
    try {
      const r = await fetch(`/api/strava/activity/${id}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || `Pull failed: ${r.status}`);
      await loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPulling(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  const series = useMemo(() => {
    if (!streams?.velocity_smooth)
      return [] as { t: number; pace: number | null; hr: number | null }[];
    const v: number[] = streams.velocity_smooth.data || [];
    const t: number[] | undefined = streams.time?.data;
    const hr: number[] | undefined = streams.heartrate?.data;
    return v
      .map((mps, i) => ({
        t: t ? t[i] : i,
        pace: toPaceMinPerKm(mps),
        hr: hr ? hr[i] ?? null : null,
      }))
      .filter((d) => d.pace !== null);
  }, [streams]);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
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
            onClick={pullAndSave}
            disabled={pulling}
            className="px-3 py-2 rounded-lg border border-black/10 hover:bg-black/5 disabled:opacity-60"
          >
            {pulling ? "Refreshing…" : "Refresh (pull & save streams)"}
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">Error: {error}</div>}

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

      {streams?.heartrate?.data && (
        <div className="p-4 rounded-2xl border border-black/10 bg-black/5">
          <div className="font-medium mb-2">Heart rate (bpm) over time</div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="t"
                  tickFormatter={(x) => `${Math.floor(Number(x) / 60)}m`}
                />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hr" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {loading && <div>Loading…</div>}
    </main>
  );
}
