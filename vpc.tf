resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr_block
  enable_dns_support   = true  # Add this
  enable_dns_hostnames = true  # Add this

  tags = {
    Name = "CSYE6225-VPC"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "CSYE6225-IGW"
  }
}
