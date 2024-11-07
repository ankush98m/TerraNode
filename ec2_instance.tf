resource "aws_launch_template" "csye6225_asg_template" {
  name          = "csye6225_asg"
  image_id      = var.custom_ami_id
  instance_type = "t2.micro"
  key_name      = var.key_name

  iam_instance_profile {
    name = aws_iam_instance_profile.cloudwatch_instance_profile.name
  }

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.app_sg.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y postgresql-client

              PGPASSWORD="${var.db_password}" psql -h ${aws_db_instance.default.address} -U ${var.db_username} -p ${var.db_port} postgres <<-EOSQL
              CREATE DATABASE ${var.db_name};
              EOSQL

              echo DB_DATABASE=${var.db_name} >> /opt/webapp/app/.env
              echo DB_USER=${var.db_username} >> /opt/webapp/app/.env
              echo DB_PASSWORD=${var.db_password} >> /opt/webapp/app/.env
              echo DB_PORT=5432 >> /opt/webapp/app/.env
              echo DB_HOST=${aws_db_instance.default.address} >> /opt/webapp/app/.env

              # Passing S3 bucket name
              echo AWS_REGION=${var.region} >> /opt/webapp/app/.env
              echo S3_BUCKET_NAME=${aws_s3_bucket.profile_pics.bucket} >> /opt/webapp/app/.env
              echo SENDGRID_API_KEY=${var.sendgrid_api_key} >> /opt/webapp/app/.env
              echo SENDER_EMAIL=${var.sender_email} >> /opt/webapp/app/.env

              sudo systemctl enable webapp.service
              sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
              -a fetch-config \
              -m ec2 \
              -c file:/opt/aws/amazon-cloudwatch-agent/bin/cloudwatch-config.json \
              -s

              sudo systemctl daemon-reload  # Reload the service configuration
              sudo systemctl restart webapp.service  # Restart the service
              EOF
  )

  tags = {
    Name = "Web Application Instance"
  }
}
