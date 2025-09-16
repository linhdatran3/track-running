"use client";
import { fmtPace } from "@/lib/strava";
import { summaries } from "@/services/summary";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import TodayWeekSummarySection from "./TodayWeekSummary";
import ConnectedWearables from "./ConnectedWearables";

const DashboardRunning = () => {
  const { data: summary, isLoading } = useQuery(summaries());

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-2xl font-semibold">Running Dashboard</h2>

      {!isLoading && summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border bg-card text-foreground shadow">
              <div className="text-sm opacity-70">Distance</div>
              <div className="text-xl font-bold">
                {summary.total.distanceKm.toFixed(1)} km
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-card text-foreground shadow">
              <div className="text-sm opacity-70">Avg pace</div>
              <div className="text-xl font-bold">
                {fmtPace(summary.total.avgPaceMinPerKm)}
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-card text-foreground shadow">
              <div className="text-sm opacity-70">Time running</div>
              <div className="text-xl font-bold">
                {summary.total.movingTimeMin.toFixed(0)} min
              </div>
            </div>
          </div>
          <TodayWeekSummarySection />

          <ConnectedWearables />

          {/* Weekly chart */}
          <div className="p-4 rounded-xl border bg-card text-foreground shadow">
            <div className="font-medium mb-2">Weekly distance (km)</div>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={summary.weekly}>
                  <XAxis
                    dataKey="weekStartISO"
                    tickFormatter={(v) => new Date(v).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="distanceKm" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Link to runs list */}
          {/* <div>
            <Link
              href="/runs"
              className="px-4 py-2 rounded-lg border hover:bg-black/5"
            >
              View all runs
            </Link>
          </div> */}
        </>
      )}
    </div>
  );
};

export default DashboardRunning;
