from pydantic import BaseModel

class S3ProvisionRequest(BaseModel):
    bucket_name: str