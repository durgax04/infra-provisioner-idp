# Terraform State Management Problem

## Current Design

Assume two users provision S3 buckets through your platform:

* User A creates `bucket-a`
* User B creates `bucket-b`

Your Terraform configuration looks like this:

```hcl
resource "aws_s3_bucket" "bucket" {
  bucket = var.bucket_name
}
```

Terraform manages this resource using a single state file.

---

## What Goes Wrong?

### Request 1

User A provisions:

```bash
terraform apply -var="bucket_name=bucket-a"
```

Terraform state now contains:

```text
aws_s3_bucket.bucket = bucket-a
```

### Request 2

User B provisions:

```bash
terraform apply -var="bucket_name=bucket-b"
```

Terraform compares the current state with the desired configuration:

```text
Current: bucket-a
Desired: bucket-b
```

Terraform assumes the resource should be modified and attempts to replace `bucket-a` with `bucket-b`.

This is not the intended behavior.

Each provisioning request should create and manage its own infrastructure independently.

---

# Approaches

## Option 1: Separate Terraform Workspaces

Create a dedicated workspace for each request or tenant.

Example:

```text
workspace-bucket-a
workspace-bucket-b
workspace-bucket-c
```

Provisioning flow:

```bash
terraform workspace new bucket-a
terraform apply

terraform workspace new bucket-b
terraform apply
```

Each workspace maintains its own state, preventing conflicts between users.

---

## Option 2: Separate State Files (Recommended)

Store infrastructure state in different backend keys.

Example:

```text
states/
├── bucket-a.tfstate
├── bucket-b.tfstate
└── bucket-c.tfstate
```

Backend configuration:

```hcl
terraform {
  backend "s3" {
    bucket = "terraform-state-bucket"
    key    = "states/${bucket_name}.tfstate"
    region = "ap-south-1"
  }
}
```

When provisioning:

```text
bucket-a → states/bucket-a.tfstate
bucket-b → states/bucket-b.tfstate
bucket-c → states/bucket-c.tfstate
```

Each request gets an isolated Terraform state file.

---

# Why This Matters

Without state isolation:

* Users can overwrite each other's infrastructure.
* Terraform may destroy existing resources unexpectedly.
* Concurrent provisioning requests become unsafe.

With isolated state:

* Every request is independent.
* Infrastructure remains predictable.
* Multiple users can provision resources simultaneously.
* The platform scales safely as usage grows.

---

# Best Practice

Most Internal Developer Platforms (IDPs) and self-service provisioning systems use one of the following:

1. Dedicated Terraform workspaces
2. Separate state files per resource/request
3. Separate Terraform projects per tenant

For an SQS-driven provisioning platform, maintaining a unique Terraform state file per request is typically the simplest and most scalable approach.
