"use client";

import { useState } from "react";
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

  // Track which request IDs are currently expanded
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (requestId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  };

  if (isLoading) {
    return <div className="p-8 text-neutral-400 font-medium min-h-screen bg-neutral-950">Loading requests...</div>;
  }

  if (error || !data?.requests) {
    return <div className="p-8 text-red-400 font-medium min-h-screen bg-neutral-950">Failed to load requests.</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6 text-white min-h-screen bg-neutral-950">
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

      <div className="overflow-hidden border border-neutral-800 rounded-md bg-neutral-900">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <th className="p-4">Bucket</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-neutral-800 text-sm">
            {data.requests.map((request: any) => {
              const isExpanded = !!expandedRows[request.requestId];
              
              return (
                <tr key={request.requestId} className="border-b border-neutral-800 last:border-b-0">
                  <td colSpan={2} className="p-0">
                    <div 
                      onClick={() => toggleRow(request.requestId)}
                      className="flex justify-between items-center gap-8 p-4 hover:bg-neutral-800/50 transition-colors cursor-pointer select-none"
                    >
                      <div className="font-medium text-white flex items-center gap-2">
                        <svg 
                          className={`w-4 h-4 text-neutral-500 transition-transform ${isExpanded ? "rotate-90" : ""}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {request.bucketName}
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                          request.status?.toLowerCase() === "completed" || request.status?.toLowerCase() === "active"
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/60" 
                            : request.status?.toLowerCase() === "pending" || request.status?.toLowerCase() === "processing"
                            ? "bg-amber-950/40 text-amber-400 border-amber-800/60"
                            : "bg-neutral-800 text-neutral-300 border-neutral-700"
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Payload Panel */}
                    {isExpanded && (
                      <div className="px-4 pb-4 bg-neutral-950/50 border-t border-neutral-800/40">
                        <div className="mt-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                          Configuration Payload
                        </div>
                        <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 font-mono overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(request.payload || request.config || request, null, 2)}
                        </pre>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}