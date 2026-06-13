import json
import time
import os

from services.dynamodb import update_status
from services.terraform import (
    generate_tfvars,
    run_terraform,
    terraform_init
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
    state_key = body["stateKey"]

    print("=" * 50)
    print("Received")
    print(body)

    try:
        update_status(
            request_id,
            "PROCESSING"
        )

        init_result = terraform_init(
            state_key
        )

        if init_result.returncode != 0:
            raise Exception(
                init_result.stderr
            )
        print("Terraform initialized")
        result = tfapply(body)  

        if result.returncode == 0:
            
            update_status(
                request_id,
                "COMPLETED"
            )

            print(
                "Terraform apply succeeded."
            )

        else:
            update_status(
                request_id,
                "FAILED",
                result.stderr
            )

            print(
                "Terraform apply failed."
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
    finally:
        delete_message(
            message["ReceiptHandle"]
        )

def tfapply(payload):
    tfvars_file = generate_tfvars(payload)

    try:
        return run_terraform(tfvars_file)

    finally:
        if os.path.exists(tfvars_file):
            os.remove(tfvars_file)


def main():

    print("Worker started...")

    while True:
        messages = receive_messages()

        for message in messages:
            process_message(message)

        time.sleep(1)


if __name__ == "__main__":
    main()