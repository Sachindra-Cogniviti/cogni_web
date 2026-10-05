# CloudFront Origin Access Control (OAC) for S3
resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name                              = "${var.project_name}-s3-oac"
  description                       = "OAC for S3 media bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# AWS Managed Cache & Origin Request Policy IDs
locals {
  managed_caching_optimized_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  managed_caching_disabled_id         = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  managed_all_viewer_except_host_id   = "b689b0a8-53d0-40ab-baf2-68738e2966ac"
}

data "aws_ssm_parameter" "cloudfront_origin_secret" {
  name            = "/cogni-web/cloudfront-origin-secret"
  with_decryption = true
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} CloudFront CDN"
  aliases             = ["cognivitilabs.com", "www.cognivitilabs.com"]
  price_class         = "PriceClass_100"
  web_acl_id          = var.enable_waf ? aws_wafv2_web_acl.cf_waf[0].arn : null

  # Origin 1: Application Load Balancer (Next.js App)
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALBOrigin"

    custom_header {
      name  = "X-Cogni-Origin-Verify"
      value = data.aws_ssm_parameter.cloudfront_origin_secret.value
    }

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Origin 2: S3 Media Bucket
  origin {
    domain_name              = aws_s3_bucket.media.bucket_regional_domain_name
    origin_id                = "S3MediaOrigin"
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
  }

  # Default Cache Behavior -> ALB
  default_cache_behavior {
    target_origin_id       = "ALBOrigin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods  = ["GET", "HEAD", "OPTIONS"]

    cache_policy_id          = local.managed_caching_disabled_id
    origin_request_policy_id = local.managed_all_viewer_except_host_id

    compress = true
  }

  # Behavior: /media/* -> S3 Media
  ordered_cache_behavior {
    path_pattern           = "/media/*"
    target_origin_id       = "S3MediaOrigin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]

    cache_policy_id = local.managed_caching_optimized_id
    compress        = true
  }

  # Behavior: /_next/static/* -> ALB (Cached for 1 year)
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    target_origin_id       = "ALBOrigin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]

    cache_policy_id = local.managed_caching_optimized_id
    compress        = true
  }

  # Behavior: /api/* -> ALB (Dynamic, No Cache)
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "ALBOrigin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods  = ["GET", "HEAD"]

    cache_policy_id          = local.managed_caching_disabled_id
    # Next Server Actions send framework headers such as Next-Action and
    # Next-Router-State-Tree. Forward all viewer headers, cookies and query
    # strings so Payload's admin login and authenticated navigation survive
    # the CDN hop. The managed policy omits Host so the ALB gets its own host.
    origin_request_policy_id = local.managed_all_viewer_except_host_id
    compress                 = true
  }

  # Behavior: /admin* -> ALB (Payload CMS Admin, Dynamic, No Cache)
  ordered_cache_behavior {
    path_pattern           = "/admin*"
    target_origin_id       = "ALBOrigin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods  = ["GET", "HEAD"]

    cache_policy_id          = local.managed_caching_disabled_id
    origin_request_policy_id = local.managed_all_viewer_except_host_id
    compress                 = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # DNS-validated custom-domain certificate in us-east-1.
  viewer_certificate {
    acm_certificate_arn      = "arn:aws:acm:us-east-1:044575975227:certificate/c13e0d11-0d38-4aa7-9af8-d3005f8df865"
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.project_name}-cloudfront"
  }
}
