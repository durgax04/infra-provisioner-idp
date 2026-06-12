import uuid

def build_tfvars(payload):
    return {
        "bucket_name":
            f"{payload['bucketName']}-{uuid.uuid4().hex[:8]}",
        "versioning": payload.get("versioning", False),
        "cors_enabled": payload.get("corsEnabled", False),
        "allowed_origins": payload.get("allowedOrigins", []),
        "bucket_type": payload.get("bucketType", "private")
    }