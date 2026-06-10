from fastapi import FastAPI
from models import S3ProvisionRequest

import boto3
import uuid
import json
import os

from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

QUEUE_URL = os.getenv("QUEUE_URL")

sqs = boto3.client("sqs")

dynamodb = boto3.resource("dynamodb")

table = dynamodb.Table("ProvisionRequests")

@app.post("/provision/s3")
def provision_s3(req: S3ProvisionRequest):
    request_id = str(uuid.uuid4())
    
    table.put_item(
        Item = {
            "requestId": request_id,
            "status": "PENDING",
            "bucketName": req.bucket_name
        }
    )
    
    sqs.send_message(
        QueueUrl = QUEUE_URL,
        MessageBody = json.dumps({
            "requestId": request_id,
            "type": "s3",
            "bucketName": req.bucket_name
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