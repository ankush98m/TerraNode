# Introduction
This a a cloud based web application hosted on AWS using Terraform. The web application is developed using Node.js. The Key features of this application includes:-
- The application is running on EC2 instance
- RDS is connected to EC2 and postgres engine is hosted in RDS
- S3 bucket is used to profile images of the user
- EC2 instances are scaled up & down using autoscaling group
- API load is balanced using load balancers
- All the API's are logged in cloudwatch and alarms are also setup to trigger autoscaling
- An email verification is sent on account creation using pub/sub by triggering the lambda function
- SSL certificate is issued to secure the URL and all the resources are encrypted using keys which are managed in KMS

![projectFlowDiagram](https://github.com/user-attachments/assets/edb41cfc-1e6c-40e2-b6c9-1f14c4d6b4e6)
