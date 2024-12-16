resource "aws_db_subnet_group" "main" {
  name       = "csye6225-db-subnet-group"
  subnet_ids = aws_subnet.private_subnets[*].id

  tags = {
    Name = "CSYE6225-DB-Subnet-Group"
  }
}
