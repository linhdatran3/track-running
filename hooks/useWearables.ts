import { getWearables, postWearablesSync } from "@/services/wearables";
import { SyncOptions } from "@/types/base";
import { SyncReq } from "@/types/run";
import { WearableRes, WearableSyncRes } from "@/types/wearable";
import { FetchError } from "@/utils/fetcher";
import { queryKeys } from "@/utils/queryKeys";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

export function useGetWearables(options?: UseQueryOptions<WearableRes>) {
  const base = getWearables();
  return useQuery<WearableRes>({
    ...base,
    ...options,
  });
}

export function useWearablesSync({ onSuccess, onError }: SyncOptions = {}) {
  const qc = useQueryClient();

  const mutation = useMutation<WearableSyncRes, Error, SyncReq>({
    mutationFn: (body) => postWearablesSync(body),
    onSuccess: async (resp) => {
      onSuccess?.(resp.saved);
      await qc.invalidateQueries({ queryKey: queryKeys.wearables() });
    },
    onError: (err) => {
      onError?.((err as FetchError)?.message);
    },
  });

  return mutation;
}
