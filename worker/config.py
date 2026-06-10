import os

from dotenv import load_dotenv

load_dotenv()

QUEUE_URL = os.getenv("QUEUE_URL")

TABLE_NAME = "ProvisionRequests"

TERRAFORM_DIR = "../terraform/environments/dev"

TFVARS_FILE = (
    "../terraform/environments/dev/terraform.tfvars"
)