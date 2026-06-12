module "s3" {
  source = "../../modules/s3"

  bucket_name     = var.bucket_name
  versioning      = var.versioning
  cors_enabled    = var.cors_enabled
  allowed_origins = var.allowed_origins
  bucket_type     = var.bucket_type
}