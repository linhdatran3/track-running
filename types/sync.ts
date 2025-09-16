export type SyncLogType = "wearables_sync";

export type SyncLogReq<T> = {
  userId: string;
  type: SyncLogType;
  status: string;
  detail: {
    saved: number;
    queued?: T;
  };
  createdAt: Date;
};
