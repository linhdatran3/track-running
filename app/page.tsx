import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import RunsClient from "@/components/homepage/RunClients";
import { prefetchActivities } from "@/services/activities";

export default async function Page() {
  const qc = new QueryClient();
  await prefetchActivities(qc);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <RunsClient />
    </HydrationBoundary>
  );
}
