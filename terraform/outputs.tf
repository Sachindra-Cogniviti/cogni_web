output "cloudfront_domain_name" {
  description = "The HTTPS URL to access the website via CloudFront CDN right now"
  value       = "https://${aws_cloudfront_distribution.cdn.domain_name}"
}

output "ecr_repository_url" {
  description = "ECR Repository URL for pushing Docker images"
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  description = "ECS Cluster Name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS Service Name"
  value       = aws_ecs_service.app.name
}

output "rds_endpoint" {
  description = "RDS PostgreSQL Host Endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "s3_bucket_name" {
  description = "S3 Bucket Name for media files"
  value       = aws_s3_bucket.media.id
}
