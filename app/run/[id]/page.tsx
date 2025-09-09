import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { prefetchActivityById } from "@/services/activities";
import RunDetail from "@/components/run/RunDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const qc = new QueryClient();
  await prefetchActivityById(qc, id);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <RunDetail id={id} />
    </HydrationBoundary>
  );
}
