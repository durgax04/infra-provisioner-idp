from fastapi import FastAPI, HTTPException 
from models import S3ProvisionRequest
from fastapi.middleware.cors import CORSMiddleware

import boto3
import uuid
import json
import os
import time

from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

QUEUE_URL = os.getenv("QUEUE_URL")

sqs = boto3.client("sqs")

dynamodb = boto3.resource("dynamodb")

table = dynamodb.Table("ProvisionRequests")

@app.post("/provision/s3")
def provision_s3(req: S3ProvisionRequest):
    request_id = str(uuid.uuid4())
    state_key = f"states/{request_id}.tfstate"
    
    if (
        req.bucket_type == "private"
        and req.cors_enabled
        and not req.allowed_origins
    ):
        raise HTTPException(
            status_code=400,
            detail="allowed_origins is required when CORS is enabled"
        )
    
    table.put_item(
        Item = {
            "requestId"      : request_id,
            "stateKey"       : state_key,
            "status"         : "PENDING",
            "bucketName"     : req.bucket_name,
            "versioning"     : req.versioning,
            "corsEnabled"    : req.cors_enabled,
            "allowedOrigins" : req.allowed_origins,
            "bucketType"     : req.bucket_type,
            "createdAt"      : int(time.time())
        }
    )
    
    sqs.send_message(
        QueueUrl = QUEUE_URL,
        MessageBody=json.dumps({
            "requestId"     : request_id,
            "stateKey"      : state_key,
            "bucketName"    : req.bucket_name,
            "versioning"    : req.versioning,
            "corsEnabled"   : req.cors_enabled,
            "allowedOrigins": req.allowed_origins,
            "bucketType"    : req.bucket_type
        })
    )
    
    return {
        "requestId": request_id,
        "status": "PENDING"
    }
    
@app.get("/status/{request_id}")
def get_status(request_id: str):

    response = table.get_item(
        Key={
            "requestId": request_id
        }
    )

    item = response.get("Item")

    if not item:
        return {
            "error": "Request not found"
        }

    return item

@app.get("/requests")
def get_requests():

    response = table.scan()

    items = response.get("Items", [])

    items.sort(
        key=lambda x: x.get("createdAt", 0),
        reverse=True
    )

    return {
        "count": len(items),
        "requests": items
    }

@app.get("/stats")
def get_stats():

    response = table.scan()

    items = response.get("Items", [])

    return {
        "total": len(items),
        "pending": len([
            x for x in items
            if x["status"] == "PENDING"
        ]),
        "processing": len([
            x for x in items
            if x["status"] == "PROCESSING"
        ]),
        "completed": len([
            x for x in items
            if x["status"] == "COMPLETED"
        ]),
        "failed": len([
            x for x in items
            if x["status"] == "FAILED"
        ])
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }