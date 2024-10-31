# EC2 Instance
resource "aws_instance" "web_app_instance" {
  ami                         = var.custom_ami_id
  instance_type               = "t2.small"
  subnet_id                   = aws_subnet.public_subnets[0].id
  vpc_security_group_ids      = [aws_security_group.app_sg.id]
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.cloudwatch_instance_profile.name

  root_block_device {
    volume_size           = 25
    volume_type           = "gp2"
    delete_on_termination = true
  }

  # Pass the RDS instance configuration via user data
  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y postgresql-client

              PGPASSWORD="${var.db_password}" psql -h ${aws_db_instance.default.address} -U ${var.db_username} -p ${var.db_port} postgres <<-EOSQL
              CREATE DATABASE ${var.db_name};
              EOSQL

              echo DB_DATABSE=${var.db_name} >> /opt/webapp/app/.env
              echo DB_USER=${var.db_username} >> /opt/webapp/app/.env
              echo DB_PASSWORD=${var.db_password} >> /opt/webapp/app/.env
              echo DB_PORT=5432 >> /opt/webapp/app/.env
              echo DB_HOST=${aws_db_instance.default.address} >> /opt/webapp/app/.env

              # Passing S3 bucket name
              echo AWS_ACCESS_KEY_ID=${var.aws_access_key_id} >> /opt/webapp/app/.env
              echo AWS_SECRET_ACCESS_KEY=${var.aws_secret_access_key} >> /opt/webapp/app/.env
              echo AWS_REGION=${var.region} >> /opt/webapp/app/.env
              echo S3_BUCKET_NAME=${aws_s3_bucket.profile_pics.bucket} >> /opt/webapp/app/.env
              echo SENDGRID_API_KEY=${var.sendgrid_api_key} >> /opt/webapp/app/.env
              echo SENDER_EMAIL=${var.sender_email} >> /opt/webapp/app/.env

              sudo systemctl start webapp.service
              sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
              -a fetch-config \
              -m ec2 \
              -c file:/opt/aws/amazon-cloudwatch-agent/bin/cloudwatch-config.json \
              -s
              EOF

  tags = {
    Name = "Web Application Instance"
  }
}
