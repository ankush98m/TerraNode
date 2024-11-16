# Create Lambda Function
resource "aws_lambda_function" "email_verification_lambda" {
  function_name = "email-verification-lambda"
  runtime       = "nodejs18.x" # Replace with your runtime
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler" # Ensure your code has this entry point

  # Lambda deployment package
  filename         = "lambda.zip" # Replace with your zipped Lambda code
  source_code_hash = filebase64sha256("lambda.zip")

  # Environment variables
  environment {
    variables = {
      RDS_HOST          = "your-rds-host"
      DB_NAME           = "your-db-name"
      DB_USER           = "your-db-user"
      DB_PASSWORD       = "your-db-password"
      EMAIL_FROM        = "your-email@example.com"
      SNS_TOPIC_ARN     = aws_sns_topic.email_verification_topic.arn
    }
  }

  # Timeout and memory size
  timeout      = 30
  memory_size  = 128
}

# SNS Trigger to Lambda Function
resource "aws_lambda_event_source_mapping" "sns_lambda_trigger" {
  event_source_arn = aws_sns_topic.email_verification_topic.arn
  function_name    = aws_lambda_function.email_verification_lambda.arn
  enabled          = true
}