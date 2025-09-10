import { Summary } from "@/types/summary";
import { apiEndpoint } from "@/utils/endpoint";
import { fetchJSON } from "@/utils/fetcher";
import { queryKeys } from "@/utils/queryKeys";
import { QueryClient } from "@tanstack/react-query";

export function summaries() {
  return {
    queryKey: queryKeys.summary(),
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      fetchJSON<Summary>(apiEndpoint.summary, { signal }),
  } as const;
}

export async function prefetchSummaries(qc: QueryClient) {
  return qc.prefetchQuery(summaries());
}
