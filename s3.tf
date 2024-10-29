resource "aws_s3_bucket" "profile_pics" {
  bucket = "profile-pics-${random_uuid.bucket_uuid.result}"
  acl    = "private"

  lifecycle_rule {
    enabled = true
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "random_uuid" "bucket_uuid" {}
