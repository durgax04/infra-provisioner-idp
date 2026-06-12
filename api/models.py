from pydantic import BaseModel, field_validator

class S3ProvisionRequest(BaseModel):
    bucket_name: str
    versioning: bool = False
    cors_enabled: bool = False
    allowed_origins: list[str] = []
    bucket_type: str = "private"
    
    @field_validator("bucket_name")
    @classmethod
    def normalized_bucket_name(cls, value):
        return value.lower()