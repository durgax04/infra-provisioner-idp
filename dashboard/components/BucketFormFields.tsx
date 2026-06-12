import { ChangeEvent } from "react";
import { BucketFormState } from "@/types/bucket";

interface FieldsProps {
  form: BucketFormState;
  loading: boolean;
  onChange: (updatedForm: BucketFormState) => void;
}

export function BucketFormFields({ form, loading, onChange }: FieldsProps) {
  return (
    <div className="space-y-6">
      {/* Bucket Name */}
      <div>
        <label className="block text-sm font-medium mb-2 text-neutral-300">
          Bucket Name <span className="text-red-400">*</span>
        </label>
        <input
          className="border border-neutral-400 bg-transparent p-2.5 w-full rounded-md text-sm text-white focus:outline-none focus:border-white placeholder-neutral-600 dynamic-border"
          placeholder="Enter bucket name"
          value={form.bucket_name}
          disabled={loading}
          required
          onChange={(e) => onChange({ ...form, bucket_name: e.target.value })}
        />
      </div>

      {/* Bucket Type */}
      <div>
        <label className="block text-sm font-medium mb-2 text-neutral-300">Bucket Type</label>
        <select
          className="border border-neutral-400 bg-neutral-950 p-2.5 w-full rounded-md text-sm text-white focus:outline-none focus:border-white"
          value={form.bucket_type}
          disabled={loading}
          onChange={(e) => {
            const type = e.target.value;
            onChange({
              ...form,
              bucket_type: type,
              cors_enabled: type === "public" ? form.cors_enabled : false,
              allowed_origins: type === "public" ? form.allowed_origins : [],
            });
          }}
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 text-sm font-medium select-none cursor-pointer text-neutral-300">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-neutral-400 bg-transparent text-neutral-900 focus:ring-0 focus:ring-offset-0"
            checked={form.versioning}
            disabled={loading}
            onChange={(e) => onChange({ ...form, versioning: e.target.checked })}
          />
          Enable Versioning
        </label>

        {form.bucket_type === "public" && (
          <>
            <label className="flex items-center gap-3 text-sm font-medium select-none cursor-pointer text-neutral-300">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-neutral-400 bg-transparent text-neutral-900 focus:ring-0 focus:ring-offset-0"
                checked={form.cors_enabled}
                disabled={loading}
                onChange={(e) =>
                  onChange({
                    ...form,
                    cors_enabled: e.target.checked,
                    allowed_origins: e.target.checked ? form.allowed_origins : [],
                  })
                }
              />
              Enable CORS
            </label>

            {form.cors_enabled && (
              <div className="pl-7">
                <label className="block text-sm font-medium mb-2 text-neutral-300">Allowed Origin</label>
                <input
                  className="border border-neutral-400 bg-transparent p-2.5 w-full rounded-md text-sm text-white focus:outline-none focus:border-white placeholder-neutral-600"
                  placeholder="https://www.example.com"
                  value={form.allowed_origins[0] || ""}
                  disabled={loading}
                  onChange={(e) => onChange({ ...form, allowed_origins: [e.target.value] })}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}