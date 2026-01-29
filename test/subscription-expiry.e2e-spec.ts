import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { Package } from '../src/database/schemas/package.schema';
import { TenantPackage } from '../src/database/schemas/tenant-package.schema';
import { PackageService } from '../src/modules/packages/services/package.service';

describe('Subscription Expiry Warnings (per-plan overrides)', () => {
  let app: INestApplication;
  let connection: Connection;
  let packageModel: Model<Package>;
  let tenantPackageModel: Model<TenantPackage>;
  let packageService: PackageService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connection = app.get(Connection);
    packageModel = app.get<Model<Package>>(getModelToken(Package.name));
    tenantPackageModel = app.get<Model<TenantPackage>>(getModelToken(TenantPackage.name));
    packageService = app.get(PackageService);
  });

  afterAll(async () => {
    if (connection) {
      await connection.dropDatabase();
    }
    await app.close();
  });

  it('computes max expiry window across packages', async () => {
    await packageModel.deleteMany({});

    await packageModel.create({
      name: 'Basic',
      description: 'Basic plan',
      price: 1000,
      billingCycle: 'monthly',
      trialDays: 0,
      isActive: true,
      featureSet: {},
      limits: {},
      order: 1,
    });

    await packageModel.create({
      name: 'Pro',
      description: 'Pro plan',
      price: 2000,
      billingCycle: 'monthly',
      trialDays: 0,
      isActive: true,
      featureSet: {},
      limits: {},
      order: 2,
      expiryWarningDays: 7,
    });

    await packageModel.create({
      name: 'Enterprise',
      description: 'Enterprise plan',
      price: 5000,
      billingCycle: 'annual',
      trialDays: 0,
      isActive: true,
      featureSet: {},
      limits: {},
      order: 3,
      expiryWarningDays: 14,
    });

    const globalDefault = 3;
    const windowDays = await packageService.getMaxExpiryWarningWindow(globalDefault);
    expect(windowDays).toBe(14);
  });

  it('sends expiry warnings using per-plan overrides', async () => {
    await tenantPackageModel.deleteMany({});

    const allPkgs = await packageModel.find({}).exec();
    const basic = allPkgs.find((p) => p.name === 'Basic');
    const pro = allPkgs.find((p) => p.name === 'Pro');
    const enterprise = allPkgs.find((p) => p.name === 'Enterprise');

    if (!basic || !pro || !enterprise) {
      throw new Error('Test packages not found');
    }

    const now = new Date();

    const mkTenantPackage = async (
      pkg: typeof basic,
      daysUntilExpiry: number,
    ) => {
      const tenantId = new Types.ObjectId();
      const expiresAt = new Date(now.getTime() + daysUntilExpiry * 24 * 60 * 60 * 1000);
      await tenantPackageModel.create({
        tenantId,
        packageId: pkg._id,
        status: 'active',
        startedAt: now,
        expiresAt,
        usageCounters: {
          domains: 0,
          customDomains: 0,
          subdomains: 0,
          paths: 0,
          storageMb: 0,
          teamMembers: 0,
          pages: 0,
        },
        overrides: {},
        expiryWarningSent: false,
      });
      return tenantId.toHexString();
    };

    // Basic (no override, uses global 3-day window)
    const basicTenantInside = await mkTenantPackage(basic, 2); // should warn
    const basicTenantOutside = await mkTenantPackage(basic, 4); // should NOT warn

    // Pro (override 7 days)
    const proTenantInside = await mkTenantPackage(pro, 6); // should warn
    const proTenantOutside = await mkTenantPackage(pro, 8); // should NOT warn

    // Enterprise (override 14 days)
    const entTenantInside = await mkTenantPackage(enterprise, 10); // should warn
    const entTenantOutside = await mkTenantPackage(enterprise, 20); // should NOT warn

    const sent: Array<{ to: string; packageName: string }> = [];

    const fakeBillingNotifications = {
      sendSubscriptionExpiringSoonEmail: async (params: {
        to: string;
        packageName: string;
        expiresAt: Date;
        daysRemaining: number;
      }) => {
        sent.push({ to: params.to, packageName: params.packageName });
      },
    } as any;

    const fakeTenantsService = {
      getTenantBillingEmail: async (tenantId: string) => `user+${tenantId}@example.com`,
    } as any;

    const globalDefaultDays = 3;
    const windowDays = await packageService.getMaxExpiryWarningWindow(globalDefaultDays);

    const processed = await packageService.sendSubscriptionExpiryWarnings(
      globalDefaultDays,
      windowDays,
      fakeBillingNotifications,
      fakeTenantsService,
    );

    expect(processed).toBe(3);

    const emails = sent.map((s) => s.to).sort();
    expect(emails).toContain(`user+${basicTenantInside}@example.com`);
    expect(emails).toContain(`user+${proTenantInside}@example.com`);
    expect(emails).toContain(`user+${entTenantInside}@example.com`);

    expect(emails).not.toContain(`user+${basicTenantOutside}@example.com`);
    expect(emails).not.toContain(`user+${proTenantOutside}@example.com`);
    expect(emails).not.toContain(`user+${entTenantOutside}@example.com`);

    const refreshed = await tenantPackageModel.find({}).exec();
    refreshed.forEach((tp) => {
      if (sent.some((s) => s.to === `user+${tp.tenantId.toHexString()}@example.com`)) {
        expect(tp.expiryWarningSent).toBe(true);
      }
    });
  });
});
