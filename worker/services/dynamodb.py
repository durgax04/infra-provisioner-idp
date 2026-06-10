import boto3

from config import TABLE_NAME

dynamodb = boto3.resource("dynamodb")

table = dynamodb.Table(TABLE_NAME)


def update_status(
    request_id: str,
    status: str,
    error: str | None = None
):
    if error:
        table.update_item(
            Key={
                "requestId": request_id
            },
            UpdateExpression="""
                SET #s = :s,
                    #e = :e
            """,
            ExpressionAttributeNames={
                "#s": "status",
                "#e": "error"
            },
            ExpressionAttributeValues={
                ":s": status,
                ":e": error
            }
        )
    else:
        table.update_item(
            Key={
                "requestId": request_id
            },
            UpdateExpression="""
                SET #s = :s
            """,
            ExpressionAttributeNames={
                "#s": "status"
            },
            ExpressionAttributeValues={
                ":s": status
            }
        )