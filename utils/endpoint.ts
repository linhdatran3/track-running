export const buildApiEndpoint = (
  endpoint: string,
  slug: Record<string, string>
) => endpoint.replace(`{${slug.key}}`, slug.JsonValue ?? "");

export const apiEndpoint = {
  activities: "/api/activities",
  activities_id: "/api/activities/{id}",
  activities_id_streams: "/api/activities/{id}/streams",
  activities_sync: "/api/activities/sync",
  summary: "/api/summary",
  todayWeekSummary: "/api/summary/today-week",
  me: "/api/me",
  strava_auth: "/api/strava/authorize",
  wearables: "/api/wearables",
  wearables_sync: "/api/wearables/sync",
} as const;

export type ApiEndpointKey = keyof typeof apiEndpoint;
