"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { BucketFormFields } from "@/components/BucketFormFields";
import { BucketFormState, ToastState } from "@/types/bucket";

export default function Home() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ message: "", type: null });
  
  const [form, setForm] = useState<BucketFormState>({
    bucket_name: "",
    bucket_type: "private",
    versioning: false,
    cors_enabled: false,
    allowed_origins: [""],
  });

  const submit = async () => {
    setLoading(true);
    setToast({ message: "Provisioning S3 bucket...", type: "loading" });
    
    const apiBase = process.env.BASE_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${apiBase}/provision/s3`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Server responded with an error");

      const data = await res.json();
      
      setToast({ 
        message: `Success! Request ID: ${data.requestId}`, 
        type: "success" 
      });
    } catch (err) {
      console.error(err);
      setToast({ 
        message: "Failed to create bucket. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = loading || !form.bucket_name.trim();

  return (
    <div className="max-w-xl mx-auto p-8 space-y-6 text-white min-h-screen bg-neutral-950">
      {/* Navigation */}
      <nav className="flex gap-4 border-b border-neutral-800 pb-4 text-sm font-medium">
        <Link href="/" className={pathname === "/" ? "text-white font-bold" : "text-neutral-400 hover:text-white"}>
          Create Bucket
        </Link>
        <Link href="/requests" className="text-neutral-400 hover:text-white">
          Requests
        </Link>
        <Link href="/metrics" className="text-neutral-400 hover:text-white">
          Metrics
        </Link>
      </nav>

      <h1 className="text-2xl font-bold">Create S3 Bucket</h1>

      {/* Input Fields Component */}
      <BucketFormFields form={form} loading={loading} onChange={setForm} />

      {/* Status Banner Actions */}
      <div className="pt-2 space-y-4">
        <button
          className={`border border-neutral-800 cursor-pointer bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium rounded-md transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-800"
          } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-900`}
          onClick={submit}
          disabled={isButtonDisabled}
        >
          {loading ? "Creating..." : "Create Bucket"}
        </button>

        {/* Status Notification */}
        {toast.type && (
          <div className={`p-3 rounded-md text-sm border font-medium transition-all ${
            toast.type === "loading" ? "bg-neutral-900/50 text-neutral-400 border-neutral-800" :
            toast.type === "success" ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/50" :
            "bg-red-950/30 text-red-400 border-red-900/50"
          }`}>
            <div className="flex items-center gap-2">
              {toast.type === "loading" && <span className="animate-pulse w-2 h-2 rounded-full bg-neutral-400" />}
              {toast.type === "success" && <span>✓</span>}
              {toast.type === "error" && <span>✕</span>}
              <p>{toast.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Payload Preview */}
      <pre className="border border-neutral-800 p-4 bg-neutral-900 text-xs rounded-md text-emerald-400 overflow-auto max-h-48 font-mono">
        {JSON.stringify(form, null, 2)}
      </pre>
    </div>
  );
}