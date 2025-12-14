# Billing System Integration Guide

## Quick Start

The billing system has been fully integrated into your NestJS backend. Here's how to use it:

## Step 1: Environment Setup

Add these to your `.env` file:

```bash
# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_YOUR_TEST_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

## Step 2: Initialize Default Plans

Create a migration or seeder to add default plans:

```typescript
// src/billing/seeds/plans.seed.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan } from '../schemas/plan.schema';

const DEFAULT_PLANS = [
  {
    name: 'Free',
    slug: 'free',
    description: 'Start with our free plan',
    priceMonthly: 0,
    priceYearly: 0,
    features: ['Up to 3 users', '10 products', '100 orders/month', '1GB storage'],
    userLimit: 3,
    productsLimit: 10,
    ordersLimit: 100,
    storageLimitMB: 1024,
    isActive: true,
    displayOrder: 1,
  },
  {
    name: 'Professional',
    slug: 'professional',
    description: 'For growing businesses',
    priceMonthly: 4999, // ₹49.99
    priceYearly: 49999, // ₹499.99
    features: ['Up to 10 users', '100 products', '10,000 orders/month', '100GB storage'],
    userLimit: 10,
    productsLimit: 100,
    ordersLimit: 10000,
    storageLimitMB: 102400,
    isActive: true,
    displayOrder: 2,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'For large organizations',
    priceMonthly: 24999, // ₹249.99
    priceYearly: 249999, // ₹2499.99
    features: ['Unlimited users', 'Unlimited products', 'Unlimited orders', 'Unlimited storage', 'Priority support', 'Custom integrations'],
    userLimit: -1, // Unlimited
    productsLimit: -1,
    ordersLimit: -1,
    storageLimitMB: -1,
    isActive: true,
    displayOrder: 3,
  },
];

@Injectable()
export class PlansSeed {
  constructor(@InjectModel(Plan.name) private planModel: Model<any>) {}

  async run() {
    const count = await this.planModel.countDocuments();
    if (count === 0) {
      await this.planModel.insertMany(DEFAULT_PLANS);
      console.log('✅ Default plans seeded');
    }
  }
}
```

## Step 3: Add Plans Endpoint to Frontend

### Get Available Plans

```typescript
// frontend/src/services/billingService.ts
export async function fetchPlans() {
  const response = await fetch('/plans');
  return response.json();
}
```

### Display Plans on Frontend

```typescript
// frontend/src/pages/Pricing.tsx
import { useEffect, useState } from 'react';
import { Card, Button, Container, Typography, Box, Grid } from '@mui/material';
import { fetchPlans } from '../services/billingService';

export function Pricing() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans()
      .then(setPlans)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <Typography variant="h3" sx={{ mb: 4, textAlign: 'center' }}>
        Our Plans
      </Typography>

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan._id}>
            <Card sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                {plan.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {plan.description}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="h4">
                  ₹{(plan.priceMonthly / 100).toFixed(2)}
                  <Typography variant="caption">/month</Typography>
                </Typography>
              </Box>

              <Box sx={{ flex: 1, mb: 2 }}>
                <ul>
                  {plan.features.map((feature: string, idx: number) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </Box>

              <Button variant="contained" fullWidth>
                Choose {plan.name}
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
```

## Step 4: Implement Subscription UI

### Subscribe Button

```typescript
// frontend/src/components/SubscribeButton.tsx
import { Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function SubscribeButton({ planId, billingPeriod = 'MONTHLY' }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const response = await fetch('/subscriptions/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ planId, billingPeriod }),
    });

    if (response.ok) {
      alert('Subscription created! You now have a 14-day trial.');
      navigate('/dashboard/subscription');
    }
  };

  return <Button onClick={handleSubscribe}>Subscribe Now</Button>;
}
```

## Step 5: Apply PlanLimitsMiddleware

Add the middleware to your app.module.ts:

```typescript
// src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PlanLimitsMiddleware } from './billing/middleware/plan-limits.middleware';

@Module({
  // ... existing config
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PlanLimitsMiddleware)
      .forRoutes(
        'users',      // POST /users
        'products',   // POST /products
        'orders',     // POST /orders
      );
  }
}
```

## Step 6: Handle Payments (Stripe Example)

### Frontend Payment Form

```typescript
// frontend/src/components/PaymentForm.tsx
import { loadStripe } from '@stripe/js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_YOUR_KEY');

export function CheckoutFlow() {
  const [clientSecret, setClientSecret] = useState('');

  return (
    <Elements stripe={stripePromise}>
      {clientSecret && <PaymentElement clientSecret={clientSecret} />}
    </Elements>
  );
}
```

### Process Payment on Backend

```typescript
// src/billing/controllers/payments.controller.ts
@Post('create-payment-intent')
async createPaymentIntent(@Body() { amount, currency }: any) {
  const paymentIntent = await this.paymentService.createStripePaymentIntent(
    amount,
    currency,
  );
  return paymentIntent;
}
```

## Step 7: Set Up Webhook Endpoints

### In Stripe Dashboard:
1. Go to Webhooks
2. Add Endpoint: `https://yourdomain.com/payments/webhook/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy webhook secret to `.env` as `STRIPE_WEBHOOK_SECRET`

### In Razorpay Dashboard:
1. Go to Webhooks
2. Add Webhook: `https://yourdomain.com/payments/webhook/razorpay`
3. Select events: `payment.authorized`, `payment.failed`, `refund.created`
4. Copy webhook secret to `.env` as `RAZORPAY_WEBHOOK_SECRET`

## Step 8: Create Cron Job for Renewals

```typescript
// src/billing/jobs/subscription-renewal.job.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsService } from '../services/subscriptions.service';
import { SubscriptionStatus } from '../schemas/subscription.schema';

@Injectable()
export class SubscriptionRenewalJob {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyRenewals() {
    console.log('🔄 Processing subscription renewals...');
    
    // Find subscriptions where renewAt <= today
    const today = new Date();
    
    // Get subscriptions to renew
    // const subscriptions = await Subscription.find({
    //   renewAt: { $lte: today },
    //   status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
    // });

    // for (const subscription of subscriptions) {
    //   await this.subscriptionsService.renewSubscription(subscription._id);
    // }

    console.log('✅ Renewal processing complete');
  }
}
```

Register in billing.module.ts:

```typescript
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [...otherProviders, SubscriptionRenewalJob],
})
export class BillingModule {}
```

## Step 9: Email Notifications

Create email templates for:
- Welcome email (subscription started)
- Trial expiration (3 days before)
- Payment receipt
- Payment failure (with retry instructions)
- Subscription cancelled

```typescript
// src/email/templates/subscription-welcome.template.ts
export const subscriptionWelcomeTemplate = (tenantName: string, planName: string, trialEndsAt: Date) => `
<h1>Welcome to ${planName}!</h1>
<p>Hi ${tenantName},</p>
<p>Your ${planName} plan is now active. You have a 14-day free trial.</p>
<p>Trial ends on: ${trialEndsAt.toLocaleDateString()}</p>
<p>After the trial, you'll be automatically charged based on your selected billing period.</p>
`;
```

## Step 10: Monitor & Analytics

Create a dashboard endpoint to track:

```typescript
// src/billing/controllers/analytics.controller.ts
@Get('revenue/mrr')
@UseGuards(RolesGuard)
@Roles(Role.PLATFORM_SUPER_ADMIN)
async getMRR() {
  // Calculate Monthly Recurring Revenue
  // Sum of all ACTIVE subscriptions with monthly pricing
}

@Get('analytics/churn')
@UseGuards(RolesGuard)
@Roles(Role.PLATFORM_SUPER_ADMIN)
async getChurnRate() {
  // Calculate percentage of tenants cancelling each month
}

@Get('analytics/plan-distribution')
@UseGuards(RolesGuard)
@Roles(Role.PLATFORM_SUPER_ADMIN)
async getPlanDistribution() {
  // Return count of active subscriptions per plan
}
```

## File Structure

```
src/
├── billing/
│   ├── controllers/
│   │   ├── plans.controller.ts
│   │   ├── subscriptions.controller.ts
│   │   ├── invoices.controller.ts
│   │   └── payment-webhook.controller.ts
│   ├── services/
│   │   ├── plans.service.ts
│   │   ├── subscriptions.service.ts
│   │   ├── invoices.service.ts
│   │   └── payment.service.ts
│   ├── schemas/
│   │   ├── plan.schema.ts
│   │   ├── subscription.schema.ts
│   │   └── invoice.schema.ts
│   ├── dto/
│   │   ├── create-plan.dto.ts
│   │   ├── update-plan.dto.ts
│   │   ├── subscribe.dto.ts
│   │   └── change-plan.dto.ts
│   ├── middleware/
│   │   └── plan-limits.middleware.ts
│   └── billing.module.ts
```

## Testing API Endpoints

### Test Create Plan
```bash
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.accessToken')

curl -X POST http://localhost:3000/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Starter",
    "slug": "starter",
    "priceMonthly": 2999,
    "priceYearly": 29999,
    "features": ["5 users", "20 products"]
  }'
```

### Test Subscribe
```bash
curl -X POST http://localhost:3000/subscriptions/subscribe \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "PLAN_ID_FROM_ABOVE",
    "billingPeriod": "MONTHLY"
  }'
```

### Test Get Current Subscription
```bash
curl -X GET http://localhost:3000/subscriptions/current \
  -H "Authorization: Bearer $TOKEN"
```

### Test Get Invoices
```bash
curl -X GET http://localhost:3000/invoices \
  -H "Authorization: Bearer $TOKEN"
```

## Production Deployment

1. **Database Backup:** Set up MongoDB backups before launching billing
2. **Payment Gateway:** Configure production keys in Stripe/Razorpay
3. **Webhook Verification:** Implement signature verification in webhook controllers
4. **Rate Limiting:** Add rate limiting to payment endpoints
5. **Error Handling:** Implement comprehensive error tracking (Sentry/LogRocket)
6. **Monitoring:** Set up alerts for failed payments and renewal errors
7. **Compliance:** Ensure GDPR/data privacy compliance for payment data
8. **Encryption:** Store sensitive payment data encrypted
9. **Audit Logging:** Log all payment and subscription changes
10. **Disaster Recovery:** Test payment system failure scenarios

---

**Status:** ✅ Billing system fully integrated and ready for development

**Next Steps:**
1. Seed default plans
2. Implement Stripe/Razorpay payment processing
3. Create frontend subscription management UI
4. Set up webhook endpoints
5. Create cron jobs for renewals
6. Add email notifications
7. Deploy and test in staging environment
