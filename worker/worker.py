
"""

import boto3
import json
import time
import os
import subprocess

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
    
        try:
            # Mark PROCESSING
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
            
            bucket_name = body["bucketName"]
            
            # Generate tfvars
            with open(
                "../terraform/environments/dev/terraform.tfvars",
                "w"
            ) as f:
                f.write(
                    f'bucket_name="{bucket_name}"'
                )
            
            print("terraform.tfvars generated")
            
            # Terraform Apply
            result = subprocess.run(
                [
                    "terraform",
                    "apply",
                    "-auto-approve",
                    "-var-file=terraform.tfvars"
                ],
                cwd = "../terraform/environments/dev",
                capture_output = True,
                text = True
            )
            
            #Success
            if result.returncode == 0:
                print("Terraform apply succeeded")
                
                table.update_item(
                    Key = {
                        "requestId": body["requestId"]
                    },
                    UpdateExpression = "SET #s = :s",
                    ExpressionAttributeNames = {
                        "#s": "status"
                    },
                    ExpressionAttributeValues = {
                        ":s": "COMPLETED"
                    }
                )
                # Delete message only after success
                sqs.delete_message(
                    QueueUrl=QUEUE_URL,
                    ReceiptHandle=message["ReceiptHandle"]
                )
            else:
                print("Terraform apply failed")
                print(result.stderr)
                
                table.update_item(
                    Key = {
                        "requestId": body["requestId"]
                    },
                    UpdateExpression = "SET #s = :s, #e = :e",
                    ExpressionAttributeNames = {
                        "#s": "status",
                        "#e": "error"
                    },
                    ExpressionAttributeValues = {
                        ":s": "FAILED",
                        ":e": result.stderr
                    }
                )   
        except Exception as e:
            print("Worker Error:", str(e))

            table.update_item(
                Key={
                    "requestId": body["requestId"]
                },
                UpdateExpression="SET #s = :s, #e = :e",
                ExpressionAttributeNames={
                    "#s": "status",
                    "#e": "error"
                },
                ExpressionAttributeValues={
                    ":s": "FAILED",
                    ":e": str(e)
                }
            )
    time.sleep(1)
    
"""