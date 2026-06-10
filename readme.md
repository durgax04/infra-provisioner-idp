# Infrastructure Provisioning Platform (Service Broker)

A lightweight Internal Developer Platform (IDP) that enables users to provision cloud infrastructure through an API-driven workflow.

## Architecture

```text
Client
   |
   v
FastAPI
   |
   v
SQS Queue
   |
   v
Worker
   |
   +--> s3
   +--> AWS API Calls
   |
   v
DynamoDB
```

## Overview

This platform follows an asynchronous provisioning model.

1. A client submits a provisioning request (e.g., create a s3).
2. FastAPI receives the request and stores metadata in DynamoDB.
3. The request is pushed to Amazon SQS.
4. A worker service consumes messages from the queue.
5. The worker executes the provisioning task using Terraform or AWS APIs.
6. Provisioning status is updated in DynamoDB.
7. Clients can query the status of their requests through the API.

## Components

### FastAPI

- Exposes REST APIs for infrastructure requests.
- Validates user input.
- Creates provisioning records.
- Pushes jobs to SQS.
- Reads provisioning status from DynamoDB.

### Amazon SQS

- Decouples API requests from infrastructure execution.
- Provides reliable message delivery.
- Enables horizontal scaling of workers.

### Worker Service

- Consumes provisioning tasks from SQS.
- Executes infrastructure operations.
- Interacts with AWS services and Terraform.
- Updates request status in DynamoDB.

### DynamoDB

Stores provisioning metadata:

- Request ID
- Resource type
- User information
- Current status
- Error messages
- Timestamps

### Provisioning Tasks

Examples of supported resources:

- S3 Buckets


## Provisioning Workflow

```text
Client Request
      |
      v
 FastAPI API
      |
      v
  DynamoDB (Status: PENDING)
      |
      v
      SQS
      |
      v
    Worker
      |
      v
Terraform / AWS APIs
      |
      v
 DynamoDB (Status: COMPLETED / FAILED)
```

## Benefits

- Asynchronous processing
- Scalable worker architecture
- Reliable message delivery
- Infrastructure automation
- Auditability through DynamoDB
- Easy integration with Terraform and AWS services

## Future Enhancements

- Approval workflows
- Multi-tenant support
- User authentication and authorization
- Resource deletion workflows
- Cost estimation
- Drift detection
- Self-service developer portal

## Tech Stack

- FastAPI
- Python
- Amazon SQS
- Amazon DynamoDB
- Terraform
- AWS SDK (Boto3)
- AWS Services (S3, Route53, CloudFront, etc.)

## Goal

Provide a self-service platform where developers can provision cloud resources through APIs without directly accessing AWS accounts, while maintaining governance, scalability, and operational control.