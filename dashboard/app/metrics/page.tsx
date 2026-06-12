"use client";

import useSWR from "swr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStats } from "@/lib/api";

export default function Metrics() {
  const pathname = usePathname();
  const { data: stats, error, isLoading } = useSWR("platform-stats", getStats, {
    refreshInterval: 5000, 
    dedupingInterval: 2000, 
  });

  if (isLoading) {
    return <div className="p-8 text-neutral-400 font-medium min-h-screen bg-neutral-950">Loading metrics...</div>;
  }

  if (error || !stats) {
    return <div className="p-8 text-red-400 font-medium min-h-screen bg-neutral-950">Failed to load metrics.</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6 text-white min-h-screen bg-neutral-950">
      <nav className="flex gap-4 border-b border-neutral-800 pb-4 text-sm font-medium">
        <Link href="/" className="text-neutral-400 hover:text-white">
          Create Bucket
        </Link>
        <Link href="/requests" className="text-neutral-400 hover:text-white">
          Requests
        </Link>
        <Link href="/metrics" className={pathname === "/metrics" ? "text-white font-bold" : "text-neutral-400 hover:text-white"}>
          Metrics
        </Link>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-white">Platform Metrics</h1>
        <p className="text-sm text-neutral-500 mt-1">Live updates every 5 seconds</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="p-4 border border-neutral-800 bg-neutral-900 rounded-md">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </p>
            <p className="text-xl font-bold text-white mt-2">
              {typeof value === "object" ? JSON.stringify(value) : String(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}