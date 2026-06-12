import subprocess
import json
from .s3 import build_tfvars

TERRAFORM_DIR = "./terraform/environments/dev"

# print(TERRAFORM_DIR)
def terraform_init():
    return subprocess.run(
        [
            "terraform",
            "init",
            "-reconfigure"
        ],
        cwd=TERRAFORM_DIR,
        capture_output=True,
        text=True
    )
def generate_tfvars(payload):
    request_id = payload["requestId"]
    
    tfvars_file = f"/tmp/{request_id}.tfvars.json"
    
    # Build tfvars data
    data = build_tfvars(payload)
    
    with open(tfvars_file, "w") as f:
        json.dump(data, f, indent=2)
    
    return tfvars_file

def run_terraform(tfvars_file):
    return subprocess.run(
        [
            "terraform",
            "apply",
            "-auto-approve",
            f"-var-file={tfvars_file}"
        ],
        cwd=TERRAFORM_DIR,
        capture_output=True,
        text=True
    )