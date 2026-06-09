import boto3
import json
import time
import os

from dotenv import load_dotenv

load_dotenv()

QUEUE_URL = os.getenv("QUEUE_URL")

dynamodb = boto3.resource("dynamodb")

table = dynamodb.Table("ProvisionRequests")

sqs = boto3.client("sqs")

while True:
    response = sqs.receive_message(
        QueueUrl=QUEUE_URL,
        MaxNumberOfMessages=1,
        WaitTimeSeconds=20
    )
    
    messages = response.get("Messages", [])
    
    for message in messages:
        body = json.loads(message["Body"])
        
        print("=" * 50)
        print("Received")
        print(body)
        
        table.update_item(
            Key = {
                "requestId": body["requestId"]
            },
            UpdateExpression = "SET #s = :s",
            ExpressionAttributeNames = {
                "#s": "status"
            },
            ExpressionAttributeValues = {
                ":s": "PROCESSING"
            }
        )
        
        print("Updated status -> PROCESSING")
        
        sqs.delete_message(
            QueueUrl=QUEUE_URL,
            ReceiptHandle=message["ReceiptHandle"]
        )
    time.sleep(1)