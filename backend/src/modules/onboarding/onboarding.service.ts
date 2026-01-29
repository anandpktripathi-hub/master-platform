import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CrmContact,
  CrmContactDocument,
} from '../../database/schemas/crm-contact.schema';
import {
  CrmCompany,
  CrmCompanyDocument,
} from '../../database/schemas/crm-company.schema';
import {
  CrmDeal,
  CrmDealDocument,
} from '../../database/schemas/crm-deal.schema';
import {
  CrmTask,
  CrmTaskDocument,
} from '../../database/schemas/crm-task.schema';
import {
  UserPost,
  UserPostDocument,
} from '../../database/schemas/user-post.schema';
import { Ticket, TicketDocument } from '../../database/schemas/ticket.schema';
import { Tenant, TenantDocument } from '../../database/schemas/tenant.schema';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @InjectModel(CrmContact.name)
    private readonly crmContactModel: Model<CrmContactDocument>,
    @InjectModel(CrmCompany.name)
    private readonly crmCompanyModel: Model<CrmCompanyDocument>,
    @InjectModel(CrmDeal.name)
    private readonly crmDealModel: Model<CrmDealDocument>,
    @InjectModel(CrmTask.name)
    private readonly crmTaskModel: Model<CrmTaskDocument>,
    @InjectModel(UserPost.name)
    private readonly userPostModel: Model<UserPostDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
  ) {}

  async seedSampleData(params: { tenantId: string; userId: string }) {
    const tenantObjectId = new Types.ObjectId(params.tenantId);
    const userObjectId = new Types.ObjectId(params.userId);

    // Avoid creating duplicates if sample already exists
    const existingContact = await this.crmContactModel.findOne({
      tenantId: tenantObjectId,
      email: 'sample.customer@example.com',
    });

    if (existingContact) {
      this.logger.log(
        `Sample data already exists for tenant ${params.tenantId}`,
      );
      return { created: false, reason: 'already_seeded' };
    }

    const company = await this.crmCompanyModel.create({
      tenantId: tenantObjectId,
      name: 'Sample Company Inc.',
      website: 'https://example.com',
      industry: 'Software',
    });

    const contact = await this.crmContactModel.create({
      tenantId: tenantObjectId,
      name: 'Sample Customer',
      email: 'sample.customer@example.com',
      phone: '+1 555-0100',
      companyName: company.name,
      source: 'sample_seed',
      ownerId: userObjectId,
    });

    const deal = await this.crmDealModel.create({
      tenantId: tenantObjectId,
      title: 'Sample Opportunity',
      contactId: contact._id,
      companyId: company._id,
      value: 1200,
      stage: 'QUALIFIED',
      ownerId: userObjectId,
      source: 'sample_seed',
    });

    const task = await this.crmTaskModel.create({
      tenantId: tenantObjectId,
      title: 'Follow up with Sample Customer',
      description: 'Call Sample Customer to discuss next steps.',
      assigneeId: userObjectId,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      completed: false,
      dealId: deal._id,
    });

    const post = await this.userPostModel.create({
      tenantId: tenantObjectId,
      authorId: userObjectId,
      content:
        'Welcome to your new workspace! This is a sample post to show how your feed will look.',
      visibility: 'PUBLIC',
      likes: [],
      likeCount: 0,
      commentCount: 0,
    });

    const ticket = await this.ticketModel.create({
      userId: userObjectId,
      tenantId: tenantObjectId,
      subject: 'Getting started with my workspace',
      message: 'This is a sample support ticket to show how support works.',
      status: 'open',
      priority: 'low',
    });

    // Ensure the tenant has a visible sample business directory listing
    const tenant = await this.tenantModel.findById(tenantObjectId).exec();
    if (tenant) {
      const tags = Array.from(new Set([...(tenant.tags || []), 'sample-data']));

      if (!tenant.isListedInDirectory) {
        tenant.isListedInDirectory = true;
      }
      if (tenant.directoryVisibility !== 'PUBLIC') {
        tenant.directoryVisibility = 'PUBLIC';
      }
      tenant.tags = tags;

      if (!tenant.publicName) {
        tenant.publicName = tenant.companyName || tenant.name;
      }
      if (!tenant.tagline) {
        tenant.tagline = 'Sample listing to show how your business appears.';
      }
      if (!tenant.shortDescription) {
        tenant.shortDescription =
          'This is a sample business directory entry created for your workspace.';
      }
      if (!tenant.city) {
        tenant.city = 'Sample City';
      }
      if (!tenant.country) {
        tenant.country = 'Sample Country';
      }
      if (!tenant.priceTier) {
        tenant.priceTier = 'MEDIUM';
      }

      await tenant.save();
    }

    this.logger.log(
      `Seeded sample onboarding data for tenant ${params.tenantId}`,
    );

    return {
      created: true,
      crm: {
        companyId: company._id.toString(),
        contactId: contact._id.toString(),
        dealId: deal._id.toString(),
        taskId: task._id.toString(),
      },
      social: {
        postId: post._id.toString(),
      },
      support: {
        ticketId: ticket._id.toString(),
      },
      directory: {
        tenantId: tenantObjectId.toString(),
      },
    };
  }
  
  async getSampleStatus(params: { tenantId: string }) {
    const tenantObjectId = new Types.ObjectId(params.tenantId);

    const [contact, ticket, post, tenant] = await Promise.all([
      this.crmContactModel.findOne({
        tenantId: tenantObjectId,
        email: 'sample.customer@example.com',
      }),
      this.ticketModel.findOne({
        tenantId: tenantObjectId,
        subject: 'Getting started with my workspace',
      }),
      this.userPostModel.findOne({
        tenantId: tenantObjectId,
        content:
          'Welcome to your new workspace! This is a sample post to show how your feed will look.',
      }),
      this.tenantModel.findById(tenantObjectId),
    ]);

    const directorySample = !!(
      tenant &&
      tenant.isListedInDirectory &&
      tenant.directoryVisibility === 'PUBLIC' &&
      (tenant.tags || []).includes('sample-data')
    );

    return {
      crmSample: !!contact,
      supportSample: !!ticket,
      socialSample: !!post,
      directorySample,
    };
  }
}
