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
  // Backend is mounted under /api/v1, and SubscriptionsController uses @Controller('subscriptions')
  return api.post<SubscribeResponse>('/subscriptions/subscribe', payload);
}

export async function getCurrentSubscription(): Promise<Subscription> {
  return api.get<Subscription>('/subscriptions/current');
}

export async function changePlan(payload: ChangePlanRequest): Promise<Subscription> {
  return api.patch<Subscription>('/subscriptions/change-plan', payload);
}

export async function cancelSubscription(atPeriodEnd: boolean = false): Promise<Subscription> {
  return api.patch<Subscription>(`/subscriptions/cancel?atPeriodEnd=${atPeriodEnd}`, {});
}
