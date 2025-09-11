import { Summary, TodayWeekSummary } from "@/types/summary";
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

export function todayWeekSummary() {
  return {
    queryKey: queryKeys.todayWeekSummary(),
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      fetchJSON<TodayWeekSummary>(apiEndpoint.todayWeekSummary, { signal }),
  } as const;
}
export async function prefetchSummaries(qc: QueryClient) {
  return qc.prefetchQuery(summaries());
}

export async function prefetchTodayWeekSummary(qc: QueryClient) {
  return qc.prefetchQuery(todayWeekSummary());
}
