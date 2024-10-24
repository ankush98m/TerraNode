# EC2 Instance
resource "aws_instance" "web_app_instance" {
  ami                         = var.custom_ami_id
  instance_type               = "t2.small"
  subnet_id                   = aws_subnet.public_subnets[0].id
  vpc_security_group_ids      = [aws_security_group.app_sg.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 25
    volume_type           = "gp2"
    delete_on_termination = true
  }

  # Pass the RDS instance configuration via user data
  user_data = <<-EOF
              #!/bin/bash
              
              cd /opt/webapp/app

              # Setup environment variables for PostgreSQL database
              echo "DB_HOST=$echo ${aws_db_instance.default.endpoint}" >> .env
              echo "DB_PORT=${var.db_port}" >> .env
              echo "DB_USER=csye6225" >> .env
              echo "DB_PASSWORD=${var.db_password}" >> .env
              echo "DB_DATABASE=${var.db_name}" >> .env

              node app.js
              EOF

  tags = {
    Name = "Web Application Instance"
  }
}
