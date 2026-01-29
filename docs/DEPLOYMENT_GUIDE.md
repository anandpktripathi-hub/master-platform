# Production Deployment Guide

Complete guide for deploying the SmetaSC SaaS platform to production.

## Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] **Server/Hosting**: VPS (DigitalOcean, AWS EC2, etc.) or PaaS (Heroku, Render, Railway)
- [ ] **Database**: MongoDB Atlas or self-hosted MongoDB with replica set
- [ ] **Storage**: AWS S3, Cloudinary, or similar for file uploads
- [ ] **Domain**: Registered domain with DNS access
- [ ] **SSL Certificate**: Let's Encrypt (recommended) or commercial SSL
- [ ] **Email Service**: SendGrid, Mailgun, AWS SES, or SMTP provider

### Security Checklist
- [ ] Change all default secrets in environment variables
- [ ] Generate strong JWT secret (min 32 characters random)
- [ ] Enable reCAPTCHA for public endpoints
- [ ] Configure rate limiting
- [ ] Set up firewall rules (allow only 80, 443, SSH)
- [ ] Enable MongoDB authentication and SSL
- [ ] Configure CORS for frontend domain only
- [ ] Set up regular database backups
- [ ] Enable audit logging for critical operations

### Code Preparation
- [ ] Update `FRONTEND_URL` in backend `.env`
- [ ] Update API base URL in frontend config
- [ ] Build frontend for production: `npm run build`
- [ ] Run backend build: `npm run build`
- [ ] Run all tests: `npm test`
- [ ] Check for TypeScript errors: `npm run type-check`

---

## Deployment Options

### Option 1: VPS Deployment (Ubuntu 22.04)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. MongoDB Setup (if self-hosting)

```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/mongodb-server-7.0.gpg

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create admin user
mongosh --eval 'db.getSiblingDB("admin").createUser({
  user: "admin",
  pwd: "CHANGE_THIS_PASSWORD",
  roles: ["root"]
})'
```

**Recommended**: Use MongoDB Atlas for managed hosting instead.

#### 3. Deploy Backend

```bash
# Create app directory
sudo mkdir -p /var/www/smetasc
cd /var/www/smetasc

# Clone repository (or upload files)
git clone https://github.com/your-org/smetasc-saas.git .

# Install backend dependencies
cd backend
npm ci --production

# Create .env file
nano .env
# Paste production environment variables (see ENVIRONMENT_VARIABLES.md)

# Build backend
npm run build

# Start with PM2
pm2 start dist/main.js --name smetasc-backend
pm2 save
pm2 startup
```

#### 4. Deploy Frontend

```bash
# Install frontend dependencies
cd /var/www/smetasc/frontend
npm ci

# Build for production
npm run build

# Nginx will serve from dist/
```

#### 5. Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/smetasc
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name app.yourdomain.com;
    root /var/www/smetasc/frontend/dist;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/smetasc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. Setup SSL with Let's Encrypt

```bash
# Get SSL certificates
sudo certbot --nginx -d api.yourdomain.com -d app.yourdomain.com

# Auto-renewal is configured by default
# Test renewal
sudo certbot renew --dry-run
```

#### 7. Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### 8. Setup Monitoring

```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs smetasc-backend

# Monitor processes
pm2 monit
```

---

### Option 2: Docker Deployment

#### 1. Build Docker Images

```bash
# Backend
cd backend
docker build -t smetasc-backend:latest .

# Frontend
cd ../frontend
docker build -t smetasc-frontend:latest .
```

#### 2. Docker Compose Setup

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: smetasc-backend:latest
    container_name: smetasc-backend
    restart: unless-stopped
    ports:
      - "4000:4000"
    env_file:
      - ./backend/.env.production
    depends_on:
      - mongodb
    networks:
      - smetasc-network

  frontend:
    image: smetasc-frontend:latest
    container_name: smetasc-frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro
    networks:
      - smetasc-network

  mongodb:
    image: mongo:7.0
    container_name: smetasc-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - smetasc-network

volumes:
  mongodb_data:

networks:
  smetasc-network:
    driver: bridge
```

```bash
# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

### Option 3: Cloud Platform Deployment

#### AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p node.js-20 smetasc-backend

# Create environment
eb create smetasc-prod --database --envvars NODE_ENV=production,MONGODB_URI=...

# Deploy
eb deploy
```

#### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create smetasc-backend

# Add MongoDB
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Railway

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables
5. Deploy automatically on push

#### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

---

## Post-Deployment

### 1. DNS Configuration

```
# Add DNS records:
A     @                   -> Your server IP
A     www                 -> Your server IP
A     api                 -> Your server IP
A     app                 -> Your server IP
CNAME *                   -> @ (for wildcard tenant subdomains)
```

### 2. Email Configuration

- Add SPF record: `v=spf1 include:_spf.youremailprovider.com ~all`
- Add DKIM record (provided by email service)
- Add DMARC record: `v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com`

### 3. Create Platform Admin

```bash
# Connect to production database
mongosh "your-production-mongodb-uri"

# Create superadmin user
use smetasc
db.users.insertOne({
  email: "admin@yourdomain.com",
  password: "$2b$10$...",  // Use bcrypt to hash password
  role: "PLATFORM_SUPERADMIN",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 4. Test Critical Flows

- [ ] User registration and email verification
- [ ] Login and JWT authentication
- [ ] Tenant creation and subdomain routing
- [ ] Subscription purchase (test mode)
- [ ] Invoice generation and payment
- [ ] File uploads (branding, CMS)
- [ ] Webhook delivery
- [ ] Email sending
- [ ] OAuth login (Google, GitHub)

### 5. Setup Monitoring

**Health Checks**:
```bash
# Add to monitoring service (UptimeRobot, Pingdom, etc.)
https://api.yourdomain.com/health
https://api.yourdomain.com/health/ready
```

**Metrics**:
```bash
# Prometheus metrics endpoint
https://api.yourdomain.com/metrics/prometheus
```

**Error Tracking**:
- Configure Sentry DSN
- Set up Slack/email alerts for critical errors

### 6. Backup Strategy

```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb+srv://..." --out=/backups/$DATE
tar -czf /backups/$DATE.tar.gz /backups/$DATE
rm -rf /backups/$DATE

# Upload to S3
aws s3 cp /backups/$DATE.tar.gz s3://your-backup-bucket/

# Setup cron job
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

---

## Scaling Considerations

### Horizontal Scaling

```nginx
# Nginx load balancer config
upstream backend_cluster {
    least_conn;
    server 10.0.1.10:4000;
    server 10.0.1.11:4000;
    server 10.0.1.12:4000;
}

server {
    location / {
        proxy_pass http://backend_cluster;
    }
}
```

### Database Scaling
- Use MongoDB Atlas auto-scaling
- Enable replica sets for read scaling
- Add read replicas for reporting queries

### CDN Setup
- CloudFlare for global CDN and DDoS protection
- AWS CloudFront for S3 assets
- Cache static assets at edge locations

### Redis Caching
```env
# Add Redis for session storage and caching
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

---

## Rollback Procedure

```bash
# PM2 rollback
pm2 stop smetasc-backend
git reset --hard HEAD~1
npm ci
npm run build
pm2 restart smetasc-backend

# Docker rollback
docker-compose down
docker pull smetasc-backend:previous-tag
docker-compose up -d
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs smetasc-backend --lines 100

# Common issues:
# - Missing environment variables
# - Database connection refused
# - Port already in use
```

### Frontend 404 errors
```bash
# Check Nginx config
sudo nginx -t

# Ensure try_files includes /index.html
try_files $uri $uri/ /index.html;
```

### Database connection issues
```bash
# Test connection
mongosh "your-mongodb-uri"

# Check firewall rules
# MongoDB Atlas: Add server IP to whitelist
```

### SSL certificate renewal fails
```bash
# Manual renewal
sudo certbot renew --force-renewal

# Check logs
sudo cat /var/log/letsencrypt/letsencrypt.log
```

---

## Support & Maintenance

### Regular Maintenance Tasks
- [ ] Weekly: Review error logs and metrics
- [ ] Monthly: Update dependencies (`npm audit fix`)
- [ ] Monthly: Review and rotate secrets
- [ ] Quarterly: Load testing and performance review
- [ ] Quarterly: Security audit

### Performance Monitoring
- Response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Memory and CPU usage

### Security Updates
```bash
# Update Node.js
sudo apt update
sudo apt upgrade nodejs

# Update dependencies
npm audit
npm audit fix

# Update PM2
pm2 update
```

---

## Emergency Contacts

- **Hosting Provider Support**: [Contact info]
- **MongoDB Atlas Support**: [Contact info]
- **Email Service Support**: [Contact info]
- **Payment Gateway Support**: [Contact info]
- **On-Call Developer**: [Contact info]
