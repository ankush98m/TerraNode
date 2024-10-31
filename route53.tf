# Route 53 A record pointing to the EC2 instance
resource "aws_route53_record" "app_a_record" {
  zone_id = "Z03702998MDHATXO43N6"
  name    = "${var.subdomain}.${var.domain}"
  type    = "A"
  ttl     = 300

  # Using the public IP of the EC2 instance
  records = [aws_instance.web_app_instance.public_ip]
}