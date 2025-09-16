import { WearableRes, WearableSyncRes } from "@/types/wearable";
import { apiEndpoint } from "@/utils/endpoint";
import { fetchJSON } from "@/utils/fetcher";
import { queryKeys } from "@/utils/queryKeys";
import { QueryClient } from "@tanstack/react-query";
import { SyncReq } from "./sync";

export function getWearables() {
  return {
    queryKey: queryKeys.wearables(),
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      fetchJSON<WearableRes>(apiEndpoint.wearables, { signal }),
  } as const;
}

export async function prefetchWearables(qc: QueryClient) {
  return qc.prefetchQuery(getWearables());
}

export async function postWearablesSync(body?: SyncReq, signal?: AbortSignal) {
  return fetchJSON<WearableSyncRes>(apiEndpoint.wearables_sync, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}
