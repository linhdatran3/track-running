import { apiEndpoint } from "@/utils/endpoint";
import { fetchJSON } from "@/utils/fetcher";

export type SyncReq = { pages: number; perPage: number };
export type SyncResp = { saved: number };

export async function postSync(body: SyncReq, signal?: AbortSignal) {
  return fetchJSON<SyncResp>(apiEndpoint.sync, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}
