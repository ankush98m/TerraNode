resource "aws_iam_role" "cloudwatch_role" {
  name = "CloudWatchAgentRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Effect = "Allow"
        Sid    = ""
      },
    ]
  })
}

resource "aws_iam_policy" "cloudwatch_policy" {
  name        = "CloudWatchAgentPolicy"
  description = "CloudWatch Agent Policy for EC2"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "cloudwatch:PutMetricData",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListAllMyBuckets"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cloudwatch_attach" {
  policy_arn = aws_iam_policy.cloudwatch_policy.arn
  role       = aws_iam_role.cloudwatch_role.name
}

# Instance profile to attach to EC2 instance
resource "aws_iam_instance_profile" "cloudwatch_instance_profile" {
  name = "CloudWatchInstanceProfile"
  role = aws_iam_role.cloudwatch_role.name
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name               = "lambda_email_verification_role"
  assume_role_policy = jsonencode({
    Version : "2012-10-17"
    Statement : [
      {
        Action    : "sts:AssumeRole"
        Effect    : "Allow"
        Principal : {
          Service : "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Lambda
resource "aws_iam_policy" "lambda_policy" {
  name = "lambda_email_verification_policy"
  policy = jsonencode({
    Version : "2012-10-17"
    Statement : [
      {
        Action   : [
          "sns:Publish",
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Effect   : "Allow"
        Resource : "*"
      },
      {
        Action   : [
          "rds:DescribeDBInstances",
          "rds:Connect"
        ]
        Effect   : "Allow"
        Resource : "*"
      },
      {
        Action   : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   : "Allow"
        Resource : "*"
      }
    ]
  })
}

# Attach Policy to IAM Role
resource "aws_iam_role_policy_attachment" "lambda_role_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}