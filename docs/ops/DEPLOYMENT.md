# Production Deployment Guide

## Prerequisites
- Docker & Docker Compose installed
- GitHub account (for CI/CD)
- Production server (AWS, Heroku, DigitalOcean, etc.)
- Domain name & SSL certificate

## Local Testing

## Production Deployment

### 1. Configure Environment Variables
Update `.env.production` with production values:
- JWT_SECRET: Strong random key
- DATABASE_URI: Production MongoDB connection
- CORS_ORIGIN: Your production domain
- SMTP credentials for email notifications

### 2. Build & Push Docker Images

### 3. Deploy to Production

### 4. Setup SSL/TLS
Use Let's Encrypt:

### 5. Configure Nginx
Update nginx.conf with SSL certificates

### 6. Backup Database

### 7. Monitor Logs

## Security Checklist
- [ ] JWT_SECRET is strong and random
- [ ] Database is backed up
- [ ] SSL/TLS certificate installed
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Monitoring & alerts set up
- [ ] Password reset working
- [ ] Logs accessible and monitored

## Backup & Recovery

### Create Backup

### Restore from Backup

## Troubleshooting

### Container won't start


### Database connection fails
Check MongoDB service and connection string

### API not responding
Check rate limiting and CORS configuration

## Support
For issues, check logs: `docker-compose logs -f`
