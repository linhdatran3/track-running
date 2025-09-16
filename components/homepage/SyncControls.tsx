"use client";
import { useActivitiesSync } from "@/hooks/useSyncStrava";

type Props = {
  pages: number;
  perPage: number;
  setPages: (v: number) => void;
  setPerPage: (v: number) => void;
  onSuccess?: (saved: number) => void;
  onError?: (m?: string) => void;
};

export default function SyncControls({
  pages,
  perPage,
  setPages,
  setPerPage,
  onSuccess,
  onError,
}: Props) {
  const { mutate: syncActivities, isPending } = useActivitiesSync({
    onSuccess,
    onError,
  });

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button
        onClick={() => syncActivities({ pages, perPage })}
        disabled={isPending}
        className="px-3 py-2 rounded-lg border border-black/10 hover:bg-black/5 disabled:opacity-60"
      >
        {isPending ? "Syncing…" : "Sync from Strava"}
      </button>

      <label className="text-sm opacity-75">
        Pages:
        <input
          type="number"
          min={1}
          value={pages}
          onChange={(e) => setPages(Number(e.target.value))}
          className="ml-2 w-16 rounded-md border border-black/10 px-2 py-1"
        />
      </label>
      <label className="text-sm opacity-75">
        Per page:
        <input
          type="number"
          min={1}
          max={200}
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
          className="ml-2 w-20 rounded-md border border-black/10 px-2 py-1"
        />
      </label>
    </div>
  );
}
