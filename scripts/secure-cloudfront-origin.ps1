param([ValidateSet('Prepare', 'Enforce')][string]$Phase = 'Prepare')
$ErrorActionPreference = 'Stop'
$awsCli = Join-Path $env:LOCALAPPDATA 'Programs/Amazon/AWSCLIV2/aws.exe'
$region = 'ap-southeast-1'
$listener = 'arn:aws:elasticloadbalancing:ap-southeast-1:044575975227:listener/app/cogni-web-alb/8062801a00b3573b/7645769af928e830'
$target = 'arn:aws:elasticloadbalancing:ap-southeast-1:044575975227:targetgroup/cogni-web-tg/71619648312ce9be'
$parameter = '/cogni-web/cloudfront-origin-secret'

function Invoke-AwsJson([string[]]$CliArgs) {
  $reply = & $awsCli @CliArgs
  if ($LASTEXITCODE -ne 0) { throw "AWS operation failed: $($CliArgs[0]) $($CliArgs[1])" }
  if ($reply) { return ($reply -join "`n" | ConvertFrom-Json) }
}

function Invoke-AwsInput([string[]]$CliArgs, $InputObject) {
  $inputFile = [System.IO.Path]::GetTempFileName()
  try {
    $InputObject | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $inputFile -Encoding utf8
    return Invoke-AwsJson ($CliArgs + @('--cli-input-json', "file://$inputFile", '--output', 'json'))
  } finally { Remove-Item -LiteralPath $inputFile -ErrorAction SilentlyContinue }
}

if ($Phase -eq 'Prepare') {
  $metadata = Invoke-AwsJson @('ssm','describe-parameters','--parameter-filters',"Key=Name,Values=$parameter",'--region',$region,'--output','json')
  if ($metadata.Parameters.Count -eq 0) {
    $secret = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    $null = Invoke-AwsInput @('ssm','put-parameter','--region',$region) @{Name=$parameter;Type='SecureString';Value=$secret;Description='Private CloudFront to ALB origin verification header'}
  } else {
    $reply = Invoke-AwsJson @('ssm','get-parameter','--name',$parameter,'--with-decryption','--region',$region,'--output','json')
    $secret = $reply.Parameter.Value
  }
  $distribution = Invoke-AwsJson @('cloudfront','get-distribution-config','--id','E32QJWHDNI7D6K','--output','json')
  $origin = $distribution.DistributionConfig.Origins.Items | Where-Object {$_.Id -eq 'ALBOrigin'}
  $headers = @($origin.CustomHeaders.Items | Where-Object {$_ -and $_.HeaderName -ne 'X-Cogni-Origin-Verify'})
  $headers += [PSCustomObject]@{HeaderName='X-Cogni-Origin-Verify';HeaderValue=$secret}
  $origin.CustomHeaders = [PSCustomObject]@{Quantity=$headers.Count;Items=$headers}
  $null = Invoke-AwsInput @('cloudfront','update-distribution') @{Id='E32QJWHDNI7D6K';IfMatch=$distribution.ETag;DistributionConfig=$distribution.DistributionConfig}

  $rules = Invoke-AwsJson @('elbv2','describe-rules','--listener-arn',$listener,'--region',$region,'--output','json')
  if (-not ($rules.Rules | Where-Object {$_.Priority -eq '10'})) {
    $null = Invoke-AwsInput @('elbv2','create-rule','--region',$region) @{ListenerArn=$listener;Priority=10;Conditions=@(@{Field='http-header';HttpHeaderConfig=@{HttpHeaderName='X-Cogni-Origin-Verify';Values=@($secret)}});Actions=@(@{Type='forward';TargetGroupArn=$target})}
  } else { throw 'Priority 10 already exists; inspect it before changing access.' }

  $sgReply = Invoke-AwsJson @('ec2','describe-security-groups','--group-ids','sg-0b1d8eaa2d931240c','--region',$region,'--output','json')
  $permissions = $sgReply.SecurityGroups[0].IpPermissions
  if (-not ($permissions | Where-Object {$_.PrefixListIds.PrefixListId -contains 'pl-31a34658'})) {
    $null = Invoke-AwsInput @('ec2','authorize-security-group-ingress','--region',$region) @{GroupId='sg-0b1d8eaa2d931240c';IpPermissions=@(@{IpProtocol='tcp';FromPort=80;ToPort=80;PrefixListIds=@(@{PrefixListId='pl-31a34658';Description='HTTP from CloudFront origin-facing servers'})})}
  }
  if ($permissions | Where-Object {$_.FromPort -eq 80 -and $_.IpRanges.CidrIp -contains '0.0.0.0/0'}) {
    $null = Invoke-AwsJson @('ec2','revoke-security-group-ingress','--group-id','sg-0b1d8eaa2d931240c','--protocol','tcp','--port','80','--cidr','0.0.0.0/0','--region',$region,'--output','json')
  }
  Write-Output 'Origin header configured, private value stored in SSM, ALB ingress restricted to CloudFront. Wait for distribution deployment before Enforce.'
} else {
  $distribution = Invoke-AwsJson @('cloudfront','get-distribution','--id','E32QJWHDNI7D6K','--query','Distribution.Status','--output','json')
  if ($distribution -ne 'Deployed') { throw 'CloudFront has not finished deploying; listener remains unchanged.' }
  $rules = Invoke-AwsJson @('elbv2','describe-rules','--listener-arn',$listener,'--region',$region,'--output','json')
  if (-not ($rules.Rules | Where-Object {$_.Priority -eq '10' -and $_.Conditions.HttpHeaderConfig.HttpHeaderName -contains 'X-Cogni-Origin-Verify'})) { throw 'Origin verification rule missing' }
  $null = Invoke-AwsInput @('elbv2','modify-listener','--region',$region) @{ListenerArn=$listener;DefaultActions=@(@{Type='fixed-response';FixedResponseConfig=@{ContentType='text/plain';StatusCode='403';MessageBody='Forbidden'}})}
  Write-Output 'ALB now forwards only requests carrying the distribution private origin header.'
}
