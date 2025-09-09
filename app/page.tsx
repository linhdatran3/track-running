"use client";
import { useEffect, useState } from "react";
import { fmtPace } from "@/lib/strava";
import Link from "next/link";

type Run = {
  id: string;
  stravaId?: string;
  name: string;
  start_local: string;
  distance_km: number;
  moving_time_min: number;
  pace_min_per_km?: number | null;
  avg_hr: number | null;
  device?: string | null;
};

export default function Home() {
  const [data, setData] = useState<Run[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // tuỳ chọn: cho phép chỉnh pages/perPage
  const [pages, setPages] = useState(3);
  const [perPage, setPerPage] = useState(50);

  async function fetchRuns() {
    setErr(null);
    try {
      const r = await fetch("/api/activities"); // lấy từ DB (nhanh)
      const d = await r.json();
      if (Array.isArray(d)) setData(d);
      else setErr(d?.error || "Unknown error");
    } catch (e: unknown) {
      setErr(String(e));
    }
  }

  useEffect(() => {
    fetchRuns();
  }, []);

  async function handleSync() {
    setSyncing(true);
    setNotice(null);
    setErr(null);
    try {
      const r = await fetch("/api/strava/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages, perPage }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || `Sync failed: ${r.status}`);
      setNotice(`Đồng bộ xong: lưu ${d.saved} hoạt động.`);
      await fetchRuns(); // reload list sau khi sync
    } catch (e: unknown) {
      setErr((e as { message: string }).message || String(e));
    } finally {
      setSyncing(false);
    }
  }

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

      {/* thanh điều khiển sync */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-3 py-2 rounded-lg border border-black/10 hover:bg-black/5 disabled:opacity-60"
        >
          {syncing ? "Syncing…" : "Sync from Strava"}
        </button>

        {/* input tuỳ chọn */}
        <label className="text-sm opacity-75">
          Pages:
          <input
            type="number"
            min={1}
            value={pages}
            onChange={(e) => setPages(Number(e.target.value))}
            className="ml-2 w-16 rounded-md border border-black/10 px-2 py-1"
          />
        </label>
        <label className="text-sm opacity-75">
          Per page:
          <input
            type="number"
            min={1}
            max={200}
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="ml-2 w-20 rounded-md border border-black/10 px-2 py-1"
          />
        </label>
      </div>

      {notice && <div className="mb-3 text-green-700 text-sm">{notice}</div>}
      {err && <div className="mb-3 text-red-600 text-sm">Error: {err}</div>}
      {!data && !err && <div>Loading…</div>}

      {data && (
        <div className="space-y-3">
          {data.map((run) => (
            <Link href={`/run/${run.stravaId ?? run.id}`} key={run.id}>
              <div className="font-medium">{run.name}</div>
              <div className="text-sm opacity-80">
                {new Date(run.start_local).toLocaleString()}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>Distance: {run.distance_km.toFixed(2)} km</div>
                <div>Time: {run.moving_time_min.toFixed(1)} phút</div>
                <div>Pace: {fmtPace?.(run.pace_min_per_km ?? null)}</div>
                <div>Avg HR: {run.avg_hr ?? "—"}</div>
                <div className="col-span-2 opacity-70">
                  Device: {run.device ?? "—"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
