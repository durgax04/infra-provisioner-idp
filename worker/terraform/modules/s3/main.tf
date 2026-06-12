resource "aws_s3_bucket" "this" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = var.bucket_type == "private"
  block_public_policy     = var.bucket_type == "private"
  ignore_public_acls      = var.bucket_type == "private"
  restrict_public_buckets = var.bucket_type == "private"
}

resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id

  count = var.versioning ? 1 : 0

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  count = var.cors_enabled ? 1 : 0

  cors_rule {
    allowed_methods = ["GET"]
    allowed_origins = var.allowed_origins
    allowed_headers = ["*"]
  }
}

resource "aws_s3_bucket_policy" "public" {
  bucket = aws_s3_bucket.this.id
  count  = var.bucket_type == "public" ? 1 : 0

  depends_on = [ aws_s3_bucket_public_access_block.this ]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action = [
          "s3:*"
        ]
        Resource = [
          "${aws_s3_bucket.this.arn}/*"
        ]
      }
    ]
  })
}
