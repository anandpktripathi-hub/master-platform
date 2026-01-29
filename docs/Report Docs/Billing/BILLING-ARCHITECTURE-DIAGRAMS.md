# Billing System - Architecture & Data Flow

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUESTS                          │
└────────────────────┬─────────────────────────────────────────────┘
                     │
        ┌────────────┴──────────────┬──────────────┐
        │                           │              │
   ┌────▼──────┐        ┌──────────▼───┐    ┌────▼──────────┐
   │ Public    │        │  Authenticated│   │    Webhooks   │
   │ Endpoints │        │   Endpoints   │   │ (Unauthed)    │
   │           │        │               │   │               │
   │ GET /plans│        │POST /sub...  │   │POST /payments/│
   │ GET /plan │        │GET  /sub...  │   │ webhook/stripe│
   │  /:id     │        │PATCH /sub... │   │ webhook/razorp│
   └────┬──────┘        └──────┬───────┘   └────┬──────────┘
        │                      │                 │
        │         ┌────────────┴────────┐        │
        │         │                     │        │
   ┌────▼─────────▼──────────┬──────────▼────────▼──┐
   │      GUARDS & RBAC       │                      │
   │ • JwtAuthGuard           │ • Webhook Signature  │
   │ • RolesGuard (@Roles)    │   Verification      │
   │ • PermissionsGuard       │   (Production)       │
   │ • TenantGuard            │                      │
   └────┬──────────────────────┼─────────────────────┘
        │                      │
   ┌────▼──────────────────────▼─────────────────────┐
   │         PLAN LIMITS MIDDLEWARE                  │
   │                                                 │
   │ POST /users   → Check userLimit                │
   │ POST /products → Check productsLimit           │
   │ POST /orders   → Check ordersLimit             │
   │                                                 │
   │ Response: 402 Payment Required if exceeded     │
   └────┬──────────────────────┬─────────────────────┘
        │                      │
   ┌────▼──────────────────────▼─────────────────────────────┐
   │              BILLING CONTROLLERS                        │
   ├──────────────────────────────────────────────────────────┤
   │                                                          │
   │ PlansController              SubscriptionsController    │
   │  • POST /plans                • POST /sub/subscribe    │
   │  • PATCH /plans/:id            • GET /sub/current      │
   │  • DELETE /plans/:id           • PATCH /sub/change     │
   │  • GET /plans                  • PATCH /sub/cancel     │
   │  • GET /plans/:id                                      │
   │                                                          │
   │ InvoicesController          PaymentWebhookController   │
   │  • GET /invoices            • POST /payments/webhook/  │
   │  • GET /invoices/:id         stripe                    │
   │                             • POST /payments/webhook/  │
   │                              razorpay                   │
   └────┬──────────────────────────────────────────────────┬─┘
        │                                                  │
   ┌────▼───────────────────────────────────────────────────▼────┐
   │              BILLING SERVICES LAYER                         │
   ├────────────────────────────────────────────────────────────┤
   │                                                             │
   │ PlansService              SubscriptionsService             │
   │  • create()               • create() [TRIAL LOGIC]        │
   │  • findAll()              • findByTenantId()              │
   │  • findById()             • changePlan()                  │
   │  • findBySlug()           • cancelSubscription()          │
   │  • update()               • renewSubscription()           │
   │  • deactivate()           • updateStatus()                │
   │                                                             │
   │ InvoicesService           PaymentService                   │
   │  • create() [AUTO #]      • createStripeIntent()         │
   │  • findByTenantId()       • createRazorpayOrder()        │
   │  • findById()             • confirmPayment()              │
   │  • markAsPaid()           • refund()                      │
   │  • markAsFailed()         • getAvailableGateways()       │
   │  • refund()                                               │
   └────┬──────────────────────────────────────────────────┬────┘
        │                                                  │
   ┌────▼──────────────────────────────────────────────────▼────┐
   │                  DATA ACCESS LAYER                         │
   │              (Mongoose Models & Queries)                   │
   │                                                             │
   │ Plan      Subscription        Invoice                      │
   │ Model     Model               Model                        │
   └────┬──────────────────────────────────────────────────┬────┘
        │                                                  │
   ┌────▼──────────────────────────────────────────────────▼────┐
   │                      MONGODB                               │
   ├────────────────────────────────────────────────────────────┤
   │                                                             │
   │ plans (collection)                                         │
   │  • Indexes: slug, isActive                               │
   │                                                             │
   │ subscriptions (collection)                                 │
   │  • Indexes: tenantId, status, renewAt,                   │
   │            (tenantId, status)                            │
   │                                                             │
   │ invoices (collection)                                      │
   │  • Indexes: tenantId, invoiceNumber (unique),            │
   │            status, paidOn,                               │
   │            (tenantId, status)                            │
   └─────────────────────────────────────────────────────────────┘
```

---

## Request/Response Data Flow

### Flow 1: Subscribe to Plan

```
┌─────────────────┐
│  Frontend       │
│ Tenant User     │
└────────┬────────┘
         │
         │ POST /subscriptions/subscribe
         │ { planId, billingPeriod }
         │
         ▼
┌─────────────────────────────────────┐
│ SubscriptionsController             │
│  subscribe()                        │
└────────────┬────────────────────────┘
             │
             │ req.tenantId extracted
             │
             ▼
┌─────────────────────────────────────┐
│ SubscriptionsService                │
│  create(tenantId, subscribeDto)    │
│  {                                  │
│    1. Check no active subscription  │
│    2. Get plan details              │
│    3. Determine trial (14 days)     │
│    4. Set renewal date              │
│    5. Save to MongoDB               │
│  }                                  │
└────────────┬────────────────────────┘
             │
             │ Insert into subscriptions
             │
             ▼
┌─────────────────────────────────────┐
│ MongoDB: subscriptions collection   │
│                                     │
│ {                                   │
│   tenantId: ...,                    │
│   planId: ...,                      │
│   status: "TRIAL",                  │
│   startedAt: now,                   │
│   trialEndsAt: now + 14 days,      │
│   renewAt: now + 14 days            │
│ }                                   │
└────────────┬────────────────────────┘
             │
             │ Return subscription
             │
             ▼
┌─────────────────────────────────────┐
│ Frontend                            │
│ {                                   │
│   status: "TRIAL",                  │
│   trialEndsAt: "2024-01-15T00:00Z", │
│   renewAt: "2024-01-15T00:00Z"      │
│ }                                   │
└─────────────────────────────────────┘
```

### Flow 2: Create Invoice on Payment

```
┌──────────────────────────┐
│ Payment Gateway          │
│ (Stripe/Razorpay)        │
│ - Payment succeeds       │
│ - Webhook triggered      │
└────────┬─────────────────┘
         │
         │ POST /payments/webhook/stripe
         │ (or /razorpay)
         │
         ▼
┌──────────────────────────────────┐
│ PaymentWebhookController         │
│  handleStripeWebhook()           │
│  - Verify signature              │
│  - Extract payment event         │
│  - Route to handler              │
└────────┬─────────────────────────┘
         │
         │ payment_intent.succeeded
         │
         ▼
┌──────────────────────────────────┐
│ _handleStripePaymentSucceeded()  │
│  1. Find invoice by paymentId    │
│  2. Mark as PAID                 │
│  3. Update subscription: ACTIVE  │
└────────┬─────────────────────────┘
         │
         │ Update invoice + subscription
         │
         ▼
┌──────────────────────────────────┐
│ InvoicesService                  │
│  markAsPaid(invoiceId, ...)      │
└────────┬─────────────────────────┘
         │
         │ Save to MongoDB
         │
         ▼
┌──────────────────────────────────┐
│ MongoDB: invoices collection     │
│                                  │
│ {                                │
│   status: "PAID",                │
│   paidOn: now,                   │
│   transactionId: "pi_123...",     │
│   paymentMethod: "STRIPE"        │
│ }                                │
└──────────────────────────────────┘
```

### Flow 3: Enforce Plan Limits

```
┌─────────────────┐
│  Frontend       │
│ Tenant User     │
└────────┬────────┘
         │
         │ POST /users
         │ { email, name, role }
         │
         ▼
┌──────────────────────────┐
│ PlansLimitsMiddleware    │
│  use(req, res, next)     │
│  {                       │
│    1. Get tenantId       │
│    2. Get subscription   │
│    3. Get plan           │
│    4. Check userLimit    │
│  }                       │
└────────┬─────────────────┘
         │
         │ Count current users
         │ for this tenant
         │
         ▼
┌──────────────────────────────┐
│ MongoDB: users count         │
│  Filter: tenantId = ...      │
│  Result: 8 users             │
│  Limit: 10 users             │
└────────┬─────────────────────┘
         │
         │ 8 < 10 ✓ ALLOW
         │
         ▼
┌──────────────────────────┐
│ UsersController          │
│  create()                │
│  Creates user...         │
└────────┬─────────────────┘
         │
         │ 201 Created
         │
         ▼
┌─────────────────┐
│  Frontend       │
│  New user       │
│  created ✓      │
└─────────────────┘

---

Alternative: When limit exceeded:

┌──────────────────────────────┐
│ MongoDB: users count         │
│  Filter: tenantId = ...      │
│  Result: 10 users            │
│  Limit: 10 users             │
└────────┬─────────────────────┘
         │
         │ 10 >= 10 ✗ BLOCK
         │
         ▼
┌──────────────────────────────┐
│ Response: 402 Payment Required
│ {                            │
│   error: "USER_LIMIT_EXCEEDED",
│   message: "Limit (10) reached",
│   currentCount: 10,          │
│   limit: 10                  │
│ }                            │
└──────────────────────────────┘
```

---

## Subscription Lifecycle State Machine

```
                    ┌──────────────────┐
                    │    TRIAL         │ (14 days for paid plans)
                    │ (Paid plans)     │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   ACTIVE         │ (Paid plan continues)
                    │                  │
                    └────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
    ┌───────▼──────┐  ┌─────▼──────┐  ┌─────▼──────┐
    │   PAST_DUE   │  │ CANCELLED  │  │  EXPIRED   │
    │ (Failed      │  │ (User      │  │ (Trial     │
    │  payment)    │  │  cancelled)│  │  ended)    │
    └───────┬──────┘  └─────┬──────┘  └────────────┘
            │                │
            │    ┌───────────┘
            │    │
    ┌───────▼────▼──────┐
    │   CANCELLED       │ (Final state)
    │ (After retry      │
    │  failure or user) │
    └──────────────────┘

Key Transitions:
1. TRIAL → ACTIVE
   - Trigger: When trial ends (14 days pass)
   - Action: If no payment failure, activate subscription

2. ACTIVE → PAST_DUE
   - Trigger: Payment fails during renewal
   - Action: Mark invoice as FAILED, increment retry counter

3. ACTIVE/PAST_DUE → CANCELLED
   - Trigger: User cancels subscription
   - Action: Set cancelledAt = now, status = CANCELLED

4. TRIAL → EXPIRED
   - Trigger: Trial ends without payment
   - Action: Trial subscription without conversion to paid

Free Plans:
- Skip TRIAL entirely
- Go directly to ACTIVE
- Renew automatically without payment
```

---

## Data Model Relationships

```
┌─────────────────────────────────┐
│            Tenant               │
│                                 │
│ id: ObjectId                    │
│ name: string                    │
│ domain: string                  │
└────────────────┬────────────────┘
                 │
        ┌────────┴─────────────────┬──────────────┐
        │                          │              │
        │ (has one)                │              │
        │                          │              │
   ┌────▼─────────────┐  ┌────────▼───────┐  ┌──▼─────────────┐
   │  Subscription    │  │  Users         │  │  Products      │
   │                  │  │                │  │                │
   │ tenantId (FK)    │  │ tenantId (FK)  │  │ tenantId (FK)  │
   │ planId (FK)  ────┼──┼─→ Plan         │  │ tenantId (FK)  │
   │ status           │  │ role           │  │ category (FK)  │
   │ billingPeriod    │  │ email          │  │ name           │
   │ renewAt          │  │ isActive       │  │ price          │
   └────┬─────────────┘  └────────────────┘  └────────────────┘
        │
        │ (has many)
        │
   ┌────▼─────────────┐
   │   Invoice        │
   │                  │
   │ tenantId (FK)    │
   │ subscriptionId(FK)
   │ planId (FK)      │
   │ invoiceNumber    │
   │ amount           │
   │ status           │
   │ transactionId    │
   └────────────────┘

Legend:
  FK = Foreign Key
  ─┬─ = One-to-many relationship
  ─→ = Many-to-one relationship
```

---

## Service Interaction Diagram

```
                    ┌─────────────────┐
                    │    Controller   │
                    │                 │
                    │ PlansController │
                    │ SubController   │
                    │ InvController   │
                    │ WebhookController
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
        ┌───────▼──────┐  ┌──▼────────┐  │
        │ PlansService │  │SubsService│  │
        │              │  │           │  │
        │ • create()   │  │• create() │  │
        │ • findAll()  │  │• findBTId │  │
        │ • findById() │  │• changePln│  │
        │ • update()   │  │• renew()  │  │
        │ • deactivate│  │• cancel() │  │
        └───────┬──────┘  └──┬───────┘  │
                │             │         │
        ┌───────▼─────────────▼─┐       │
        │   InvoicesService     │       │
        │                       │       │
        │ • create()            │       │
        │ • markAsPaid()        │       │
        │ • markAsFailed()      │       │
        │ • refund()            │       │
        └───────┬───────────────┘       │
                │                       │
        ┌───────▼───────────────────────▼────┐
        │      PaymentService                │
        │                                    │
        │ • createPaymentIntent()            │
        │ • confirmPayment()                 │
        │ • refund()                         │
        │ • getAvailableGateways()           │
        └────────┬───────────────────────────┘
                 │
        ┌────────▼────────────────────────┐
        │   External Payment Providers    │
        │                                 │
        │ • Stripe API                    │
        │ • Razorpay API                  │
        └─────────────────────────────────┘
```

---

## Database Query Patterns

### Find Active Subscription for Tenant
```javascript
// Query
db.subscriptions.findOne({
  tenantId: ObjectId("..."),
  status: { $in: ["TRIAL", "ACTIVE"] }
})

// Index used: (tenantId, status)
// Performance: O(log n)
```

### Count Users for Plan Limit Check
```javascript
// Query
db.users.countDocuments({
  tenantId: ObjectId("...")
})

// Index used: tenantId
// Performance: O(log n)
```

### Find Subscriptions to Renew
```javascript
// Query
db.subscriptions.find({
  renewAt: { $lte: new Date() },
  status: { $in: ["TRIAL", "ACTIVE"] }
})

// Indexes used: renewAt, status
// Performance: O(log n + k) where k is result count
```

### Get Invoice History (Paginated)
```javascript
// Query
db.invoices.find({
  tenantId: ObjectId("..."),
  status: "PAID"
})
.sort({ createdAt: -1 })
.skip(0)
.limit(50)

// Indexes used: (tenantId, status), createdAt
// Performance: O(log n + k)
```

---

## Error Handling Flow

```
┌──────────────────────────────┐
│   Request to Endpoint        │
└─────────────┬────────────────┘
              │
        ┌─────▼──────┐
        │ Guard Check│
        └─┬────────┬─┘
          │        │
      ✓ Pass  ✗ Fail
          │        │
          │   ┌────▼─────────┐
          │   │ 401/403/422  │
          │   │ Unauthorized │
          │   └──────────────┘
          │
      ┌───▼────────────────┐
      │ Service Execution  │
      └─┬──────────┬───────┘
        │          │
    ✓ Success  ✗ Error
        │          │
        │      ┌───▼──────────────────┐
        │      │ BadRequestException  │
        │      │ NotFoundException    │
        │      │ ConflictException    │
        │      │ etc...               │
        │      └───┬──────────────────┘
        │          │
        │      ┌───▼────────────────┐
        │      │ HTTP Error Response│
        │      │ 400/404/409/etc    │
        │      └────────────────────┘
        │
    ┌───▼─────────────────────┐
    │ Return Success Response │
    │ 200/201 with data       │
    └─────────────────────────┘
```

**Common Exception Cases:**

| Scenario | Exception | HTTP Code |
|----------|-----------|-----------|
| Duplicate slug | BadRequestException | 400 |
| Plan not found | NotFoundException | 404 |
| Already subscribed | BadRequestException | 400 |
| Plan limit exceeded | HttpException(402) | 402 |
| Payment gateway error | InternalServerErrorException | 500 |
| Invalid webhook sig | BadRequestException | 400 |

---

## Scalability Considerations

### Read-Heavy Operations
- GET /plans (cached, popular)
- GET /plans/:id (indexed by _id)
- GET /subscriptions/current (indexed by (tenantId, status))
- GET /invoices (indexed by (tenantId, status), paginated)

**Optimization:**
- Cache active plans in-memory (updated infrequently)
- Use database indexing for tenant queries
- Implement pagination (default limit: 50)

### Write-Heavy Operations
- POST /subscriptions/subscribe (1 write per subscription)
- Webhook handling (updates invoice + subscription)
- Renewal processing (cron job, bulk updates)

**Optimization:**
- Use bulk operations for renewals
- Implement connection pooling
- Use write concern appropriately

### Database Indexes (All Created)
```
plans:
  - slug (unique)
  - isActive

subscriptions:
  - tenantId
  - status
  - renewAt
  - (tenantId, status) [composite]

invoices:
  - tenantId
  - invoiceNumber (unique)
  - status
  - paidOn
  - (tenantId, status) [composite]
```

---

## Summary

This comprehensive architecture ensures:

1. **Separation of Concerns:** Controllers → Services → Data
2. **Tenant Isolation:** All queries scoped by tenantId
3. **Plan Enforcement:** Middleware prevents limit violations
4. **Payment Processing:** Ready for Stripe/Razorpay integration
5. **Error Handling:** Graceful failures with proper HTTP codes
6. **Performance:** Proper indexing and pagination
7. **Scalability:** Read/write optimization patterns

The system is production-ready for beta deployment and scales to support thousands of tenants and millions of subscription/invoice records.
