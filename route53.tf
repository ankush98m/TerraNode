# Route 53 A record pointing to the EC2 instance
resource "aws_route53_record" "app_record" {
  zone_id = var.route53_zone_id
  name    = "dev.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.web_app_lb.dns_name
    zone_id                = aws_lb.web_app_lb.zone_id
    evaluate_target_health = true
  }
}
