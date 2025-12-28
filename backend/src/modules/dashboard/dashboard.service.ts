import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Dashboard,
  DashboardDocument,
} from '../../database/schemas/dashboard.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Dashboard.name)
    private dashboardModel: Model<DashboardDocument>,
  ) {}

  async create(createDashboardDto: any, tenantId: string): Promise<Dashboard> {
    const dashboard = new this.dashboardModel({
      ...createDashboardDto,
      tenant: tenantId,
    });
    return dashboard.save();
  }

  async findAll(tenantId: string): Promise<Dashboard[]> {
    return this.dashboardModel.find({ tenant: tenantId }).exec();
  }

  async findOne(id: string, tenantId: string): Promise<Dashboard> {
    const dashboard = await this.dashboardModel
      .findOne({ _id: id, tenant: tenantId })
      .exec();
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return dashboard;
  }

  async update(
    id: string,
    updateDashboardDto: any,
    tenantId: string,
  ): Promise<Dashboard> {
    const updated = await this.dashboardModel
      .findByIdAndUpdate(
        id,
        { ...updateDashboardDto, tenant: tenantId },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException('Dashboard not found');
    return updated;
  }

  async remove(id: string): Promise<any> {
    return this.dashboardModel.findByIdAndDelete(id).exec();
  }
}
