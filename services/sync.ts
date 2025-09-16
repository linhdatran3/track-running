import { apiEndpoint } from "@/utils/endpoint";
import { fetchJSON } from "@/utils/fetcher";

export type SyncReq = { pages: number; perPage: number };
export type SyncResp = { saved: number };

export async function postActivitiesSync(body: SyncReq, signal?: AbortSignal) {
  return fetchJSON<SyncResp>(apiEndpoint.activities_sync, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}
