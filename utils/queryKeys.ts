export const queryKeys = {
  activities: () => ["activities"] as const,
  activitiesId: (id?: string) => ["activities", id] as const,
  activitiesStream: (id?: string) => ["activities", id, "streams"] as const,
  run: (id: string) => ["run", id] as const,
  summary: () => ["summary"] as const,
  todayWeekSummary: () => ["summary", "today-week"],
} as const;
