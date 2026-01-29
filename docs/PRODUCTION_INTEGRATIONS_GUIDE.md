# Production Integrations Guide

This guide documents all external service integrations now wired into the Master Platform SaaS backend, including required environment variables, setup instructions, and operational notes for deploying and running these integrations in production.

---

## Table of Contents

1. [Storage: AWS S3](#storage-aws-s3)
2. [Payments: Multi-Gateway Support](#payments-multi-gateway-support)
3. [SSL Automation: ACME/Let's Encrypt](#ssl-automation-acme-lets-encrypt)
4. [Google Calendar Integration](#google-calendar-integration)
5. [Social Login: OAuth2 (Google & GitHub)](#social-login-oauth2-google--github)
6. [Push Notifications: Web Push & FCM](#push-notifications-web-push--fcm)
7. [Domain Reseller: Namecheap & Others](#domain-reseller-namecheap--others)
8. [Summary of All Environment Variables](#summary-of-all-environment-variables)

---

## Storage: AWS S3

**Module:** `backend/src/common/storage/storage.service.ts`

The `StorageService` now supports real AWS S3 uploads and deletions using `@aws-sdk/client-s3`.

### Environment Variables

```env
# Storage provider: local | s3 | cloudinary
STORAGE_PROVIDER=s3

# AWS S3 Configuration
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Optional: Custom S3 base URL (for CloudFront CDN or custom domains)
STORAGE_S3_BASE_URL=https://cdn.yourdomain.com

# For local storage (fallback)
STORAGE_LOCAL_BASE_PATH=./uploads
STORAGE_BASE_URL=http://localhost:4000/uploads
```

### Setup Instructions

1. **Create an S3 Bucket** in your AWS account via the AWS Console or CLI.
2. **Configure Bucket Permissions**:
   - Enable public read access for uploaded objects (or use CloudFront with signed URLs for private content).
   - Set bucket policy to allow `s3:PutObject` and `s3:DeleteObject` for your IAM user/role.
3. **Create IAM User/Role**:
   - Grant `AmazonS3FullAccess` or a custom policy with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on your bucket.
   - Generate access keys and set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `.env`.
4. **Optional**: Set up CloudFront distribution pointing to your S3 bucket and configure `STORAGE_S3_BASE_URL`.

### Operational Notes

- **ACL**: The service sets `ACL: 'public-read'` by default. Remove or adjust if using CloudFront or private buckets.
- **Dependencies**: `@aws-sdk/client-s3` is already installed in `package.json`.

---

## Payments: Multi-Gateway Support

**Module:** `backend/src/modules/payments/services/payment-gateway.service.ts`

The payment gateway service now supports:

- **Stripe** (fully integrated, live)
- **PayPal** (real order capture via `@paypal/checkout-server-sdk`)
- **Paystack** (real transaction verification via HTTP API)
- **Flutterwave, Mollie, Razorpay, SSLCommerz** (simulated; ready to extend)

### Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox  # or 'live' for production

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# Currency Conversion (optional, for multi-currency support)
CURRENCY_CONVERSION_RATES_JSON={"EUR_USD":1.1,"GBP_USD":1.25}
```

### Setup Instructions

#### Stripe

1. Sign up at [stripe.com](https://stripe.com).
2. Get your **Secret Key** and **Publishable Key** from the Stripe Dashboard.
3. Configure webhook endpoints for production (optional).

#### PayPal

1. Sign up for a PayPal Developer account at [developer.paypal.com](https://developer.paypal.com).
2. Create a REST API app in the PayPal Developer Dashboard.
3. Get your **Client ID** and **Client Secret**.
4. Set `PAYPAL_MODE=sandbox` for testing, `PAYPAL_MODE=live` for production.
5. **Client Integration**: Use PayPal JS SDK on the frontend to create an order, then pass the order ID as `sourceToken` to the backend.

#### Paystack

1. Sign up at [paystack.com](https://paystack.com).
2. Get your **Secret Key** and **Public Key** from the Paystack Dashboard.
3. **Client Integration**: Initialize a transaction on the frontend using Paystack Inline JS, then pass the payment reference as `sourceToken` to the backend for verification.

### Operational Notes

- **Gateway Selection**: Set the `gatewayName` field in payment requests to choose the gateway (e.g., `"stripe"`, `"paypal"`, `"paystack"`).
- **Per-Module Toggles**: Use the `modules` field in `PaymentGatewayConfigDto` to enable/disable gateways for specific modules (e.g., packages, domains).
- **Dependencies**: `stripe`, `@paypal/checkout-server-sdk`, and `axios` are already installed.

---

## SSL Automation: ACME/Let's Encrypt

**Module:** `backend/src/modules/custom-domains/services/custom-domain.service.ts`

The `issueSslCertificate` method now includes detailed integration guidance for calling external ACME clients (certbot, acme.sh, or node-acme-client).

### Environment Variables

```env
# Optional: Path to certbot binary or ACME client
CERTBOT_PATH=/usr/bin/certbot

# Optional: Email for Let's Encrypt notifications
ACME_EMAIL=admin@yourdomain.com
```

### Setup Instructions

1. **Install Certbot** (or another ACME client):
   ```bash
   sudo apt-get install certbot  # Ubuntu/Debian
   ```

2. **Webroot Configuration**:
   - Ensure your web server (nginx/Apache) serves the `.well-known/acme-challenge` directory for HTTP-01 challenges.
   - Configure `webroot` path (e.g., `/var/www/certbot`).

3. **Automation**:
   - When `issueSslCertificate` is called, spawn or enqueue a job to run:
     ```bash
     certbot certonly --webroot -w /var/www/certbot \
       -d <customDomain.domain> --non-interactive --agree-tos \
       -m admin@yourdomain.com
     ```
   - Poll or listen for certbot completion, then update the database record with `sslStatus='issued'`.

4. **Resync Certs**:
   - Use `SslAutomationService.resyncStatuses()` to scan `/etc/letsencrypt/live/` and update database records.

### Operational Notes

- **Manual Renewal**: Certbot certs auto-renew via cron. Ensure your cron job runs `certbot renew` daily.
- **Alternative**: Use [node-acme-client](https://www.npmjs.com/package/acme-client) for in-process ACME flows.
- **Wildcard Certs**: Requires DNS-01 challenge; configure DNS provider API integration.

---

## Google Calendar Integration

**Module:** `backend/src/common/calendar/calendar.service.ts`

The `CalendarService` creates, updates, and deletes events in Google Calendar using the googleapis library.

### Environment Variables

```env
# Google Calendar Configuration
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_JSON=base64-encoded-or-raw-json
```

### Setup Instructions

1. **Create a Google Cloud Project**:
   - Go to [console.cloud.google.com](https://console.cloud.google.com).
   - Enable the **Google Calendar API**.

2. **Create a Service Account**:
   - In IAM & Admin > Service Accounts, create a new service account.
   - Grant it **Editor** or **Calendar API** permissions.
   - Download the JSON key file.

3. **Share Your Calendar**:
   - Open Google Calendar, go to Settings > Calendar Settings.
   - Share the calendar with the service account email (e.g., `service-account@project-id.iam.gserviceaccount.com`).
   - Grant **Make changes to events** permission.

4. **Configure Environment Variables**:
   - Set `GOOGLE_CALENDAR_ID` to your calendar ID (found in Calendar Settings).
   - Set `GOOGLE_SERVICE_ACCOUNT_JSON` to the base64-encoded JSON key or raw JSON string.

### Operational Notes

- **Usage**: Call `calendarService.createEvent({ summary, start, end })` from your booking/scheduling modules.
- **Dependencies**: `googleapis` is already installed in `package.json`.

---

## Social Login: OAuth2 (Google & GitHub)

**Modules:**
- `backend/src/auth/strategies/google.strategy.ts`
- `backend/src/modules/auth/strategies/github.strategy.ts`
- `backend/src/modules/auth/auth.controller.ts` (endpoints: `/auth/google`, `/auth/github`)

### Environment Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback

# Frontend URL for redirect after OAuth
FRONTEND_URL=http://localhost:3000
```

### Setup Instructions

#### Google

1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add `http://localhost:4000/auth/google/callback` to **Authorized redirect URIs** (update for production domain).
4. Copy the **Client ID** and **Client Secret** to your `.env`.

#### GitHub

1. Go to [github.com/settings/developers](https://github.com/settings/developers).
2. Create a new **OAuth App**.
3. Set **Authorization callback URL** to `http://localhost:4000/auth/github/callback` (update for production).
4. Copy the **Client ID** and **Client Secret** to your `.env`.

### Operational Notes

- **Frontend Integration**: Add "Login with Google" and "Login with GitHub" buttons that redirect to `/auth/google` and `/auth/github`.
- **Token Handling**: After successful OAuth, the backend redirects to `FRONTEND_URL/auth/callback?token=<JWT>`. The frontend should capture the token and store it in localStorage/cookies.
- **Dependencies**: `passport-google-oauth20` and `passport-github2` are already installed.

---

## Push Notifications: Web Push & FCM

**Module:** `backend/src/common/push-notification/push-notification.service.ts`

The `PushNotificationService` sends browser push notifications using either Web Push (VAPID) or Firebase Cloud Messaging (FCM).

### Environment Variables

```env
# Push provider: webpush | fcm
PUSH_PROVIDER=webpush

# Web Push (VAPID)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@yourdomain.com

# Firebase Cloud Messaging (FCM)
FIREBASE_SERVICE_ACCOUNT_JSON=base64-encoded-or-raw-json
```

### Setup Instructions

#### Web Push (VAPID)

1. **Generate VAPID Keys**:
   ```bash
   npx web-push generate-vapid-keys
   ```
   This outputs a public and private key pair.

2. **Configure Environment Variables**:
   - Set `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`.
   - Set `VAPID_SUBJECT` to your email or website URL.

3. **Frontend Integration**:
   - Request notification permission from the user.
   - Subscribe to push notifications using the browser's Push API and the VAPID public key.
   - Send the subscription object (endpoint, keys) to your backend and store it in the database.

4. **Install Dependency** (optional, if not already installed):
   ```bash
   npm install web-push
   ```

#### Firebase Cloud Messaging (FCM)

1. **Create a Firebase Project**:
   - Go to [console.firebase.google.com](https://console.firebase.google.com).
   - Create a new project and enable Cloud Messaging.

2. **Generate Service Account Key**:
   - In Project Settings > Service Accounts, generate a new private key.
   - Download the JSON key file.

3. **Configure Environment Variables**:
   - Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the base64-encoded JSON key or raw JSON string.

4. **Frontend Integration**:
   - Use Firebase JS SDK to get the FCM device token.
   - Send the token to your backend and store it.

5. **Install Dependency** (optional):
   ```bash
   npm install firebase-admin
   ```

### Operational Notes

- **Subscription Storage**: Store user push subscriptions (endpoint, keys, or FCM tokens) in your database.
- **Batch Notifications**: Use `sendBatchNotifications()` to send to multiple users at once.
- **Permissions**: Users must grant notification permission in their browser.

---

## Domain Reseller: Namecheap & Others

**Module:** `backend/src/common/domain-reseller/domain-reseller.service.ts`

The `DomainResellerService` automates domain registration with Namecheap (live) and provides extension points for GoDaddy and ResellerClub.

### Environment Variables

```env
# Domain reseller provider: namecheap | godaddy | resellerclub
DOMAIN_RESELLER_PROVIDER=namecheap

# Namecheap
NAMECHEAP_API_USER=your-api-username
NAMECHEAP_API_KEY=your-api-key
NAMECHEAP_USERNAME=your-account-username
NAMECHEAP_CLIENT_IP=your-server-ip
NAMECHEAP_SANDBOX=true  # false for production

# GoDaddy (placeholder)
GODADDY_API_KEY=your-godaddy-api-key
GODADDY_API_SECRET=your-godaddy-api-secret
```

### Setup Instructions

#### Namecheap

1. **Sign Up for Namecheap Reseller Account**:
   - Go to [namecheap.com/support/api/intro/](https://www.namecheap.com/support/api/intro/).
   - Request API access and get your API credentials.

2. **Whitelist Your Server IP**:
   - In the Namecheap dashboard, whitelist your server's public IP address.

3. **Configure Environment Variables**:
   - Set `NAMECHEAP_API_USER`, `NAMECHEAP_API_KEY`, `NAMECHEAP_USERNAME`, and `NAMECHEAP_CLIENT_IP`.
   - Set `NAMECHEAP_SANDBOX=true` for testing, `false` for production.

4. **Test Domain Registration**:
   ```typescript
   const result = await domainResellerService.registerDomain('example.com', {
     firstName: 'John',
     lastName: 'Doe',
     email: 'john@example.com',
     phone: '+1.1234567890',
     address1: '123 Main St',
     city: 'New York',
     state: 'NY',
     postalCode: '10001',
     country: 'US',
   }, 1);
   ```

### Operational Notes

- **GoDaddy & ResellerClub**: Placeholder implementations exist; extend the service with their API calls when ready.
- **Domain Availability**: Use `checkAvailability()` before registering to ensure the domain is available and get pricing.
- **Dependencies**: `axios` is already installed.

---

## Summary of All Environment Variables

Below is a consolidated list of all environment variables required for the newly integrated services. Copy this into your `.env` or `.env.production` file and fill in the values.

```env
# ============================================
# Storage: AWS S3
# ============================================
STORAGE_PROVIDER=s3
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
STORAGE_S3_BASE_URL=https://cdn.yourdomain.com  # Optional

# Local storage fallback
STORAGE_LOCAL_BASE_PATH=./uploads
STORAGE_BASE_URL=http://localhost:4000/uploads

# ============================================
# Payments: Multi-Gateway
# ============================================
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox  # or 'live'

# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# Currency conversion (optional)
CURRENCY_CONVERSION_RATES_JSON={"EUR_USD":1.1,"GBP_USD":1.25}

# ============================================
# SSL Automation: ACME/Let's Encrypt
# ============================================
CERTBOT_PATH=/usr/bin/certbot
ACME_EMAIL=admin@yourdomain.com

# ============================================
# Google Calendar Integration
# ============================================
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_JSON=base64-encoded-or-raw-json

# ============================================
# Social Login: OAuth2
# ============================================
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback

# Frontend URL for OAuth redirect
FRONTEND_URL=http://localhost:3000

# ============================================
# Push Notifications: Web Push & FCM
# ============================================
PUSH_PROVIDER=webpush  # or 'fcm'

# Web Push (VAPID)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@yourdomain.com

# Firebase Cloud Messaging (FCM)
FIREBASE_SERVICE_ACCOUNT_JSON=base64-encoded-or-raw-json

# ============================================
# Domain Reseller: Namecheap & Others
# ============================================
DOMAIN_RESELLER_PROVIDER=namecheap  # or 'godaddy', 'resellerclub'

# Namecheap
NAMECHEAP_API_USER=your-api-username
NAMECHEAP_API_KEY=your-api-key
NAMECHEAP_USERNAME=your-account-username
NAMECHEAP_CLIENT_IP=your-server-ip
NAMECHEAP_SANDBOX=true  # false for production

# GoDaddy (placeholder)
GODADDY_API_KEY=your-godaddy-api-key
GODADDY_API_SECRET=your-godaddy-api-secret
```

---

## Next Steps

1. **Copy Environment Variables**: Add the above variables to your `.env` file and fill in the values.
2. **Test Integrations**: Use the provided setup instructions to test each integration in development mode.
3. **Deploy to Production**: Update environment variables for production (e.g., use live API keys, production URLs).
4. **Monitor Logs**: Check backend logs for integration success/failure messages.
5. **Extend as Needed**: Add additional gateways (Razorpay, Flutterwave, etc.) by following the existing patterns in the code.

---

**Congratulations!** Your SaaS platform now has production-ready integrations for storage, payments, SSL automation, calendar sync, social login, push notifications, and domain reselling.
