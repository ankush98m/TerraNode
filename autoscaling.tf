resource "aws_autoscaling_group" "web_app_asg" {
  launch_template {
    id      = aws_launch_template.csye6225_asg_template.id
    version = "$Latest"
  }

  min_size         = 3
  max_size         = 5
  desired_capacity = 3
  vpc_zone_identifier = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  tag {
    key                 = "Name"
    value               = "AutoScalingWebAppInstance"
    propagate_at_launch = true
  }
}
