"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SyncReq, SyncResp } from "@/types/run";
import { FetchError } from "@/utils/fetcher";
import { queryKeys } from "@/utils/queryKeys";
import { postSync } from "@/services/sync";

type Options = {
  onSuccess?: (saved: number) => void;
  onError?: (msg?: string) => void;
};

export function useSyncStrava({ onSuccess, onError }: Options = {}) {
  const qc = useQueryClient();

  const mutation = useMutation<SyncResp, Error, SyncReq>({
    mutationFn: (body) => postSync(body),
    onSuccess: async (resp) => {
      onSuccess?.(resp.saved);
      await qc.invalidateQueries({ queryKey: queryKeys.activities() });
    },
    onError: (err) => {
      onError?.((err as FetchError)?.message);
    },
  });

  return mutation;
}
