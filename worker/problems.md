# Terraform Provisioning Improvements

## Problem 1: Shared `terraform.tfvars`

### Current Implementation

```python
with open(
    "../terraform/environments/dev/terraform.tfvars",
    "w"
)
```

### Issue

If two requests arrive simultaneously:

**Request A**

```text
bucket-a
```

**Request B**

```text
bucket-b
```

Worker 1 writes:

```hcl
bucket_name="bucket-a"
```

Worker 2 immediately overwrites:

```hcl
bucket_name="bucket-b"
```

As a result, Terraform may use incorrect values, causing unpredictable deployments.

### Solution

Create a dedicated working directory for each request:

```text
terraform-runs/
├── request-1/
└── request-2/
```

Or generate a unique tfvars file per request:

```python
tfvars_file = f"/tmp/{body['requestId']}.tfvars"
```

This ensures complete isolation between concurrent Terraform executions.

---

## Problem 2: Terraform State Management

### Current Situation

All requests share the same:

```text
terraform.tfstate
```

### Issue

If multiple resources are provisioned:

```text
bucket-1
bucket-2
bucket-3
```

Terraform assumes they belong to a single deployment state.

This can lead to:

* Resource conflicts
* Unexpected updates
* Accidental deletions
* Difficult lifecycle management

### Solution

For production environments, use a remote backend:

```hcl
backend "s3" {
}
```

Maintain separate state files per resource, tenant, environment, or request.

Benefits:

* State isolation
* Safer deployments
* Better scalability
* Team collaboration support

---

## Problem 3: Long Terraform Apply Times

### Current Implementation

```python
terraform apply
```

### Issue

Terraform operations can hang for several minutes due to:

* AWS API delays
* Network issues
* Resource provisioning time
* State locking problems

### Solution

Add a timeout:

```python
result = subprocess.run(
    [...],
    timeout=300,
    capture_output=True,
    text=True
)
```

Benefits:

* Prevents stuck workers
* Improves system reliability
* Frees resources automatically

---

## Problem 4: Missing Terraform Logs

### Current Situation

Only printing errors:

```python
print(result.stderr)
```

### Issue

Once execution finishes, logs are lost, making debugging difficult.

### Solution

Persist Terraform output in DynamoDB:

```python
table.update_item(
    ...
    ":l": result.stdout
)
```

Store:

* Terraform stdout
* Terraform stderr
* Execution timestamps
* Status updates

### Benefits

* Easier debugging
* Historical audit trail
* Faster incident resolution
* Better observability
