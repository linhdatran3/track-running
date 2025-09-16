"use client";
import { getMe } from "@/services/auth";
import { apiEndpoint } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function AuthGate() {
  const { data: userData } = useQuery(getMe());
  if (userData === undefined) return <div>Loading…</div>;
  if (!userData) {
    return (
      <div className="h-screen w-svh items-center justify-center">
        <Link
          href={apiEndpoint.strava_auth}
          className="px-4 py-2 rounded border"
        >
          Connect with Strava
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#1c1717] h-screen py-4 md:w-[240px]">
      <div>
        <div className="text-sm font-medium">
          {userData.firstname ?? userData.username}
        </div>
        <div className="text-xs opacity-70">
          Strava ID: {userData.stravaAthleteId}
        </div>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await fetch("/api/logout", { method: "POST" });
          window.location.href = "/";
        }}
      >
        <button type="submit" className="ml-4 px-2 py-1 border rounded">
          Logout
        </button>
      </form>
    </div>
  );
}
