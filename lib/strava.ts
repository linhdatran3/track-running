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
