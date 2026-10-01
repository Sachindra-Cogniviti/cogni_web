terraform {
  required_version = ">= 1.5.0"

  # Remote State in Singapore S3 + DynamoDB State Lock
  backend "s3" {
    bucket         = "aos-tfstate-prod"
    key            = "cogni-web/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "aos-tflock"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

# Primary AWS Provider in Singapore (ap-southeast-1)
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# CloudFront, ACM, and CloudFront-scoped WAF must be in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
