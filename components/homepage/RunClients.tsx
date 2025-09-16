"use client";
import ActivitiesList from "./ActivitiesList";
import { useState } from "react";
import SyncControls from "./SyncControls";

export default function RunsClient({ className }: { className?: string }) {
  const [notice, setNotice] = useState<string | null>(null);
  const [pages, setPages] = useState(3);
  const [perPage, setPerPage] = useState(50);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const onError = (msg?: string) => setErrMsg(msg || "Có lỗi xảy ra");
  const onNotice = (msg?: string) => setNotice(msg || null);

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Track Running Schedule</h1>
        {/* <a
          href="/api/strava/authorize"
          className="px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5"
        >
          Connect Strava
        </a> */}
      </div>

      <SyncControls
        pages={pages}
        perPage={perPage}
        setPages={setPages}
        setPerPage={setPerPage}
        onSuccess={(saved) => onNotice(`Đồng bộ xong: lưu ${saved} hoạt động.`)}
        onError={onError}
      />

      {notice && <div className="mb-3 text-green-700 text-sm">{notice}</div>}
      {errMsg && (
        <div className="mb-3 text-red-600 text-sm">Error: {errMsg}</div>
      )}

      <ActivitiesList onError={onError} />
    </div>
  );
}
