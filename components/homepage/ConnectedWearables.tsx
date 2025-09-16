"use client";
import { useGetWearables, useWearablesSync } from "@/hooks/useWearables";

//TODO: add skeleton
export default function ConnectedWearables() {
  const { data: devices, isLoading } = useGetWearables();
  const { mutate: syncWearable, isPending, data } = useWearablesSync();

  return (
    <section className="p-4 rounded-xl border bg-background text-foreground shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Connected Wearables</h2>
        <button
          onClick={() => syncWearable({ pages: 3, perPage: 3 })}
          disabled={isPending || isLoading}
          className="px-3 py-1 rounded border disabled:opacity-60"
        >
          {isPending ? "Syncing…" : "Sync data"}
        </button>
      </div>

      {data && (
        <div className="mb-2 text-sm text-green-700">{`Synced ${data.saved} activities.`}</div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {devices?.map((d) => (
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
    </section>
  );
}
