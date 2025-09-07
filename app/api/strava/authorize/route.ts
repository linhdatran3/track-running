import { NextResponse } from "next/server";
import { getStravaAuthUrl } from "@/lib/strava";

export async function GET() {
  const url = getStravaAuthUrl();
  const hasClient = (process.env.STRAVA_CLIENT_ID || "").length > 0;
  const hasRedirect = (process.env.STRAVA_REDIRECT_URI || "").length > 0;
  if (!hasClient || !hasRedirect) {
    return NextResponse.json(
      { error: "Missing STRAVA_CLIENT_ID or STRAVA_REDIRECT_URI" },
      { status: 400 }
    );
  }
  return NextResponse.redirect(url);
}
