variable "bucket_name" {
  type = string
}

variable "versioning" {
  type = bool
}

variable "cors_enabled" {
  type = bool
}

variable "allowed_origins" {
  type = list(string)
}

variable "bucket_type" {
  type = string
}