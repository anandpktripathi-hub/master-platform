import { Injectable } from '@nestjs/common';
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

  async findAll(tenantId: string): Promise<Dashboard[]> {
    return this.dashboardModel.find({ tenantId }).exec();
  }

  async findOne(id: string): Promise<Dashboard> {
    return this.dashboardModel.findById(id).exec();
  }

  async create(
    createDashboardDto: Dashboard,
    tenantId: string,
  ): Promise<Dashboard> {
    const createdDashboard = new this.dashboardModel({
      ...createDashboardDto,
      tenantId,
    });
    return createdDashboard.save();
  }

  async update(
    id: string,
    updateDashboardDto: Dashboard,
    tenantId: string,
  ): Promise<Dashboard> {
    return this.dashboardModel
      .findByIdAndUpdate(id, { ...updateDashboardDto, tenantId }, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.dashboardModel.findByIdAndDelete(id).exec();
  }
}
