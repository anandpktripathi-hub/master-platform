# Production Deployment Guide

---

## 🚦 CI/CD Automation (GitHub Actions)

This project includes a sample GitHub Actions workflow for automated build, test, and Docker image publishing:

- See `.github/workflows/ci-cd.yml`
- On every push/PR to `main`, the pipeline will:
  - Build and test backend and frontend
  - Build and push Docker images to Docker Hub (on main branch)

**Usage:**
1. Set `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` as GitHub repository secrets.
2. Push to `main` to trigger build and publish.
3. Pull images on your server for deployment.

---

## Prerequisites
- Docker & Docker Compose installed
- GitHub account (for CI/CD)
- Production server (AWS, Heroku, DigitalOcean, etc.)
- Domain name & SSL certificate
- DNS provider account (Cloudflare, Route53, or similar)

## Local Testing

**.env Usage:**
- Use `.env.example` as a template for local development.
- For production, use `.env.production` and set all secrets/keys.
- Backend and frontend have their own `.env.example` files—copy and fill as needed.
Before production deployment:
1. Verify backend starts: `docker-compose up backend`
2. Verify frontend starts: `docker-compose up frontend`
3. Run integration tests: `npm run test:e2e`
4. Check all env vars are set in `.env.local`

## Production Deployment

**Reference:** See backend/frontend [README.md](../../backend/README.md), [README.md](../../frontend/README.md) for build/run instructions.

### 1. Configure Environment Variables
Update `.env.production` with production values:

```bash
# Application
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://app.yourdomain.com

# Database
DATABASE_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/saas_prod?retryWrites=true&w=majority

# Security
JWT_SECRET=<strong-random-64-char-string>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=<another-random-64-char-string>
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://app.yourdomain.com,https://yourdomain.com

# Domain/SSL
PLATFORM_DOMAIN=yourdomain.com

# SMTP (for transactional emails)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
SMTP_FROM=noreply@yourdomain.com

# Payment Gateway (Stripe)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Domain Reseller (optional)
DOMAIN_RESELLER_PROVIDER=cloudflare
CLOUDFLARE_API_TOKEN=<cf-api-token>
# or AWS_ROUTE53_ACCESS_KEY / AWS_ROUTE53_SECRET_KEY
```

### 2. Build & Push Docker Images

**Docker Image Tags:**
- Use semantic tags (e.g., `:latest`, `:v1.0.0`) for versioning.
- Always push both backend and frontend images after successful CI/CD.

```bash
# Build images
docker build -t yourusername/saas-backend:latest -f backend/Dockerfile .
docker build -t yourusername/saas-frontend:latest -f frontend/Dockerfile .

# Push to registry
docker push yourusername/saas-backend:latest
docker push yourusername/saas-frontend:latest
```

### 3. Deploy to Production

**Tip:** Always pull the latest images before running `docker-compose up -d`.

**Option A: Docker Compose on VPS**
```bash
# Copy docker-compose.prod.yml to server
scp docker-compose.prod.yml user@server:/opt/saas/
scp .env.production user@server:/opt/saas/.env

# SSH and start
ssh user@server
cd /opt/saas
docker-compose -f docker-compose.prod.yml up -d
```

**Option B: Kubernetes**
```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4. Setup SSL/TLS & Domain Infrastructure

#### 4.1 SSL Responsibility Model

This platform supports two SSL modes:

1. **Wildcard SSL for Platform Subdomains** (Infrastructure-managed)
   - Covers all tenant subdomains: `*.yourdomain.com`
   - Managed at the reverse proxy / CDN layer (Nginx, Cloudflare, ALB)
   - Automatically protects all tenant subdomains like `tenant1.yourdomain.com`

2. **Per-Custom-Domain SSL** (App-managed)
   - When tenants bring their own domains (e.g. `customdomain.com`)
   - App uses ACME DNS challenge or HTTP challenge via Let's Encrypt
   - Platform automates DNS verification and cert issuance per custom domain

#### 4.2 Wildcard SSL Setup (Cloudflare Example)

**Step 1: DNS Configuration**
- Add your domain `yourdomain.com` to Cloudflare
- Create DNS records:
  - `A` record: `yourdomain.com` → `<server-ip>`
  - `CNAME` record: `*.yourdomain.com` → `yourdomain.com`
  - `CNAME` record: `app.yourdomain.com` → `yourdomain.com`

**Step 2: Enable Cloudflare SSL**
- In Cloudflare dashboard → SSL/TLS → Overview
- Set mode to **Full (strict)**

---

## 🛠️ Troubleshooting

- **Container fails to start:** Check logs with `docker-compose logs <service>`
- **Port conflicts:** Ensure no other process is using 4000 (backend) or 80 (frontend)
- **Env variable issues:** Double-check `.env` files and required secrets
- **Database connection errors:** Confirm MongoDB/Redis are running and accessible
- **SSL errors:** Verify DNS and certificate setup

For more, see [backend/README.md](../../backend/README.md) and [frontend/README.md](../../frontend/README.md).
- Origin Server: Generate origin certificate in Cloudflare
- Download certificate and key
- Install on your origin server (Nginx)

**Step 3: Configure Nginx for Wildcard SSL**
```nginx
# /etc/nginx/sites-available/saas-platform.conf

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com *.yourdomain.com;
    return 301 https://$host$request_uri;
}

# Main app (frontend)
server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /etc/ssl/certs/cloudflare-origin.pem;
    ssl_certificate_key /etc/ssl/private/cloudflare-origin.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API backend
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/ssl/certs/cloudflare-origin.pem;
    ssl_certificate_key /etc/ssl/private/cloudflare-origin.key;

    location / {
        proxy_pass http://backend:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Tenant subdomains (*.yourdomain.com)
server {
    listen 443 ssl http2;
    server_name ~^(?<tenant>[^.]+)\.yourdomain\.com$;

    ssl_certificate /etc/ssl/certs/cloudflare-origin.pem;
    ssl_certificate_key /etc/ssl/private/cloudflare-origin.key;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Tenant-Subdomain $tenant;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Step 4: Enable Cloudflare Proxy**
- Set DNS records to "Proxied" (orange cloud) in Cloudflare
- This enables CDN, DDoS protection, and automatic SSL

#### 4.3 Wildcard SSL Setup (AWS Example)

**Step 1: Request Wildcard Certificate in ACM**
```bash
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names *.yourdomain.com \
  --validation-method DNS
```

**Step 2: Validate Domain**
- ACM will provide CNAME records for DNS validation
- Add these records in Route53:
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch file://dns-validation.json
```

**Step 3: Attach Certificate to ALB**
```bash
aws elbv2 add-listener-certificates \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --certificates CertificateArn=arn:aws:acm:...
```

#### 4.4 Custom Domain SSL (Per-Tenant Automation)

The platform already implements custom domain SSL automation:

1. **Tenant adds custom domain** via `/domains/me` API
2. **App verifies DNS** by checking for TXT record: `_acme-challenge.customdomain.com`
3. **App requests Let's Encrypt cert** using DNS-01 or HTTP-01 challenge
4. **App stores cert** in database or S3 and configures Nginx/Caddy dynamically
5. **Tenant domain becomes active** with SSL enabled

**Environment variables for custom domain SSL:**
```bash
ACME_EMAIL=admin@yourdomain.com
ACME_DIRECTORY_URL=https://acme-v02.api.letsencrypt.org/directory
SSL_STORAGE_PATH=/etc/ssl/custom-domains
```

**Note:** For production at scale, use a dynamic SSL proxy like Caddy or integrate with Let's Encrypt directly via `certbot` or ACME client libraries.

#### 4.5 Domain Reseller Integration

The platform includes a domain reseller abstraction (`DomainResellerService`) with a stub provider. To integrate with real providers:

**Cloudflare Registrar:**
```typescript
// backend/src/modules/domains/services/cloudflare-reseller.provider.ts
export class CloudflareResellerProvider implements DomainResellerProvider {
  async search(domain: string): Promise<DomainSearchResult> {
    const response = await axios.post(
      'https://api.cloudflare.com/client/v4/accounts/:account/registrar/domains/check',
      { domains: [domain] },
      { headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` } }
    );
    return {
      domain,
      available: response.data.result[0].available,
      price: response.data.result[0].price,
      currency: 'USD',
    };
  }
  // ... purchase, ensureDns
}
```

**AWS Route53 Domains:**
```typescript
// Use AWS SDK
import { Route53Domains } from '@aws-sdk/client-route-53-domains';
const client = new Route53Domains({ region: 'us-east-1' });

async search(domain: string): Promise<DomainSearchResult> {
  const result = await client.checkDomainAvailability({ DomainName: domain });
  return {
    domain,
    available: result.Availability === 'AVAILABLE',
    // pricing via ListPrices API
  };
}
```

Update `DomainsModule` to use the real provider:
```typescript
providers: [
  {
    provide: DomainResellerProvider,
    useClass: CloudflareResellerProvider, // or Route53ResellerProvider
  },
  DomainResellerService,
],
```

### 5. Configure Nginx (Advanced)

Production Nginx config with security headers, rate limiting, and SSL:

```nginx
# /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/m;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

### 6. Backup Database

**MongoDB Atlas Automated Backups:**
- Enable continuous backups in Atlas dashboard
- Set retention period (7 days recommended)
- Configure backup alerts

**Manual Backup Script:**
```bash
#!/bin/bash
# /opt/saas/scripts/backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="saas_prod"

mongodump --uri="$DATABASE_URI" --out="$BACKUP_DIR/$DATE"
tar -czf "$BACKUP_DIR/$DATE.tar.gz" "$BACKUP_DIR/$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# Upload to S3
aws s3 cp "$BACKUP_DIR/$DATE.tar.gz" s3://saas-backups/mongodb/

# Keep only last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

**Cron job:**
```bash
0 2 * * * /opt/saas/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

### 7. Monitor Logs

**Docker Compose:**
```bash
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```

**Centralized Logging (ELK Stack):**
```yaml
# docker-compose.prod.yml
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
    volumes:
      - es_data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    depends_on:
      - elasticsearch
    ports:
      - "5601:5601"
```

**Application Monitoring:**
- Use PM2 for Node.js process management
- Integrate with Datadog, New Relic, or Sentry for APM
- Set up Prometheus + Grafana for metrics

## Security Checklist
- [x] JWT_SECRET is strong and random (64+ chars)
- [x] Database is backed up (automated daily)
- [x] SSL/TLS certificate installed (wildcard + custom domains)
- [x] CORS configured correctly (whitelist only trusted origins)
- [x] Rate limiting enabled (Nginx + application layer)
- [x] Input validation active (class-validator, sanitization)
- [x] Monitoring & alerts set up (logs, uptime, errors)
- [x] Password reset working (SMTP configured)
- [x] Logs accessible and monitored (centralized logging)
- [x] Environment variables secured (not in Git, use secrets manager)
- [x] Database connection uses TLS
- [x] API keys rotated regularly
- [x] Firewall rules configured (restrict DB access to app servers only)

## Testing in Production

### SSL/Subdomain Testing Checklist
- [ ] Visit `https://yourdomain.com` → should load with valid SSL
- [ ] Visit `https://app.yourdomain.com` → should load frontend with valid SSL
- [ ] Visit `https://api.yourdomain.com/health` → should return `{"status":"ok"}`
- [ ] Visit `https://tenant1.yourdomain.com` → should load tenant subdomain with valid SSL
- [ ] Create a custom domain in app → verify DNS challenge and SSL issuance
- [ ] Check SSL labs: `https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com` (should get A+ rating)

### Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 https://api.yourdomain.com/health

# Test with authentication
ab -n 1000 -c 10 -H "Authorization: Bearer <token>" https://api.yourdomain.com/users/me
```

## Backup & Recovery

### Create Backup
```bash
# Automated via cron (see section 6)
/opt/saas/scripts/backup-db.sh
```

### Restore from Backup
```bash
# Download from S3
aws s3 cp s3://saas-backups/mongodb/20260113_020000.tar.gz /tmp/

# Extract
tar -xzf /tmp/20260113_020000.tar.gz -C /tmp/

# Restore
mongorestore --uri="$DATABASE_URI" /tmp/20260113_020000
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Common issues:
# - Missing environment variables
# - Database connection failure
# - Port already in use
```

### Database connection fails
- Check MongoDB URI is correct
- Verify network connectivity: `telnet <db-host> 27017`
- Check MongoDB Atlas IP whitelist
- Verify TLS/SSL settings in connection string

### API not responding
- Check rate limiting: `docker-compose logs nginx | grep "limiting requests"`
- Verify CORS configuration in `.env`
- Check firewall rules: `sudo ufw status`
- Test with curl: `curl -v https://api.yourdomain.com/health`

### SSL certificate errors
- Verify certificate is valid: `openssl s_client -connect yourdomain.com:443`
- Check Nginx SSL config: `sudo nginx -t`
- Reload Nginx: `sudo systemctl reload nginx`
- For Let's Encrypt, check renewal: `certbot certificates`

### Custom domain SSL not working
- Verify DNS TXT record for ACME challenge
- Check app logs: `docker-compose logs backend | grep -i acme`
- Manually test Let's Encrypt: `certbot certonly --manual --preferred-challenges dns -d customdomain.com`

## Support
For issues:
- Check logs: `docker-compose -f docker-compose.prod.yml logs -f`
- Review error logs: `tail -f /var/log/nginx/error.log`
- Check application metrics in monitoring dashboard
- Contact support: support@yourdomain.com
