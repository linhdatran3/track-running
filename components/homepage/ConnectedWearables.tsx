"use client";
import { useGetWearables, useWearablesSync } from "@/hooks/useWearables";

function timeAgo(dateStr?: Date | string | null) {
  if (!dateStr) return "Never synced";
  const d = new Date(dateStr);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);

  // Only show time between 1min to ndays
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 3600 * 24) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / (3600 * 24))}d ago`;
}

//TODO: add skeleton
export default function ConnectedWearables() {
  const { data, isLoading } = useGetWearables();
  const {
    mutate: syncWearable,
    isPending,
    data: mutateData,
  } = useWearablesSync();

  console.log(data);

  return (
    <section className="p-4 rounded-xl border bg-background text-foreground shadow h-fit">
      <h2 className="text-lg font-semibold">Connected Wearables</h2>

      {mutateData && (
        <div className="mb-2 text-sm text-green-700">{`Synced ${mutateData?.saved} activities.`}</div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {data?.devices?.map((d) => (
            <div
              key={d.deviceName}
              className="flex items-center gap-3 p-3 rounded-lg border"
            >
              {/* <img src={deviceImageUrl(d.deviceName)} alt={d.deviceName} className="w-12 h-12 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = "/devices/generic.png"; }} /> */}
              <div>
                <div className="font-medium">{d.deviceName}</div>
                <div className="text-sm opacity-70">{d.count} activities</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => syncWearable({ pages: 3, perPage: 3 })}
        disabled={isPending || isLoading}
        className="py-2 w-full text-center cursor-pointer italic disabled:opacity-60"
      >
        {isPending ? (
          "Syncing…"
        ) : (
          <div className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-refresh-ccw-icon lucide-refresh-ccw"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            Last sync:
            {data?.syncLog?.status
              ? timeAgo(data?.syncLog?.createdAt)
              : "Sync Data"}
          </div>
        )}
      </button>
    </section>
  );
}
