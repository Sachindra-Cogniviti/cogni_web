# SES verification in Bluehost

SES region: Singapore (`ap-southeast-1`). Production-access request submitted; AWS review is pending. Sending domain verification has been restarted. The public DNS is hosted by Bluehost, so add these records there. Route 53 changes would not validate this domain under the current nameservers.

Use Bluehost → Domains → cognivitilabs.com → DNS → Add Record. Bluehost appends `.cognivitilabs.com` to the Host field; enter only the short host below. Set TTL to 1 hour or the default.

| Type | Host | Points to / Value | Priority |
| --- | --- | --- | --- |
| CNAME | `m7qwhddm4dy7a6c7pp2o2takq2yhdefa._domainkey` | `m7qwhddm4dy7a6c7pp2o2takq2yhdefa.dkim.amazonses.com` | — |
| CNAME | `vcf4jth2zn6lgqa7xvmbcvvzk42vq7dm._domainkey` | `vcf4jth2zn6lgqa7xvmbcvvzk42vq7dm.dkim.amazonses.com` | — |
| CNAME | `w6trozh7vayy3daevsyzdmkslw3tnsmf._domainkey` | `w6trozh7vayy3daevsyzdmkslw3tnsmf.dkim.amazonses.com` | — |
| TXT | `_amazonses` | `kuArxApBTKbbidY9Q6iL1XI/LWcnVEl4wVRAJjz/hLs=` | — |
| MX | `mail` | `feedback-smtp.ap-southeast-1.amazonses.com` | `10` |
| TXT | `mail` | `v=spf1 include:amazonses.com ~all` | — |

Keep existing root `@` Microsoft 365 MX and SPF TXT records unchanged. Keep the existing `mail` A record and existing DKIM records. These new records configure SES sender verification and the outbound MAIL FROM subdomain; they do not move incoming company email away from Microsoft 365.

After adding all six records, check SES identity and DKIM status. SES production approval is controlled by AWS and is separate from sender verification; until both are ready, arbitrary-recipient delivery is not confirmed. No test email was sent during this configuration.
