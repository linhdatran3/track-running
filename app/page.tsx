import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import RunsClient from "@/components/homepage/RunClients";
import { prefetchActivities } from "@/services/activities";
import DashboardRunning from "@/components/homepage/Dashboard";
import { prefetchSummaries } from "@/services/summary";

export default async function Page() {
  const qc = new QueryClient();
  await Promise.all([prefetchActivities(qc), prefetchSummaries(qc)]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <DashboardRunning />
      <RunsClient />
    </HydrationBoundary>
  );
}
