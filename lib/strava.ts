export type TokenResp = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch seconds
  athlete?: { id: number };
};

export async function exchangeToken(code: string): Promise<TokenResp> {
  const r = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
    // optional: next: { revalidate: 0 }  // if you want
  });
  if (!r.ok) throw new Error(`exchangeToken failed: ${r.status}`);
  return (await r.json()) as TokenResp;
}

export function getStravaAuthUrl() {
  const base = "https://www.strava.com/oauth/authorize";
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID || "",
    response_type: "code",
    redirect_uri: process.env.STRAVA_REDIRECT_URI || "",
    approval_prompt: "auto",
    scope: "read,activity:read,activity:read_all",
  });
  return `${base}?${params.toString()}`;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenResp> {
  const r = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!r.ok) throw new Error(`refreshAccessToken failed: ${r.status}`);
  return (await r.json()) as TokenResp;
}

export async function getActivities(
  accessToken: string,
  page = 1,
  perPage = 30
) {
  const url = new URL("https://www.strava.com/api/v3/athlete/activities");
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) throw new Error(`getActivities failed: ${r.status}`);

  return (await r.json()) as { sport_type: string; type: string }[];
}

export function isRun(a: { sport_type: string; type: string }) {
  return (
    a?.sport_type === "Run" || a?.type === "Run" || a?.sport_type === "TrailRun"
  );
}

export function calcPaceMinPerKm(movingTimeSec?: number, distanceM?: number) {
  if (!movingTimeSec || !distanceM) return null;
  const minPerKm = movingTimeSec / (distanceM / 1000) / 60;
  return Number.isFinite(minPerKm) ? minPerKm : null;
}

export function fmtPace(minPerKm: number | null) {
  if (minPerKm == null) return "—";
  const totalSec = Math.round(minPerKm * 60);
  const mm = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return `${mm}:${ss} /km`;
}
