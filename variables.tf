variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr_blocks" {
  description = "CIDR blocks for the public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidr_blocks" {
  description = "CIDR blocks for the private subnets"
  type        = list(string)
  default     = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]
}

variable "availability_zones" {
  description = "Availability zones for subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "custom_ami_id" {
  description = "AMI Id created by packer"
  type        = string
  default     = "ami-010f692e1b8fe9582"
}

variable "db_port" {
  description = "The port on which the database is listening"
  type        = number
  default     = 5432
}

variable "db_engine" {
  description = "The database engine (e.g., mysql, postgres)"
  type        = string
  default     = "postgres"
}

variable "db_name" {
  description = "The name of the database"
  type        = string
  default     = "csye6225"
}

variable "db_username" {
  description = "The master username for the database"
  type        = string
  default     = "csye6225"
}

variable "db_password" {
  description = "The master password for the database"
  type        = string
  sensitive   = true
  default     = "SESdept!7829"
}