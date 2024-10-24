resource "aws_db_instance" "default" {
  # Basic configurations for the RDS instance
  allocated_storage      = 20            # Size of the storage (GB)
  instance_class         = "db.t3.micro" # Change as per your requirements
  engine                 = "postgres"
  engine_version         = "13.11"         # Adjust according to your version
  username               = var.db_username # Username
  password               = var.db_password # Password
  port                   = 5432
  publicly_accessible    = false                          # Ensures that the RDS instance is not publicly accessible
  db_subnet_group_name   = aws_db_subnet_group.main.name  # Reference to the subnet group in private subnet
  vpc_security_group_ids = [aws_security_group.rds_sg.id] # Security group for RDS

  # Specify the custom parameter group
  parameter_group_name = aws_db_parameter_group.custom_pg.name

  # Storage options
  storage_type        = "gp2"
  skip_final_snapshot = true # Skip the final snapshot when the DB is deleted

  # Tags
  tags = {
    Name = "CSYE6225-RDS-Instance"
  }
}