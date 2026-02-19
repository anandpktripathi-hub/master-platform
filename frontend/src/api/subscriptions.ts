import api from '../lib/api';
import type { BillingPeriod, Subscription, Invoice, ChangePlanRequest } from '../types/billing.types';

export type PaymentProvider = 'STRIPE' | 'RAZORPAY' | 'PAYPAL' | 'MANUAL';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'succeeded' | 'processing';
  provider: 'stripe' | 'razorpay' | 'paypal';
  clientSecret?: string;
  paymentUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface SubscribeResponse {
  subscription: Subscription;
  invoice?: Invoice;
  paymentIntent?: PaymentIntent | null;
  requiresPayment: boolean;
}

export interface SubscribeRequestPayload {
  planId: string;
  billingPeriod: BillingPeriod;
  paymentMethodId?: string;
  provider?: PaymentProvider;
}

export async function subscribeToPlan(
  payload: SubscribeRequestPayload,
): Promise<SubscribeResponse> {
  void payload;
  throw new Error(
    'Subscriptions are not available in manual billing mode. Use /packages + /offline-payments instead.',
  );
}

export async function getCurrentSubscription(): Promise<Subscription> {
  throw new Error(
    'Subscriptions are not available in manual billing mode. Use GET /packages/me instead.',
  );
}

export async function changePlan(payload: ChangePlanRequest): Promise<Subscription> {
  void payload;
  throw new Error(
    'Plan changes are not available in manual billing mode. Submit an offline payment request to upgrade.',
  );
}

export async function cancelSubscription(atPeriodEnd: boolean = false): Promise<Subscription> {
  void atPeriodEnd;
  throw new Error(
    'Subscription cancellation is not available in manual billing mode.',
  );
}
