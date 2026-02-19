import api from '../lib/api';
import type { CreatePlanRequest, Plan } from '../types/billing.types';
import type { Package } from '../types/api.types';
import type { OfflinePaymentRequest } from '../types/billing.types';

const slugify = (value: string) =>
  (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const packageToPlan = (pkg: Package): Plan => {
  const features = Object.entries(pkg.featureSet || {})
    .filter(([, enabled]) => enabled === true)
    .map(([key]) => key);

  const monthlyPaise =
    pkg.billingCycle === 'monthly'
      ? Math.round((pkg.price ?? 0) * 100)
      : pkg.billingCycle === 'annual'
        ? Math.round(((pkg.price ?? 0) / 12) * 100)
        : Math.round((pkg.price ?? 0) * 100);

  const yearlyPaise =
    pkg.billingCycle === 'annual'
      ? Math.round((pkg.price ?? 0) * 100)
      : pkg.billingCycle === 'monthly'
        ? Math.round((pkg.price ?? 0) * 12 * 100)
        : Math.round((pkg.price ?? 0) * 100);

  return {
    _id: pkg._id,
    name: pkg.name,
    slug: slugify(pkg.name),
    description: pkg.description || '',
    priceMonthly: monthlyPaise,
    priceYearly: yearlyPaise,
    features,
    userLimit:
      typeof pkg.limits?.maxTeamMembers === 'number' ? pkg.limits.maxTeamMembers : -1,
    storageLimitMB:
      typeof pkg.limits?.maxStorageMb === 'number' ? pkg.limits.maxStorageMb : -1,
    ordersLimit: -1,
    productsLimit: -1,
    isActive: pkg.isActive !== false,
    displayOrder: typeof pkg.order === 'number' ? pkg.order : 0,
    createdAt: pkg.createdAt,
    updatedAt: pkg.updatedAt,
  };
};

const planToPackagePayload = (payload: CreatePlanRequest) => {
  const priceMajor = (payload.priceMonthly ?? 0) / 100;
  return {
    name: payload.name,
    description: payload.description,
    price: priceMajor,
    billingCycle: 'monthly',
    trialDays: 0,
    isActive: payload.isActive,
    order: payload.displayOrder ?? 0,
    featureSet: (payload.features || []).reduce<Record<string, boolean>>((acc, key) => {
      const k = String(key || '').trim();
      if (k) acc[k] = true;
      return acc;
    }, {}),
    limits: {
      maxTeamMembers: payload.userLimit,
      maxStorageMb: payload.storageLimitMB,
    },
  };
};

const partialPlanToPackageUpdate = (payload: Partial<CreatePlanRequest>) => {
  const update: Record<string, unknown> = {};

  if (typeof payload.name === 'string') update.name = payload.name;
  if (typeof payload.description === 'string') update.description = payload.description;
  if (typeof payload.isActive === 'boolean') update.isActive = payload.isActive;
  if (typeof payload.displayOrder === 'number') update.order = payload.displayOrder;

  if (Array.isArray(payload.features)) {
    update.featureSet = payload.features.reduce<Record<string, boolean>>((acc, key) => {
      const k = String(key || '').trim();
      if (k) acc[k] = true;
      return acc;
    }, {});
  }

  const limits: Record<string, unknown> = {};
  if (typeof payload.userLimit === 'number') limits.maxTeamMembers = payload.userLimit;
  if (typeof payload.storageLimitMB === 'number') limits.maxStorageMb = payload.storageLimitMB;
  if (Object.keys(limits).length > 0) update.limits = limits;

  if (typeof payload.priceMonthly === 'number') {
    update.price = payload.priceMonthly / 100;
    update.billingCycle = 'monthly';
  } else if (typeof payload.priceYearly === 'number') {
    update.price = payload.priceYearly / 100;
    update.billingCycle = 'annual';
  }

  return update;
};

const billingService = {
  async getPlans(): Promise<Plan[]> {
    const response = await api.get('/packages');
    const list: Package[] = Array.isArray(response)
      ? (response as Package[])
      : ((response as any)?.data as Package[]) || [];

    return (list || [])
      .filter((p) => p && p.isActive !== false)
      .map(packageToPlan)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  },

  // Legacy: keep method name for any older callers.
  async subscribe(payload: any) {
    const planId: string | undefined = payload?.planId || payload?.packageId;
    if (!planId) {
      throw new Error('Missing planId/packageId for manual upgrade request');
    }

    const packagesResponse = await api.get('/packages');
    const packages: Package[] = Array.isArray(packagesResponse)
      ? (packagesResponse as Package[])
      : ((packagesResponse as any)?.data as Package[]) || [];
    const pkg = (packages || []).find((p) => p?._id === planId);
    if (!pkg) {
      throw new Error('Selected package not found');
    }

    const requestPayload = {
      amount: pkg.price,
      currency: payload?.currency || 'USD',
      method: payload?.method || 'bank_transfer',
      description: payload?.description || `Package upgrade request: ${pkg.name}`,
      metadata: {
        packageId: pkg._id,
        billingPeriod: payload?.billingPeriod,
        billingCycle: pkg.billingCycle,
      },
    };

    return api.post<OfflinePaymentRequest>('/offline-payments', requestPayload);
  },

  async getInvoices() {
    return api.get('/billings');
  },

  async downloadInvoice(invoiceId: string) {
    throw new Error(
      `Invoice PDF download is not available in manual billing mode (invoiceId=${invoiceId})`,
    );
  },

  async createPlan(payload: CreatePlanRequest): Promise<Plan> {
    const created = await api.post('/packages', planToPackagePayload(payload));
    return packageToPlan(created as Package);
  },

  async updatePlan(planId: string, payload: Partial<CreatePlanRequest>): Promise<Plan> {
    const updated = await api.patch(`/packages/${planId}`, partialPlanToPackageUpdate(payload));
    return packageToPlan(updated as Package);
  },

  async deletePlan(planId: string): Promise<Plan> {
    await api.delete(`/packages/${planId}`);
    return ({ _id: planId } as unknown) as Plan;
  },
};

export default billingService;
