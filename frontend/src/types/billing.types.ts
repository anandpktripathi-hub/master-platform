// Billing & Subscription Types

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export type BillingPeriod = 'MONTHLY' | 'YEARLY';

export type InvoiceStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'PROCESSING';

export interface Plan {
  _id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number; // in paise (e.g., 4999 = ₹49.99)
  priceYearly: number;
  features: string[];
  userLimit?: number;
  storageLimitMB?: number;
  ordersLimit?: number;
  productsLimit?: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  _id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  billingPeriod: BillingPeriod;
  startedAt: string;
  renewAt: string;
  trialEndsAt?: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  amountPaid: number;
  currency: string;
  failedPaymentCount: number;
  stripeSubscriptionId?: string;
  razorpaySubscriptionId?: string;
  paymentMethod?: 'STRIPE' | 'RAZORPAY' | 'MANUAL';
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  _id: string;
  tenantId: string;
  subscriptionId: string;
  planId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  description?: string;
  paidOn?: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentMethod?: 'STRIPE' | 'RAZORPAY' | 'MANUAL';
  transactionId?: string;
  stripeInvoiceId?: string;
  razorpayPaymentId?: string;
  lineItems: LineItem[];
  refundedAmount: number;
  refundedOn?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  amount: number;
}

export interface CreatePlanRequest {
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  userLimit?: number;
  storageLimitMB?: number;
  ordersLimit?: number;
  productsLimit?: number;
  isActive: boolean;
  displayOrder?: number;
}

export interface SubscribeRequest {
  planId: string;
  billingPeriod: BillingPeriod;
  paymentMethodId?: string;
}

export interface ChangePlanRequest {
  newPlanId: string;
  billingPeriod: BillingPeriod;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface PlanUsage {
  users: {
    current: number;
    limit: number;
    percentage: number;
  };
  products: {
    current: number;
    limit: number;
    percentage: number;
  };
  orders: {
    current: number;
    limit: number;
    percentage: number;
  };
  storage: {
    current: number;
    limit: number;
    percentage: number;
  };
}
