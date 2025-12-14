# Billing & Subscription System Documentation

## Overview

The Billing module provides a complete subscription and billing system for the multi-tenant SaaS platform, supporting:

- **Multiple Plans**: Create and manage subscription plans with flexible pricing (monthly/yearly)
- **Flexible Subscriptions**: Tenant subscription management with trial periods, plan changes, and cancellations
- **Invoice Management**: Automatic invoice generation with payment tracking
- **Payment Gateways**: Stripe and Razorpay integration (ready for production implementation)
- **Plan Limits**: Enforce feature limits per plan (users, products, orders, storage)
- **Plan Enforcement Middleware**: Automatically prevent resource creation when limits are exceeded

---

## Database Schemas

### Plan Schema
Represents a subscription plan offering.

**Fields:**
```typescript
- _id: ObjectId
- name: string (unique, required)
- slug: string (unique, indexed, required) // URL-friendly identifier
- description: string
- priceMonthly: number // Monthly price in cents (0 = free)
- priceYearly: number // Yearly price in cents (0 = free)
- features: string[] // List of feature descriptions
- userLimit?: number // Max users per tenant (-1 = unlimited)
- storageLimitMB?: number // Max storage in MB (-1 = unlimited)
- ordersLimit?: number // Max orders per tenant (-1 = unlimited)
- productsLimit?: number // Max products per tenant (-1 = unlimited)
- isActive: boolean (default: true)
- stripePriceIds?: { monthly?: string; yearly?: string }
- razorpayPlanIds?: { monthly?: string; yearly?: string }
- displayOrder: number (default: 0) // For sorting plans on frontend
- createdAt: Date (auto)
- updatedAt: Date (auto)
```

**Indexes:**
- `slug` (unique)
- `isActive`

**Example Plan:**
```json
{
  "name": "Professional",
  "slug": "professional",
  "description": "For growing teams",
  "priceMonthly": 4999, // ₹49.99
  "priceYearly": 49999, // ₹499.99 (savings!)
  "features": ["10 team members", "100 products", "10,000 orders/month", "100GB storage"],
  "userLimit": 10,
  "productsLimit": 100,
  "ordersLimit": 10000,
  "storageLimitMB": 102400, // 100GB
  "stripePriceIds": { "monthly": "price_1234", "yearly": "price_5678" }
}
```

---

### Subscription Schema
Represents a tenant's subscription to a plan.

**Enums:**
```typescript
enum SubscriptionStatus {
  TRIAL = 'TRIAL',           // In trial period
  ACTIVE = 'ACTIVE',         // Active paid subscription
  PAST_DUE = 'PAST_DUE',     // Failed payment, retrying
  CANCELLED = 'CANCELLED',   // Cancelled by tenant
  EXPIRED = 'EXPIRED',       // Trial ended without subscription
}

enum BillingPeriod {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}
```

**Fields:**
```typescript
- _id: ObjectId
- tenantId: ObjectId (indexed, required) // Foreign key to Tenant
- planId: ObjectId (required) // Foreign key to Plan
- status: SubscriptionStatus (default: TRIAL)
- billingPeriod: BillingPeriod (required) // MONTHLY or YEARLY
- startedAt: Date (auto, required)
- renewAt: Date (required) // When subscription renews
- trialEndsAt?: Date // When trial expires (null for free plans)
- cancelAtPeriodEnd: boolean (default: false) // Graceful cancellation
- cancelledAt?: Date
- amountPaid: number (total paid in cents)
- currency: string (default: 'INR')
- failedPaymentCount: number (default: 0) // Track retry attempts
- stripeSubscriptionId?: string
- razorpaySubscriptionId?: string
- paymentMethod?: 'STRIPE' | 'RAZORPAY' | 'MANUAL'
- createdAt: Date (auto)
- updatedAt: Date (auto)
```

**Indexes:**
- `tenantId` (for quick lookups)
- `status` (for status queries)
- `renewAt` (for finding subscriptions to renew)
- Composite `(tenantId, status)` (for active subscriptions per tenant)

**Trial Logic:**
```
If plan is free (priceMonthly == 0 && priceYearly == 0):
  → Status: ACTIVE
  → trialEndsAt: null
  → renewAt: startedAt + 1 month/12 months

If plan is paid:
  → Status: TRIAL
  → trialEndsAt: startedAt + 14 days
  → renewAt: trialEndsAt (renewal at end of trial)
```

---

### Invoice Schema
Represents a billing invoice for a subscription renewal or one-time charge.

**Enums:**
```typescript
enum InvoiceStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',        // Awaiting payment
  FAILED = 'FAILED',          // Payment failed
  REFUNDED = 'REFUNDED',      // Fully or partially refunded
  PROCESSING = 'PROCESSING',  // Payment processing
}
```

**Fields:**
```typescript
- _id: ObjectId
- tenantId: ObjectId (indexed, required)
- subscriptionId: ObjectId (required) // Foreign key to Subscription
- planId: ObjectId (required)
- invoiceNumber: string (unique, indexed) // Format: INV-YYYY-RANDOMDIGITS
- amount: number (in cents, required)
- currency: string (default: 'INR')
- description?: string
- paidOn?: Date
- dueDate: Date (default: createdAt + 30 days)
- status: InvoiceStatus (default: PENDING)
- paymentMethod?: 'STRIPE' | 'RAZORPAY' | 'MANUAL'
- transactionId?: string // Unique transaction ID from payment provider
- stripeInvoiceId?: string
- razorpayPaymentId?: string
- lineItems: Array<{
    description: string;
    quantity: number;
    amount: number; // Price per unit in cents
  }>
- refundedAmount: number (default: 0)
- refundedOn?: Date
- notes?: string (e.g., "Refund due to customer request")
- createdAt: Date (auto)
- updatedAt: Date (auto)
```

**Indexes:**
- `tenantId`
- `invoiceNumber` (unique)
- `status`
- `paidOn`
- Composite `(tenantId, status)` (for unpaid invoices per tenant)

---

## API Endpoints

### Plans (Public + Admin)

#### Get All Active Plans
```
GET /plans
Response: Array of active plans with features and pricing
```

#### Get Plan by ID
```
GET /plans/:id
Response: Single plan details
```

#### Create Plan (Super Admin)
```
POST /plans
Headers: Authorization: Bearer <token>
Body: CreatePlanDto
Response: 201 Created
```

**CreatePlanDto:**
```typescript
{
  name: string,
  slug: string,
  description: string,
  priceMonthly: number,
  priceYearly: number,
  features: string[],
  userLimit?: number,
  storageLimitMB?: number,
  ordersLimit?: number,
  productsLimit?: number,
  isActive: boolean,
  stripePriceIds?: { monthly?: string; yearly?: string },
  razorpayPlanIds?: { monthly?: string; yearly?: string },
  displayOrder?: number,
}
```

#### Update Plan (Super Admin)
```
PATCH /plans/:id
Headers: Authorization: Bearer <token>
Body: UpdatePlanDto (all fields optional)
Response: 200 Updated plan
```

#### Deactivate Plan (Super Admin)
```
DELETE /plans/:id
Headers: Authorization: Bearer <token>
Response: 200 Plan deactivated (soft delete)
```

---

### Subscriptions (Tenant)

#### Subscribe to Plan
```
POST /subscriptions/subscribe
Headers: Authorization: Bearer <token>
Body: SubscribeDto
Response: 201 Subscription created
```

**SubscribeDto:**
```typescript
{
  planId: string,
  billingPeriod: 'MONTHLY' | 'YEARLY',
  paymentMethodId?: string,
}
```

**Response:**
```json
{
  "_id": "subscription_id",
  "tenantId": "tenant_id",
  "planId": "plan_id",
  "status": "TRIAL",
  "billingPeriod": "MONTHLY",
  "startedAt": "2024-01-01T00:00:00Z",
  "renewAt": "2024-02-01T00:00:00Z",
  "trialEndsAt": "2024-01-15T00:00:00Z",
  "amountPaid": 0
}
```

#### Get Current Subscription
```
GET /subscriptions/current
Headers: Authorization: Bearer <token>
Response: 200 Current subscription details
```

#### Change/Upgrade/Downgrade Plan
```
PATCH /subscriptions/change-plan
PATCH /subscriptions/upgrade
PATCH /subscriptions/downgrade

Headers: Authorization: Bearer <token>
Body: ChangePlanDto
Response: 200 Subscription updated with new plan
```

**ChangePlanDto:**
```typescript
{
  newPlanId: string,
  billingPeriod: 'MONTHLY' | 'YEARLY',
}
```

#### Cancel Subscription
```
PATCH /subscriptions/cancel?atPeriodEnd=true|false
Headers: Authorization: Bearer <token>
Response: 200 Subscription cancelled
```

- `atPeriodEnd=true`: Cancel at next renewal (graceful)
- `atPeriodEnd=false`: Cancel immediately (status: CANCELLED)

---

### Invoices (Tenant)

#### Get Invoices List
```
GET /invoices?page=1&limit=50
Headers: Authorization: Bearer <token>
Response: 200 Paginated invoice list
```

#### Get Invoice Details
```
GET /invoices/:invoiceId
Headers: Authorization: Bearer <token>
Response: 200 Invoice details
```

---

### Payment Webhooks (No Auth Required)

#### Stripe Webhook
```
POST /payments/webhook/stripe
Headers: stripe-signature: t=...,v1=...
Body: Stripe webhook event

Handled Events:
- payment_intent.succeeded → Mark invoice as PAID
- payment_intent.payment_failed → Mark invoice as FAILED
- charge.refunded → Process refund
- customer.subscription.deleted → Cancel subscription
```

#### Razorpay Webhook
```
POST /payments/webhook/razorpay
Headers: x-razorpay-signature: ...
Body: Razorpay webhook event

Handled Events:
- payment.authorized → Mark invoice as PAID
- payment.failed → Mark invoice as FAILED
- refund.created → Process refund
- subscription.cancelled → Cancel subscription
```

---

## Services

### PlansService

**Methods:**

```typescript
// Create new plan
create(createPlanDto: CreatePlanDto): Promise<Plan>

// Get all active plans (sorted by displayOrder)
findAll(): Promise<Plan[]>

// Get all plans including inactive (admin view)
findAllIncludingInactive(): Promise<Plan[]>

// Get plan by ID
findById(id: string): Promise<Plan>

// Get plan by URL slug
findBySlug(slug: string): Promise<Plan>

// Update plan (validates slug uniqueness)
update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan>

// Soft delete plan
deactivate(id: string): Promise<Plan>

// Hard delete plan
delete(id: string): Promise<void>
```

---

### SubscriptionsService

**Methods:**

```typescript
// Create subscription with trial logic
create(tenantId: string, subscribeDto: SubscribeDto): Promise<Subscription>

// Get current subscription (any status)
findByTenantId(tenantId: string): Promise<Subscription>

// Get active subscription (TRIAL or ACTIVE only)
findActiveByTenantId(tenantId: string): Promise<Subscription>

// Upgrade/downgrade plan
changePlan(tenantId: string, changePlanDto: ChangePlanDto): Promise<Subscription>

// Cancel subscription (gracefully or immediately)
cancelSubscription(tenantId: string, cancelAtPeriodEnd?: boolean): Promise<Subscription>

// Update subscription status
updateStatus(tenantId: string, status: SubscriptionStatus): Promise<Subscription>

// Process renewal (called by cron job or webhook)
renewSubscription(subscriptionId: string): Promise<Subscription>
```

**Trial Logic Implementation:**
```typescript
// Free plans: no trial
if (plan.priceMonthly === 0 && plan.priceYearly === 0) {
  subscription.status = SubscriptionStatus.ACTIVE;
  subscription.trialEndsAt = null;
  subscription.renewAt = addMonths(startedAt, 1);
}

// Paid plans: 14-day trial
if (plan.priceMonthly > 0 || plan.priceYearly > 0) {
  subscription.status = SubscriptionStatus.TRIAL;
  subscription.trialEndsAt = addDays(startedAt, 14);
  subscription.renewAt = subscription.trialEndsAt;
}
```

---

### InvoicesService

**Methods:**

```typescript
// Create invoice (auto-generates invoice number)
create(
  tenantId: string,
  subscriptionId: string,
  planId: string,
  amount: number,
  description?: string,
): Promise<Invoice>

// Get invoices for tenant (paginated)
findByTenantId(tenantId: string, limit?: number, page?: number): Promise<{
  invoices: Invoice[];
  total: number;
  pages: number;
}>

// Get invoice by ID (tenant-scoped)
findById(invoiceId: string, tenantId: string): Promise<Invoice>

// Mark invoice as paid
markAsPaid(invoiceId: string, transactionId?: string, paymentMethod?: string): Promise<Invoice>

// Mark invoice as failed
markAsFailed(invoiceId: string): Promise<Invoice>

// Refund invoice
refund(invoiceId: string, amount: number): Promise<Invoice>
```

**Invoice Number Generation:**
```typescript
// Format: INV-YYYY-RANDOMDIGITS
const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.random().toString().substr(2, 9)}`;
```

---

### PaymentService

**Methods:**

```typescript
// Create Stripe payment intent
createStripePaymentIntent(amount: number, currency?: string): Promise<PaymentIntent>

// Create Razorpay order
createRazorpayOrder(amount: number, currency?: string): Promise<PaymentIntent>

// Confirm Stripe payment
confirmStripePayment(paymentIntentId: string): Promise<PaymentConfirmation>

// Confirm Razorpay payment
confirmRazorpayPayment(paymentId: string, orderId: string): Promise<PaymentConfirmation>

// Refund Stripe payment
refundStripePayment(paymentIntentId: string, amount?: number): Promise<RefundResult>

// Refund Razorpay payment
refundRazorpayPayment(paymentId: string, amount?: number): Promise<RefundResult>

// Get Stripe public key for frontend
getStripePublicKey(): string

// Get Razorpay key for frontend
getRazorpayKeyId(): string

// Check which gateways are available
getAvailableGateways(): { stripe: boolean; razorpay: boolean }
```

---

## Plan Limits Enforcement

### PlanLimitsMiddleware

The middleware automatically enforces plan limits on resource creation:

**Protected Routes:**
- `POST /users` - Check user limit
- `POST /products` - Check product limit
- `POST /orders` - Check order limit

**Behavior:**

When a tenant tries to create a resource:

1. Fetches tenant's active subscription
2. Gets the subscribed plan details
3. Checks if tenant has exceeded the limit
4. Returns `402 Payment Required` if limit exceeded
5. Allows request if within limits

**Example Response (Limit Exceeded):**
```json
{
  "statusCode": 402,
  "message": "User limit (10) exceeded. Upgrade your plan to add more users.",
  "error": "USER_LIMIT_EXCEEDED",
  "currentCount": 10,
  "limit": 10
}
```

**Limit Values:**
- `-1` = Unlimited
- `null` = No limit
- `number` = Hard limit

---

## Environment Variables

```bash
# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Database
DATABASE_URL=mongodb://localhost:27017/saas-app
```

---

## Example: Full Subscription Flow

### 1. Create a Plan (Admin)
```bash
POST /plans
{
  "name": "Premium",
  "slug": "premium",
  "priceMonthly": 9999,
  "priceYearly": 99999,
  "userLimit": 50,
  "productsLimit": 500,
  "ordersLimit": 50000
}
```

### 2. List Available Plans (Public)
```bash
GET /plans
```

### 3. Subscribe to Plan (Tenant)
```bash
POST /subscriptions/subscribe
{
  "planId": "plan_123abc",
  "billingPeriod": "MONTHLY"
}
→ Status: TRIAL (14-day trial)
→ renewAt: 14 days from now
```

### 4. Check Current Subscription
```bash
GET /subscriptions/current
```

### 5. Attempt to Create User (Enforced by Middleware)
```bash
POST /users
→ If at user limit: 402 Payment Required
→ If within limit: 201 Created
```

### 6. Payment Processing (Stripe/Razorpay Webhook)
```
Webhook: payment_intent.succeeded
→ Update Invoice: status = PAID
→ Update Subscription: status = ACTIVE
```

### 7. Upgrade Plan
```bash
PATCH /subscriptions/change-plan
{
  "newPlanId": "plan_456def",
  "billingPeriod": "YEARLY"
}
→ Subscription updated with new plan
→ Renewal date reset
```

### 8. Cancel Subscription
```bash
PATCH /subscriptions/cancel?atPeriodEnd=true
→ Subscription: status = CANCELLED (at period end)
→ At renewal time: Subscription expires, features disabled
```

---

## Production Checklist

- [ ] Install Stripe/Razorpay SDKs: `npm install stripe razorpay`
- [ ] Add environment variables to `.env`
- [ ] Implement actual Stripe/Razorpay calls in `PaymentService` (replace mock implementations)
- [ ] Verify webhook signatures in `PaymentWebhookController`
- [ ] Set up payment webhook URLs in Stripe/Razorpay dashboards
- [ ] Create cron job to process subscription renewals (`renewSubscription` task)
- [ ] Create retry logic for failed payments
- [ ] Set up email notifications for payment failures/renewals
- [ ] Implement plan change proration logic (charge/refund for mid-cycle changes)
- [ ] Add tests for all services and controllers
- [ ] Set up monitoring/logging for payment events
- [ ] Add rate limiting to payment endpoints
- [ ] Configure CORS for webhook endpoints

---

## Testing

### Create Test Plan
```bash
curl -X POST http://localhost:3000/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Plan",
    "slug": "test-plan",
    "priceMonthly": 0,
    "priceYearly": 0,
    "features": ["Test feature"]
  }'
```

### Test Subscription Creation (Free Plan)
```bash
curl -X POST http://localhost:3000/subscriptions/subscribe \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_id",
    "billingPeriod": "MONTHLY"
  }'
```

### Test Plan Limits
```bash
# Create user (should succeed if within limit)
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

---

## Troubleshooting

**Issue: "Tenant already has an active subscription"**
- Solution: Cancel existing subscription first or upgrade instead

**Issue: "User limit exceeded" on valid creation**
- Check: Plan userLimit might be set incorrectly or tenant count is wrong
- Solution: Upgrade plan or increase limit in admin

**Issue: Webhook not processing**
- Check: Verify webhook signature in controller (production)
- Check: Ensure webhook URL is public and accessible
- Check: Check logs for errors during event processing

---

## Architecture Diagram

```
┌─────────────┐
│   Tenant    │
└──────┬──────┘
       │
       ├─→ Subscription (ACTIVE/TRIAL/CANCELLED)
       │      │
       │      └─→ Plan (pricing, limits)
       │           │
       │           └─→ Line Items, Features
       │
       ├─→ Invoices (PAID/PENDING/FAILED)
       │      │
       │      └─→ Payment Gateway (Stripe/Razorpay)
       │
       └─→ Resources (Users, Products, Orders)
              │
              └─→ PlanLimitsMiddleware
                 (enforces plan limits)
```

---

## API Response Examples

### Subscribe Response (TRIAL)
```json
{
  "_id": "sub_abc123",
  "tenantId": "tenant_123",
  "planId": "plan_pro",
  "status": "TRIAL",
  "billingPeriod": "MONTHLY",
  "startedAt": "2024-01-01T00:00:00Z",
  "renewAt": "2024-01-15T00:00:00Z",
  "trialEndsAt": "2024-01-15T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "amountPaid": 0,
  "currency": "INR",
  "failedPaymentCount": 0
}
```

### Invoice Response (PENDING)
```json
{
  "_id": "inv_xyz789",
  "tenantId": "tenant_123",
  "subscriptionId": "sub_abc123",
  "planId": "plan_pro",
  "invoiceNumber": "INV-2024-123456789",
  "amount": 4999,
  "currency": "INR",
  "paidOn": null,
  "dueDate": "2024-02-01T00:00:00Z",
  "status": "PENDING",
  "paymentMethod": null,
  "lineItems": [
    {
      "description": "Professional Plan - Monthly",
      "quantity": 1,
      "amount": 4999
    }
  ]
}
```

---

## Next Steps

1. **Frontend Integration:**
   - Plans listing component
   - Subscription management UI
   - Payment form integration
   - Invoice history view

2. **Payment Gateway Integration:**
   - Replace mock PaymentService with real Stripe/Razorpay calls
   - Implement webhook verification
   - Add retry logic for failed payments

3. **Automation:**
   - Subscription renewal cron job
   - Failed payment retry schedule
   - Trial expiration notifications
   - Renewal reminders

4. **Analytics:**
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - Plan distribution
   - Revenue reports

---

**Last Updated:** 2024  
**Billing Module Version:** 1.0.0
