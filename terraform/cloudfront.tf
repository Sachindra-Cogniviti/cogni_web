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
  managed_all_viewer_except_host_id   = "b684b0a8-5e13-4b33-8221-5a3602ac2a11"
}

# Custom Origin Request Policy for Default Next.js routes
resource "aws_cloudfront_origin_request_policy" "nextjs" {
  name    = "${var.project_name}-nextjs-origin-request"
  comment = "Forwards viewer headers and cookies to Next.js while allowing CloudFront host"

  cookies_config {
    cookie_behavior = "all"
  }

  headers_config {
    header_behavior = "whitelist"
    headers {
      items = [
        "Accept",
        "Accept-Language",
        "Authorization",
        "User-Agent",
        "Referer",
        "x-forwarded-host",

      ]
    }
  }

  query_strings_config {
    query_string_behavior = "all"
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cdn" {
  depends_on = [aws_cloudfront_origin_request_policy.nextjs]
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} CloudFront CDN"
  price_class         = "PriceClass_100"
  web_acl_id          = var.enable_waf ? aws_wafv2_web_acl.cf_waf[0].arn : null

  # Origin 1: Application Load Balancer (Next.js App)
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALBOrigin"

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
    origin_request_policy_id = aws_cloudfront_origin_request_policy.nextjs.id
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
    origin_request_policy_id = aws_cloudfront_origin_request_policy.nextjs.id
    compress                 = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Default CloudFront Certificate (*.cloudfront.net)
  # When you get your custom domain, swap this to an ACM certificate!
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.project_name}-cloudfront"
  }
}
