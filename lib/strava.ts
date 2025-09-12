import { prisma } from "./db";

export type TokenResp = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch seconds
  athlete?: Athlete;
};

export type Athlete = {
  id: number;
  username?: string;
  firstname?: string;
  lastname?: string;
  profilePhoto?: string;
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

export async function getValidAccessTokenFromReq(req: Request) {
  // Extract cookie: compatible with Next.js server handlers (req: Request)
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/session=([^;]+)/);
  const sessionToken = match ? match[1] : null;
  if (!sessionToken) throw new Error("Not authenticated");

  // Find session + user
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });
  if (!session) throw new Error("Session not found");
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    throw new Error("Session expired");
  }

  const user = session.user;
  if (!user || !user.refreshToken) throw new Error("User missing tokens");

  const now = Math.floor(Date.now() / 1000);
  if (!user.expiresAt || user.expiresAt <= now) {
    // refresh
    const tok = await refreshAccessToken(user.refreshToken);
    // update DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken: tok.access_token,
        refreshToken: tok.refresh_token,
        expiresAt: tok.expires_at,
      },
    });
    return tok.access_token;
  }
  // still valid
  return user.accessToken!;
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
