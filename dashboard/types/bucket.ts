export type BucketFormState = {
  bucket_name: string;
  bucket_type: string;
  versioning: boolean;
  cors_enabled: boolean;
  allowed_origins: string[];
};

export type ToastState = {
  message: string;
  type: "loading" | "success" | "error" | null;
};