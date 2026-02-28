# Production Deployment Checklist

## ✅ Completed Production Hardening

### 1. Payment Provider Integration ✓

**Stripe Configuration:**
- ✅ Backend webhook handlers for `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `customer.subscription.deleted`
- ✅ Invoice status updates: `markAsPaid`, `markAsFailed`, `refund`
- ✅ Subscription status updates: `renewSubscription`, `updateStatus` to `CANCELLED`
- ✅ Failed payment tracking with `PAST_DUE` status after 3 failures
- ✅ Metadata-driven invoice lookup using `metadata.invoiceId`
- ✅ Frontend Stripe Elements checkout with `CardElement` and `confirmCardPayment`
- ✅ Error handling for card declines, expired cards, insufficient funds, etc.

**Razorpay Configuration:**
- ✅ Backend webhook handlers for `payment.authorized`, `payment.failed`, `refund.created`, `subscription.cancelled`
- ✅ Invoice and subscription updates using `notes.invoiceId` and `notes.tenantId`
- ✅ Redirect flow to Razorpay hosted checkout page

### 2. Affiliate Commission System ✓

**Commission Recording:**
- ✅ Automatic commission recording in webhooks for both Stripe and Razorpay
- ✅ 30% default commission rate (configurable via `REFERRAL_COMMISSION_PERCENT`)
- ✅ Invoice correlation: webhooks now store `invoiceId` and `invoiceNumber` in commission metadata
- ✅ Frontend displays commission amounts in Payment History (30% of invoice amount)
- ✅ Affiliate Dashboard shows source invoice numbers for COMMISSION ledger entries

**Visibility:**
- ✅ "Commissions from this invoice" badges on Billing Dashboard payment history
- ✅ Provider badges (STRIPE/RAZORPAY) on affiliate ledger entries
- ✅ "from invoice INV-xxx" text in affiliate ledger for transparency

### 3. User Experience & Error Handling ✓

**Checkout Flow:**
- ✅ Provider selection (Stripe vs Razorpay) in Pricing confirmation dialog
- ✅ In-app Stripe checkout with real-time card validation
- ✅ Specific error messages for common card decline scenarios:
  - Card declined
  - Expired card
  - Incorrect CVC
  - Insufficient funds
  - Invalid card number
  - Invalid expiration date
- ✅ Processing state handling with informative messages
- ✅ Webhook delay messaging ("Payment is being processed")

**Payment Status Visibility:**
- ✅ Latest payment status alert on Billing Dashboard
- ✅ Color-coded status chips (PAID=success, FAILED=error, PROCESSING=info, PENDING=warning)
- ✅ "Refresh status" button for real-time updates without page reload
- ✅ Payment & Plan History section showing recent 5 invoices with:
  - Invoice number, date, amount, currency
  - Status and provider badges
  - "Current plan activation" highlighting
  - "Affiliate referral" and commission badges
  - Deep linking to invoice details with `?invoiceId=` parameter

### 4. Environment Configuration ✓

**Backend (.env.production):**
- ✅ Created comprehensive `.env.production.example` template with:
  - Stripe keys: `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Razorpay keys: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
  - Affiliate config: `REFERRAL_COMMISSION_PERCENT=30`, `MIN_PAYOUT_AMOUNT=100`
  - Infrastructure: MongoDB URI, JWT secret, CORS origins, email SMTP, Sentry DSN, S3 bucket

**Frontend (.env.production):**
- ✅ Created `frontend/.env.production.example` template with:
  - `VITE_STRIPE_PUBLIC_KEY` (publishable key only)
  - `VITE_RAZORPAY_KEY_ID` (public key only)
  - `VITE_API_BASE_URL`
  - Feature flags

---

## 🔧 Required Before Production Launch

### Environment Variables

**Backend - Copy and update `.env.production.example`:**

```bash
# Navigate to project root
cp .env.production.example .env.production

# Edit .env.production with your real keys:
# - Replace STRIPE_SECRET_KEY with sk_live_...
# - Replace STRIPE_WEBHOOK_SECRET with whsec_... (from Stripe webhook dashboard)
# - Replace RAZORPAY_KEY_ID with rzp_live_...
# - Replace RAZORPAY_KEY_SECRET with real secret
# - Add production MongoDB connection string
# - Generate strong JWT_SECRET
# - Configure email SMTP credentials
# - Add Sentry DSN for error monitoring
# - Configure S3 bucket for file uploads
```

**Frontend - Copy and update `frontend/.env.production.example`:**

```bash
cd frontend
cp .env.production.example .env.production

# Edit frontend/.env.production with:
# - VITE_STRIPE_PUBLIC_KEY=pk_live_... (publishable key only)
# - VITE_RAZORPAY_KEY_ID=rzp_live_... (public key only)
# - VITE_API_BASE_URL=https://api.yourdomain.com
```

### Stripe Setup

1. **Get Production Keys:**
   - Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Switch to "View Live Data" mode
   - Go to Developers → API Keys
   - Copy "Publishable key" (pk_live_...) → `STRIPE_PUBLIC_KEY` and `VITE_STRIPE_PUBLIC_KEY`
   - Reveal and copy "Secret key" (sk_live_...) → `STRIPE_SECRET_KEY`

2. **Configure Webhooks:**
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://api.yourdomain.com/billing/payment-webhook/stripe`
   - Select events to listen to:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
     - `customer.subscription.deleted`
   - Copy "Signing secret" (whsec_...) → `STRIPE_WEBHOOK_SECRET`

3. **Test Webhook Locally (Optional):**
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3000/billing/payment-webhook/stripe
   
   # Trigger test events
   stripe trigger payment_intent.succeeded
   stripe trigger payment_intent.payment_failed
   ```

### Razorpay Setup

1. **Get Production Keys:**
   - Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Go to Settings → API Keys → Generate Live Mode Keys
   - Copy "Key ID" (rzp_live_...) → `RAZORPAY_KEY_ID` and `VITE_RAZORPAY_KEY_ID`
   - Reveal and copy "Key Secret" → `RAZORPAY_KEY_SECRET`

2. **Configure Webhooks:**
   - Go to Settings → Webhooks
   - Create New Webhook
   - Webhook URL: `https://api.yourdomain.com/billing/payment-webhook/razorpay`
   - Secret: Generate a random secret → `RAZORPAY_WEBHOOK_SECRET`
   - Active Events:
     - `payment.authorized`
     - `payment.failed`
     - `refund.created`
     - `subscription.cancelled`

### Database Setup

1. **MongoDB Production:**
   - Use MongoDB Atlas for managed hosting
   - Create production cluster with auto-scaling
   - Configure IP whitelist for your server
   - Enable backup and point-in-time recovery
   - Copy connection string → `MONGO_URI`

2. **Run Migrations:**
   ```bash
   npm run migration:run
   ```

### Email Configuration

Configure SMTP settings in `.env.production`:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### Security Checklist

- [ ] Generate strong `JWT_SECRET` (32+ random characters)
- [ ] Set `JWT_EXPIRES_IN=7d` or shorter for production
- [ ] Configure `CORS_ORIGIN` to your frontend domain only
- [ ] Enable HTTPS on all endpoints
- [ ] Set `NODE_ENV=production`
- [ ] Configure rate limiting
- [ ] Enable Helmet.js security headers
- [ ] Review and update `ALLOWED_TENANT_SUBDOMAINS` pattern

### Monitoring & Logging

1. **Sentry Error Tracking:**
   - Sign up at [Sentry.io](https://sentry.io)
   - Create new project for Node.js
   - Copy DSN → `SENTRY_DSN`

2. **Application Logs:**
   - Logs are written to `backend/logs/` directory
   - Configure log rotation in `ecosystem.config.js`
   - Consider centralized logging (e.g., CloudWatch, Datadog)

3. **Health Checks:**
   - Backend health endpoint: `/health`
   - Monitor webhook processing times
   - Set up alerts for failed payments

### File Storage

Configure S3 for production file uploads:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-saas-production-uploads
```

---

## 🧪 Testing Checklist

### Local Smoke Test (Pre-Deploy)

Run these from the repository root on the target build machine (or a matching environment). These steps are designed to be Windows-safe and reduce the chance of `EMFILE` by batching Jest test execution.

```bash
# 1) Full verification (backend typecheck + build + batched tests; frontend build + unit tests)
npm run verify:batched

# 2) Production env sanity checks (fails fast on missing critical env)
npm run preflight:prod

# 3) Optional: bring up dev dependencies locally
docker compose up -d mongodb redis

# 4) Optional: production-like local run
npm run backend:prod
npm run frontend:prod
```

### Payment Flow Testing

**Stripe Test Cards (use these in test mode):**

| Card Number          | Scenario                  | Expected Outcome         |
|---------------------|---------------------------|--------------------------|
| 4242 4242 4242 4242 | Successful payment        | Invoice marked PAID      |
| 4000 0000 0000 9995 | Card declined             | Invoice marked FAILED    |
| 4000 0000 0000 9987 | Expired card              | Error message shown      |
| 4000 0000 0000 0069 | Card expired this month   | Expiration error         |
| 4000 0000 0000 9979 | Stolen card               | Card declined            |

**Test Scenarios:**

1. **Successful Payment:**
   - [ ] Select plan on Pricing page
   - [ ] Choose Stripe provider
   - [ ] Enter test card 4242 4242 4242 4242
   - [ ] Complete payment
   - [ ] Verify invoice status changes to PAID on Billing Dashboard
   - [ ] Verify subscription status is ACTIVE
   - [ ] Check webhook logs for `payment_intent.succeeded` event

2. **Failed Payment:**
   - [ ] Use declined card 4000 0000 0000 9995
   - [ ] Verify user-friendly error message displayed
   - [ ] Verify invoice status is FAILED
   - [ ] Verify subscription remains in current state
   - [ ] Retry with valid card and verify recovery

3. **Webhook Delays:**
   - [ ] Complete payment and immediately check dashboard
   - [ ] Verify "PROCESSING" status shown if webhook hasn't arrived
   - [ ] Click "Refresh status" after webhook processes
   - [ ] Verify status updates to PAID

4. **Affiliate Commission:**
   - [ ] Create referral link from Affiliate Dashboard
   - [ ] Sign up new tenant using referral link
   - [ ] Complete subscription purchase with that tenant
   - [ ] Verify commission appears in affiliate's ledger
   - [ ] Verify "from invoice INV-xxx" shown in ledger
   - [ ] Verify commission badge on Billing Dashboard payment history
   - [ ] Verify commission amount is 30% of invoice amount

5. **Payment History:**
   - [ ] Complete multiple payments (mix of PAID/FAILED)
   - [ ] Verify recent 5 invoices shown on Billing Dashboard
   - [ ] Verify status chips have correct colors
   - [ ] Verify provider badges show STRIPE/RAZORPAY
   - [ ] Click "View & Download" and verify invoice details dialog opens
   - [ ] Verify URL has `?invoiceId=` parameter

6. **Deep Linking:**
   - [ ] Click invoice from payment history
   - [ ] Verify navigated to `/app/billing/invoices?invoiceId=xxx`
   - [ ] Verify invoice details dialog auto-opens
   - [ ] Close dialog and verify query param removed

### Razorpay Testing

1. **Successful Payment:**
   - [ ] Select plan and choose Razorpay
   - [ ] Verify redirect to Razorpay hosted page
   - [ ] Complete payment (use Razorpay test mode)
   - [ ] Verify invoice marked PAID after webhook
   - [ ] Verify subscription ACTIVE

2. **Failed Payment:**
   - [ ] Initiate payment and close Razorpay popup
   - [ ] Verify invoice remains PROCESSING or PENDING
   - [ ] Check webhook for `payment.failed` event

### Subscription Management Testing

1. **Plan Upgrade:**
   - [ ] Start with Basic plan
   - [ ] Upgrade to Pro plan
   - [ ] Verify new invoice created
   - [ ] Verify subscription plan updated
   - [ ] Verify payment processed

2. **Plan Downgrade:**
   - [ ] Downgrade from Pro to Basic
   - [ ] Verify prorated credit or next billing cycle change
   - [ ] Verify subscription updated

3. **Cancellation:**
   - [ ] Cancel subscription
   - [ ] Verify status changes to CANCELLED
   - [ ] Verify auto-renewal disabled
   - [ ] Verify subscription webhook received

4. **Failed Renewal (3 attempts):**
   - [ ] Simulate 3 failed payment attempts
   - [ ] Verify subscription status changes to PAST_DUE after 3rd failure
   - [ ] Verify notification sent to user

### Error Handling Testing

**Card Errors:**
- [ ] Incorrect CVC: Verify specific error message
- [ ] Expired card: Verify expiration error message
- [ ] Insufficient funds: Verify funds error message
- [ ] Invalid card number: Verify validation error

**System Errors:**
- [ ] Missing clientSecret: Verify redirect to billing with error
- [ ] Network timeout: Verify retry option shown
- [ ] Webhook signature mismatch: Verify 401 response in logs
- [ ] Missing metadata: Verify graceful degradation

### Load Testing

```bash
cd backend/load-tests
npm install -g artillery
artillery run payment-flow.yml
```

**Metrics to Monitor:**
- Response time < 2s for checkout page
- Response time < 500ms for webhook endpoints
- No errors under 100 concurrent users
- Database query time < 100ms

---

## 🚀 Deployment Steps

### Backend Deployment

1. **Build:**
   ```bash
   npm run build
   ```

2. **Deploy (using PM2):**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

3. **Verify:**
   ```bash
   curl https://api.yourdomain.com/health
   pm2 logs
   ```

### Frontend Deployment

1. **Build:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to CDN/Static Host:**
   - **Vercel:**
     ```bash
     vercel --prod
     ```
   - **Netlify:**
     ```bash
     netlify deploy --prod
     ```
   - **S3 + CloudFront:**
     ```bash
     aws s3 sync dist/ s3://your-bucket --delete
     aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
     ```

3. **Verify:**
   - Visit `https://yourdomain.com`
   - Check browser console for errors
   - Verify API calls work (check Network tab)

### Database Backup

```bash
# Automated daily backups (add to crontab)
0 2 * * * mongodump --uri="$MONGO_URI" --out=/backups/$(date +\%Y\%m\%d)
```

---

## 📊 Post-Launch Monitoring

### Daily Checks

- [ ] Review Sentry error reports
- [ ] Check payment success rate (target: >95%)
- [ ] Monitor webhook processing times
- [ ] Review failed payment logs
- [ ] Check affiliate commission accuracy

### Weekly Checks

- [ ] Analyze payment decline reasons
- [ ] Review subscription churn rate
- [ ] Verify payout requests processed
- [ ] Check database growth and performance
- [ ] Review load times and performance metrics

### Monthly Checks

- [ ] Review Stripe/Razorpay reconciliation
- [ ] Audit affiliate commissions vs actual payments
- [ ] Analyze conversion funnel (pricing → checkout → paid)
- [ ] Review and optimize slow queries
- [ ] Update dependencies and security patches

---

## 🆘 Troubleshooting

### Common Issues

**Webhook Not Received:**
- Verify webhook URL is publicly accessible
- Check webhook logs in Stripe/Razorpay dashboard
- Verify webhook secret matches `.env` value
- Check server firewall rules

**Payment Fails But Webhook Shows Success:**
- Check server logs for webhook processing errors
- Verify database write permissions
- Check for transaction rollback issues

**Affiliate Commission Not Recorded:**
- Verify metadata includes `invoiceId` and `referralCode`
- Check webhook logs for commission recording
- Verify affiliate exists in database
- Check for invoice lookup failures

**Frontend Shows Stale Data:**
- Click "Refresh status" button
- Clear browser cache
- Verify API endpoint responses
- Check CORS configuration

---

## 📝 Next Steps

After completing this checklist:

1. ✅ **Run Full Test Suite:**
   ```bash
   npm run test
   npm run test:e2e
   ```

2. ✅ **Perform Staging Deployment:**
   - Deploy to staging environment
   - Run all manual tests with production-like data
   - Load test with realistic traffic patterns

3. ✅ **Go Live:**
   - Deploy to production
   - Monitor for 24 hours continuously
   - Have rollback plan ready

4. ✅ **Post-Launch:**
   - Announce launch to stakeholders
   - Set up on-call rotation for payment issues
   - Document lessons learned

---

**Status:** ✅ ALL PRODUCTION HARDENING TASKS COMPLETE

**Ready for Launch:** YES (pending environment variable configuration and final testing)

**Documentation Updated:** 2024

---

## Support

For deployment issues or questions:
- Review logs in `backend/logs/`
- Check Sentry error tracking
- Review webhook delivery logs in Stripe/Razorpay dashboards
- Monitor PM2 process status: `pm2 monit`
