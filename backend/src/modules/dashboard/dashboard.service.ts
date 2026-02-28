import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Dashboard,
  DashboardDocument,
} from '../../database/schemas/dashboard.schema';
import type { CreateDashboardDto, UpdateDashboardDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Dashboard.name)
    private dashboardModel: Model<DashboardDocument>,
  ) {}

  private toObjectId(id: string): Types.ObjectId {
    const trimmed = String(id || '').trim();
    if (!trimmed || !Types.ObjectId.isValid(trimmed)) {
      throw new BadRequestException('Dashboard id is invalid');
    }
    return new Types.ObjectId(trimmed);
  }

  private toTenantObjectId(tenantId: string): Types.ObjectId {
    const trimmed = String(tenantId || '').trim();
    if (!trimmed || !Types.ObjectId.isValid(trimmed)) {
      throw new BadRequestException('Tenant ID is invalid');
    }
    return new Types.ObjectId(trimmed);
  }

  async create(
    createDashboardDto: CreateDashboardDto,
    tenantId: string,
  ): Promise<Dashboard> {
    const tenantObjectId = this.toTenantObjectId(tenantId);
    const dashboard = new this.dashboardModel({
      ...createDashboardDto,
      tenantId: tenantObjectId,
    });
    return dashboard.save();
  }

  async findAll(tenantId: string): Promise<Dashboard[]> {
    const tenantObjectId = this.toTenantObjectId(tenantId);
    return this.dashboardModel.find({ tenantId: tenantObjectId }).exec();
  }

  async findOne(id: string, tenantId: string): Promise<Dashboard> {
    const tenantObjectId = this.toTenantObjectId(tenantId);
    const objectId = this.toObjectId(id);
    const dashboard = await this.dashboardModel
      .findOne({ _id: objectId, tenantId: tenantObjectId })
      .exec();
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return dashboard;
  }

  async update(
    id: string,
    updateDashboardDto: UpdateDashboardDto,
    tenantId: string,
  ): Promise<Dashboard> {
    const tenantObjectId = this.toTenantObjectId(tenantId);
    const objectId = this.toObjectId(id);
    const updated = await this.dashboardModel
      .findOneAndUpdate(
        { _id: objectId, tenantId: tenantObjectId },
        { ...updateDashboardDto },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Dashboard not found');
    return updated;
  }

  async remove(id: string, tenantId: string): Promise<any> {
    const tenantObjectId = this.toTenantObjectId(tenantId);
    const objectId = this.toObjectId(id);
    const deleted = await this.dashboardModel
      .findOneAndDelete({ _id: objectId, tenantId: tenantObjectId })
      .exec();
    if (!deleted) throw new NotFoundException('Dashboard not found');
    return deleted;
  }
}
