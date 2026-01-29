# Environment Variables Reference

Complete reference for all environment variables used in the SmetaSC SaaS platform.

## Core Application

```env
# Server Configuration
NODE_ENV=development                    # Environment: development, staging, production
PORT=4000                               # Backend server port
FRONTEND_URL=http://localhost:3000      # Frontend URL for CORS and redirects

# Database
MONGODB_URI=mongodb://localhost:27017/smetasc  # MongoDB connection string

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d                       # Token expiration (e.g., 1h, 7d, 30d)
```

## Email Configuration

```env
# Email Service (NodeMailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false                      # true for 465, false for other ports
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourcompany.com
```

## Storage Configuration

```env
# Storage Provider Selection
STORAGE_PROVIDER=local                  # Options: local, s3, cloudinary
STORAGE_BASE_URL=http://localhost:4000  # Base URL for local storage

# Local Storage
STORAGE_LOCAL_BASE_PATH=./uploads       # Local upload directory

# AWS S3 (if STORAGE_PROVIDER=s3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Cloudinary (if STORAGE_PROVIDER=cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Payment Gateways

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
PAYPAL_MODE=sandbox                     # Options: sandbox, live

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

## Security & OAuth

```env
# reCAPTCHA
RECAPTCHA_ENABLED=false                 # Set to 'true' to enable
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
RECAPTCHA_SITE_KEY=your-recaptcha-site-key  # For frontend

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback
```

## Integrations

Integrations are configured per-tenant via the Settings UI. These environment variables are not required unless you want to set platform-wide defaults.

```env
# Slack (optional platform defaults)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Telegram (optional platform defaults)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Twilio (optional platform defaults)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+1234567890
```

## Cache & Redis (Optional)

```env
# Redis Configuration (for caching, sessions, queues)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Rate Limiting

```env
# Rate Limit Configuration
RATE_LIMIT_TTL=60                       # Time window in seconds
RATE_LIMIT_MAX=100                      # Max requests per window
```

## Logging & Monitoring

```env
# Logging
LOG_LEVEL=info                          # Options: error, warn, info, debug
LOG_FORMAT=json                         # Options: json, simple

# Sentry (Error Tracking)
SENTRY_DSN=https://...@sentry.io/...
```

## Multi-Tenancy

```env
# Domain Configuration
TENANT_BASE_DOMAIN=yourdomain.com       # Base domain for tenant subdomains
ENABLE_CUSTOM_DOMAINS=true              # Allow tenants to use custom domains
```

## Feature Flags

```env
# Feature Toggles
ENABLE_EMAIL_VERIFICATION=true          # Require email verification
ENABLE_SUBSCRIPTION_TRIALS=true         # Allow trial periods
ENABLE_INVOICE_AUTO_FINALIZE=false      # Auto-finalize draft invoices
ENABLE_MULTI_CURRENCY=true              # Multi-currency support
```

## Production Recommendations

### Security Checklist
- [ ] Change all default secrets and keys
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (min 32 characters)
- [ ] Enable `RECAPTCHA_ENABLED=true` for public endpoints
- [ ] Use secure database connection (SSL/TLS)
- [ ] Enable rate limiting with appropriate values
- [ ] Set up Sentry or similar error tracking

### Storage Recommendations
- Use `STORAGE_PROVIDER=s3` or `cloudinary` for production
- Configure CDN for static assets
- Set appropriate S3 bucket policies and CORS

### Email Configuration
- Use dedicated SMTP service (SendGrid, Mailgun, AWS SES)
- Configure SPF, DKIM, and DMARC records
- Use production `EMAIL_FROM` domain

### OAuth Configuration
- Register production callback URLs with providers
- Use production OAuth credentials (not test/dev keys)

### Payment Configuration
- Use live payment credentials (not test/sandbox)
- Configure production webhook URLs
- Test all payment flows in sandbox before going live

## Example .env File

```env
# Minimal Production Setup
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://app.yourdomain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smetasc
JWT_SECRET=your-super-secure-64-character-random-string-change-this
JWT_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

# Storage
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=smetasc-production-assets

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Security
RECAPTCHA_ENABLED=true
RECAPTCHA_SECRET_KEY=6LfXXXXXXXXXXXXX
```

## Testing .env File

```env
# Minimal Development/Test Setup
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/smetasc-test
JWT_SECRET=test-secret-key-not-for-production
JWT_EXPIRES_IN=1d

# Local Storage (no cloud services needed)
STORAGE_PROVIDER=local
STORAGE_LOCAL_BASE_PATH=./uploads
STORAGE_BASE_URL=http://localhost:4000

# Email (use Ethereal for testing)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=ethereal-user
EMAIL_PASS=ethereal-pass
EMAIL_FROM=test@example.com

# Stripe Test Mode
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Disable Security for Local Dev
RECAPTCHA_ENABLED=false
```

## Environment-Specific Notes

### Development
- Use `nodemon` for hot reloading
- Enable detailed logging (`LOG_LEVEL=debug`)
- Disable email verification for faster testing
- Use local storage provider

### Staging
- Mirror production configuration
- Use test payment gateway credentials
- Enable all security features
- Use subdomain (e.g., `staging.yourdomain.com`)

### Production
- Minimum required variables listed above
- All secrets must be unique and secure
- Enable all security features
- Use managed services (AWS RDS, S3, etc.)
- Set up monitoring and alerting
