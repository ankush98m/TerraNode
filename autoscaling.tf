resource "aws_autoscaling_group" "web_app_asg" {
  launch_template {
    id      = aws_launch_template.csye6225_asg_template.id
    version = "$Latest"
  }

  min_size            = 3
  max_size            = 5
  desired_capacity    = 3
  vpc_zone_identifier = aws_subnet.public_subnets[*].id # Fetch all public subnet IDs
  target_group_arns   = [aws_lb_target_group.web_app_tg.arn]

  tag {
    key                 = "Name"
    value               = "AutoScalingWebAppInstance"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_policy" "scale_up" {
  name                   = "scale_up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  autoscaling_group_name = aws_autoscaling_group.web_app_asg.name

  metric_aggregation_type = "Average"
}

resource "aws_autoscaling_policy" "scale_down" {
  name                   = "scale_down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 60
  autoscaling_group_name = aws_autoscaling_group.web_app_asg.name

  metric_aggregation_type = "Average"
}
