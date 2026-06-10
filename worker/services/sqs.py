import boto3

from config import QUEUE_URL

sqs = boto3.client("sqs")


def receive_messages():
    response = sqs.receive_message(
        QueueUrl=QUEUE_URL,
        MaxNumberOfMessages=1,
        WaitTimeSeconds=20
    )

    return response.get(
        "Messages",
        []
    )


def delete_message(receipt_handle):
    sqs.delete_message(
        QueueUrl=QUEUE_URL,
        ReceiptHandle=receipt_handle
    )