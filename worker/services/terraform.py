import subprocess

from config import (
    TERRAFORM_DIR,
    TFVARS_FILE
)


def generate_tfvars(bucket_name: str):
    with open(TFVARS_FILE, "w") as f:
        f.write(
            f'bucket_name="{bucket_name}"'
        )


def run_terraform():
    return subprocess.run(
        [
            "terraform",
            "apply",
            "-auto-approve",
            "-var-file=terraform.tfvars"
        ],
        cwd=TERRAFORM_DIR,
        capture_output=True,
        text=True
    )