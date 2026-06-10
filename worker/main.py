import json
import time

from services.dynamodb import update_status
from services.terraform import (
    generate_tfvars,
    run_terraform
)
from services.sqs import (
    receive_messages,
    delete_message
)


def process_message(message):
    body = json.loads(
        message["Body"]
    )

    request_id = body["requestId"]
    bucket_name = body["bucketName"]

    print("=" * 50)
    print("Received")
    print(body)

    try:
        update_status(
            request_id,
            "PROCESSING"
        )

        generate_tfvars(
            bucket_name
        )

        result = run_terraform()

        if result.returncode == 0:
            update_status(
                request_id,
                "COMPLETED"
            )

            delete_message(
                message["ReceiptHandle"]
            )

            print(
                "Terraform apply succeeded"
            )

        else:
            update_status(
                request_id,
                "FAILED",
                result.stderr
            )

            print(
                "Terraform apply failed"
            )

    except Exception as e:
        update_status(
            request_id,
            "FAILED",
            str(e)
        )

        print(
            "Worker Error:",
            str(e)
        )


def main():
    while True:
        messages = receive_messages()

        for message in messages:
            process_message(message)

        time.sleep(1)


if __name__ == "__main__":
    main()