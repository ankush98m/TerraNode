# tf-aws-infra
This repository contains Terraform configuration files for provisioning and managing infrastructure resources on aws cloud platform

## Prerequisites
- Terraform (version 1.9.7 or similar)
- AWS CLI
- import SSL certificates for demo account
- Command to import certificate:-
aws acm import-certificate --certificate fileb://path/to/demo.ankushm.me.crt  --private-key fileb:C:/path/to/private_key.key  --certificate-chain fileb:C:/path/to/demo.ankushm.me.ca-bundle

## How to run
- Clone the repositry
- Navigate to the repository
- Open AWS CLI and initialize the Terraform working directory (Run Terraform init)
- Review the execution plan (Run Terraform Plan)
- Apply the terraform configuration (Run Terraform Apply)