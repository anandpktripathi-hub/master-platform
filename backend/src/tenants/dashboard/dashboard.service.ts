import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import {
  PosOrder,
  PosOrderDocument,
} from '../../database/schemas/pos-order.schema';
import {
  UserNotification,
  UserNotificationDocument,
} from '../../database/schemas/user-notification.schema';
import { CmsAnalyticsService } from '../../cms/services/cms-analytics.service';
import { FeatureAccessService } from '../../feature-registry/featureAccess.service';

interface TenantDashboardUserContext {
  id?: string;
  role?: string;
  roles?: string[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(PosOrder.name)
    private readonly posOrderModel: Model<PosOrderDocument>,
    @InjectModel(UserNotification.name)
    private readonly notificationModel: Model<UserNotificationDocument>,
    private readonly cmsAnalyticsService: CmsAnalyticsService,
    private readonly featureAccessService: FeatureAccessService,
  ) {}

  async getDashboardForTenant(
    tenantId: string,
    user: TenantDashboardUserContext,
  ) {
    const roles: string[] =
      Array.isArray(user.roles) && user.roles.length
        ? user.roles
        : user.role
          ? [user.role]
          : [];

    if (!tenantId) {
      return {
        stats: {},
        cms: null,
        pos: null,
        notifications: [],
        features: [],
      };
    }

    const tenantObjectId = new Types.ObjectId(tenantId);

    const userId = user.id;
    const userObjectId =
      userId && Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : null;

    const [userCount, posAgg, cmsAnalytics, notifications] = await Promise.all([
      this.userModel
        .countDocuments({ tenantId: tenantObjectId, isActive: true })
        .exec(),
      this.posOrderModel
        .aggregate([
          { $match: { tenantId: tenantObjectId } },
          {
            $group: {
              _id: null,
              totalSales: { $sum: '$totalAmount' },
              totalOrders: { $sum: 1 },
            },
          },
        ])
        .exec(),
      this.cmsAnalyticsService.getTenantAnalytics(tenantId, 30),
      userObjectId
        ? this.notificationModel
            .find({ tenantId: tenantObjectId, userId: userObjectId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
            .exec()
        : Promise.resolve([]),
    ]);

    const posSummary = {
      totalSales: posAgg[0]?.totalSales || 0,
      totalOrders: posAgg[0]?.totalOrders || 0,
    };

    const accessibleFeatures = this.featureAccessService.getAccessibleFeatures(
      roles,
      tenantId,
    );

    return {
      stats: {
        users: userCount,
        posTotalSales: posSummary.totalSales,
        posTotalOrders: posSummary.totalOrders,
        cmsTotalViewsLast30Days: cmsAnalytics.totalViews,
        cmsUniqueVisitorsLast30Days: cmsAnalytics.totalUniqueVisitors,
      },
      cms: cmsAnalytics,
      pos: posSummary,
      notifications: (notifications as any[]).map((n) => ({
        id: n._id,
        title: n.title,
        message: n.message,
        linkUrl: n.linkUrl,
        read: n.read,
        createdAt: n.createdAt,
      })),
      features: accessibleFeatures,
    };
  }
}
