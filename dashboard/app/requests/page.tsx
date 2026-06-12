"use client";

import useSWR from "swr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRequests } from "@/lib/api";

export default function Requests() {
  const pathname = usePathname();
  const { data, error, isLoading } = useSWR("provision-requests", getRequests, {
    refreshInterval: 5000,
    dedupingInterval: 2000,
  });

  if (isLoading) {
    return <div className="p-8 text-neutral-400 font-medium min-h-screen bg-neutral-950">Loading requests...</div>;
  }

  if (error || !data?.requests) {
    return <div className="p-8 text-red-400 font-medium min-h-screen bg-neutral-950">Failed to load requests.</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6 text-white min-h-screen bg-neutral-950">
      {/* Navigation */}
      <nav className="flex gap-4 border-b border-neutral-800 pb-4 text-sm font-medium">
        <Link href="/" className="text-neutral-400 hover:text-white">
          Create Bucket
        </Link>
        <Link href="/requests" className={pathname === "/requests" ? "text-white font-bold" : "text-neutral-400 hover:text-white"}>
          Requests
        </Link>
        <Link href="/metrics" className="text-neutral-400 hover:text-white">
          Metrics
        </Link>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-white">Provision Requests</h1>
        <p className="text-sm text-neutral-500 mt-1">Live request status updates</p>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden border border-neutral-800 rounded-md bg-neutral-900">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <th className="p-4">Bucket</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-neutral-800 text-sm">
            {data.requests.map((request: any) => (
              <tr key={request.requestId} className="hover:bg-neutral-800/50 transition-colors">
                <td className="p-4 font-medium text-white">
                  {request.bucketName}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                    request.status?.toLowerCase() === "completed" || request.status?.toLowerCase() === "active"
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/60" 
                      : request.status?.toLowerCase() === "pending" || request.status?.toLowerCase() === "processing"
                      ? "bg-amber-950/40 text-amber-400 border-amber-800/60"
                      : "bg-neutral-800 text-neutral-300 border-neutral-700"
                  }`}>
                    {request.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}