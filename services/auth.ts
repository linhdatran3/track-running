import { queryKeys } from "@/utils/queryKeys";
import { fetchJSON } from "@/utils/fetcher";
import { User } from "@prisma/client";
import { apiEndpoint } from "@/utils/endpoint";
import type { QueryClient } from "@tanstack/react-query";

export function getMe() {
  return {
    queryKey: queryKeys.me(),
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      fetchJSON<User>(apiEndpoint.me, { signal }),
  } as const;
}

export async function prefetchMe(qc: QueryClient) {
  return qc.prefetchQuery(getMe());
}
