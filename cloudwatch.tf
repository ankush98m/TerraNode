resource "aws_cloudwatch_log_group" "csye6225" {
  name              = "csye6225"
  retention_in_days = 7 # Set retention period, adjust as needed
}