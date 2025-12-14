import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Tenant } from './schemas/tenant.schema';
import { User } from '../../schemas/user.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel('Tenant') private tenantModel: Model<Tenant>,
    @InjectModel('User') private userModel: Model<User>,
  ) {}

  async findAll(query: any) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, parseInt(query.limit || '20', 10));
    const search = query.search?.trim();

    const match: any = {};
    if (query.status) match.status = query.status;
    if (query.plan) match.plan = query.plan;

    const agg: any[] = [
      // Lookup owner user
      {
        $lookup: {
          from: 'users',
          localField: 'ownerUserId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
    ];

    const and: any[] = [];
    if (Object.keys(match).length) {
      and.push({ $and: Object.entries(match).map(([k, v]) => ({ [k]: v })) });
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      and.push({ $or: [{ name: regex }, { domain: regex }, { 'owner.email': regex }] });
    }

    if (and.length) agg.push({ $match: { $and: and } });

    // Facet for pagination and total
    agg.push({
      $facet: {
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    });

    const res = await this.tenantModel.aggregate(agg as any).exec();
    const data = (res[0]?.data || []) as any[];
    const total = res[0]?.total?.[0]?.count || 0;
    return { data, total };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Tenant not found');
    const found = await this.tenantModel.findById(id).exec();
    if (!found) throw new NotFoundException('Tenant not found');
    return found;
  }

  private makeSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async create(dto: CreateTenantDto) {
    const slug = this.makeSlug(dto.name);
    const tenantDoc = new this.tenantModel({
      name: dto.name,
      slug,
      domain: dto.domain || null,
      plan: dto.plan || 'FREE',
      status: dto.status || 'ACTIVE',
    });
    const tenant = await tenantDoc.save();

    // Find or create owner user
    let owner = await this.userModel.findOne({ email: dto.ownerEmail.toLowerCase() }).exec();
    if (!owner) {
      const localPart = dto.ownerEmail.split('@')[0] || 'owner';
      owner = await this.userModel.create({
        email: dto.ownerEmail.toLowerCase(),
        password: Math.random().toString(36).slice(2, 10),
        firstName: localPart,
        lastName: '',
        tenant: tenant._id,
        role: 'TENANT_OWNER',
      } as any);
    } else {
      // ensure tenant ref on existing user
      if (!owner.tenant) {
        owner.tenant = tenant._id as any;
        await owner.save();
      }
    }

    tenant.ownerUserId = owner._id as any;
    await tenant.save();

    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    const t = await this.findOne(id);
    if (dto.domain !== undefined) t.domain = dto.domain;
    if (dto.status) t.status = dto.status;
    if (dto.plan) t.plan = dto.plan;
    if (dto.maxUsers !== undefined) t.maxUsers = dto.maxUsers;
    if (dto.maxStorageMB !== undefined) t.maxStorageMB = dto.maxStorageMB;
    if (dto.notes !== undefined) t.notes = dto.notes;
    await t.save();
    return t;
  }

  async remove(id: string) {
    const t = await this.findOne(id);
    t.status = 'CANCELLED';
    await t.save();
    return { success: true };
  }
}
