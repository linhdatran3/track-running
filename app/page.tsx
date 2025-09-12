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
import TodayWeekSummarySection from "@/components/homepage/TodayWeekSummary";

export default async function Page() {
  const qc = new QueryClient();
  await Promise.all([
    prefetchActivities(qc),
    prefetchSummaries(qc),
    prefetchTodayWeekSummary(qc),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <DashboardRunning />
      <TodayWeekSummarySection />
      <RunsClient />
    </HydrationBoundary>
  );
}
