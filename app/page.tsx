export default function Home() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Track Running Schedule</h1>
      <p className="mt-2 text-sm opacity-80">
        Kết nối Strava để đồng bộ lịch và hiệu suất chạy (dữ liệu Garmin sync).
      </p>
      <a
        href="/api/strava/authorize"
        className="inline-block mt-6 px-4 py-2 rounded-xl border border-black/10 hover:bg-black/5"
      >
        Connect Strava
      </a>
      <div className="mt-6 text-xs opacity-70">
        Lưu ý: cần thiết lập STRAVA_CLIENT_ID, STRAVA_REDIRECT_URI trong
        .env.local
      </div>
    </main>
  );
}
