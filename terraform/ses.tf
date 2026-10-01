# ─────────────────────────────────────────────────────────────────────────────
# Amazon SES – domain identity + DKIM + SMTP credentials for the ECS task
# ─────────────────────────────────────────────────────────────────────────────

# ── 1. Domain identity ────────────────────────────────────────────────────────
resource "aws_ses_domain_identity" "main" {
  domain = var.ses_domain
}

# ── 2. DKIM (puts three CNAME records in the domain's DNS) ───────────────────
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# ── 3. MAIL FROM sub-domain (improves deliverability / SPF alignment) ─────────
resource "aws_ses_domain_mail_from" "main" {
  domain           = aws_ses_domain_identity.main.domain
  mail_from_domain = "mail.${var.ses_domain}"
}

# ── 4. SMTP IAM user (ECS task uses these long-lived SMTP credentials) ────────
resource "aws_iam_user" "ses_smtp" {
  name = "${var.project_name}-ses-smtp"
  tags = { Name = "${var.project_name}-ses-smtp" }
}

resource "aws_iam_user_policy" "ses_smtp_send" {
  name = "${var.project_name}-ses-smtp-send"
  user = aws_iam_user.ses_smtp.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ses:SendEmail", "ses:SendRawEmail"]
      Resource = "*"
      Condition = {
        StringEquals = {
          "ses:FromAddress" = var.email_from
        }
      }
    }]
  })
}

resource "aws_iam_access_key" "ses_smtp" {
  user = aws_iam_user.ses_smtp.name
}

# ─────────────────────────────────────────────────────────────────────────────
# Outputs – needed to configure DNS and the ECS task's environment
# ─────────────────────────────────────────────────────────────────────────────

output "ses_domain_verification_token" {
  description = "Add this as a TXT record: _amazonses.<domain> IN TXT <value>"
  value       = aws_ses_domain_identity.main.verification_token
}

output "ses_dkim_cname_records" {
  description = "Add these three CNAME records to your DNS to enable DKIM"
  value = [
    for token in aws_ses_domain_dkim.main.dkim_tokens :
    "${token}._domainkey.${var.ses_domain} → ${token}.dkim.amazonses.com"
  ]
}

output "ses_mail_from_mx_record" {
  description = "MX record required for MAIL FROM sub-domain"
  value       = "mail.${var.ses_domain} MX 10 feedback-smtp.${var.aws_region}.amazonses.com"
}

output "ses_mail_from_spf_record" {
  description = "SPF TXT record required for MAIL FROM sub-domain"
  value       = "mail.${var.ses_domain} TXT \"v=spf1 include:amazonses.com ~all\""
}

output "ses_smtp_username" {
  description = "SES SMTP username (set as SES_SMTP_USERNAME in ECS task env)"
  value       = aws_iam_access_key.ses_smtp.id
}

output "ses_smtp_password" {
  description = "SES SMTP password – derived from the IAM secret key (set as SES_SMTP_PASSWORD)"
  value       = aws_iam_access_key.ses_smtp.ses_smtp_password_v4
  sensitive   = true
}
