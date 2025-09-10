"use client";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Run } from "@/types/run";
import { activitiesQueryOptions } from "@/services/activities";
import { activityById } from "./../services/activities";

export function useActivities(options?: UseQueryOptions<Run[]>) {
  const base = activitiesQueryOptions(); // { queryKey, queryFn }
  return useQuery<Run[]>({
    ...base,
    ...options, // cho phép override staleTime, select, enabled...
  });
}

export function useActivityById(id?: string, options?: UseQueryOptions<Run>) {
  const base = activityById(id);
  return useQuery<Run>({
    ...base,
    ...options,
  });
}
