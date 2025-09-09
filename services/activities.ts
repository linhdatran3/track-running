import type { QueryClient } from "@tanstack/react-query";
import type { Run, Stream } from "@/types/run";
import { fetchJSON } from "@/utils/fetcher";
import { apiEndpoint } from "@/utils/endpoint";
import { queryKeys } from "@/utils/queryKeys";
import { buildEndpoint } from "./url";

// Share Fn both server and client
export function activitiesQueryOptions() {
  return {
    queryKey: queryKeys.activities(),
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      fetchJSON<Run[]>(apiEndpoint.activities, { signal }),
  } as const;
}

export async function prefetchActivities(qc: QueryClient) {
  return qc.prefetchQuery(activitiesQueryOptions());
}

export function activityById(id?: string, signal?: AbortSignal) {
  return {
    queryKey: queryKeys.activitiesId(id),
    queryFn: () =>
      fetchJSON<Run>(buildEndpoint(apiEndpoint.activities_id, { id }), {
        signal,
      }),
    enabled: !!id, // client can skip when id is undefined
  } as const;
}

export async function prefetchActivityById(qc: QueryClient, id: string) {
  return qc.prefetchQuery(activityById(id));
}

export function activityStreamById(id?: string, signal?: AbortSignal) {
  return {
    queryKey: queryKeys.activitiesStream(id),
    queryFn: () =>
      fetchJSON<Stream>(
        buildEndpoint(apiEndpoint.activities_id_streams, { id }),
        {
          signal,
        }
      ),
    enabled: !!id, // client can skip when id is undefined
  } as const;
}
