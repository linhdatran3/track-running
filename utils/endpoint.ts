export const buildApiEndpoint = (
  endpoint: string,
  slug: Record<string, string>
) => endpoint.replace(`{${slug.key}}`, slug.JsonValue ?? "");

export const apiEndpoint = {
  activities: "/api/activities",
  activities_id: "/api/activities/{id}",
  activities_id_streams: "/api/activities/{id}/streams",
  sync: "/api/strava/sync",
  summary: "/api/summary",
  todayWeekSummary: "/api/summary/today-week",
} as const;

export type ApiEndpointKey = keyof typeof apiEndpoint;
