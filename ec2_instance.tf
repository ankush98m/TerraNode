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
              # Install PostgreSQL client
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
              sudo systemctl start webapp.service
              sudo 
              EOF

  tags = {
    Name = "Web Application Instance"
  }
}
