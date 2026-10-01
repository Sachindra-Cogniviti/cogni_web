variable "aws_region" {
  description = "The AWS region to deploy infrastructure into (Singapore)"
  type        = string
  default     = "ap-southeast-1"
}

variable "enable_waf" {
  description = "Whether to attach AWS WAFv2 Web ACL to CloudFront"
  type        = bool
  default     = true
}

variable "environment" {
  description = "Deployment environment name (e.g. staging, prod)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Prefix for all resource names"
  type        = string
  default     = "cogni-web"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "app_count" {
  description = "Number of ECS Fargate tasks to run"
  type        = number
  default     = 2
}

variable "fargate_cpu" {
  description = "Fargate CPU units (256, 512, 1024, 2048)"
  type        = number
  default     = 512
}

variable "fargate_memory" {
  description = "Fargate RAM in MB (512, 1024, 2048, 4096)"
  type        = number
  default     = 1024
}

variable "container_port" {
  description = "Port exposed by the Docker container"
  type        = number
  default     = 3000
}

variable "db_name" {
  description = "Name of the Postgres database"
  type        = string
  default     = "cognidb"
}

variable "db_username" {
  description = "Master username for Postgres"
  type        = string
  default     = "cogniadmin"
}

variable "db_password" {
  description = "Master password for Postgres database (minimum 8 chars)"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.small"
}

variable "payload_secret" {
  description = "Payload CMS signing secret key"
  type        = string
  sensitive   = true
}

variable "ses_domain" {
  description = "Domain to verify in SES (e.g. cognivitilabs.com)"
  type        = string
  default     = "cognivitilabs.com"
}

variable "ses_smtp_username" {
  description = "SES SMTP username (IAM access key ID from ses.tf output)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "ses_smtp_password" {
  description = "SES SMTP password (derived from IAM secret key via ses.tf output)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "email_from" {
  description = "Default sender email — must be on the SES-verified domain"
  type        = string
  default     = "no-reply@cognivitilabs.com"
}
