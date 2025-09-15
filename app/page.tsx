import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import RunsClient from "@/components/homepage/RunClients";
import { prefetchActivities } from "@/services/activities";
import DashboardRunning from "@/components/homepage/Dashboard";
import {
  prefetchSummaries,
  prefetchTodayWeekSummary,
} from "@/services/summary";

export default async function Page() {
  const qc = new QueryClient();
  await Promise.all([
    prefetchActivities(qc),
    prefetchSummaries(qc),
    prefetchTodayWeekSummary(qc),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <div className="flex w-full justify-between gap-8">
        <DashboardRunning />
        <RunsClient className="w-full border-l border-foreground p-4" />
      </div>
    </HydrationBoundary>
  );
}
