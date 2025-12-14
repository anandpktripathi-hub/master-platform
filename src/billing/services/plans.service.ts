import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, PlanDocument } from '../schemas/plan.schema';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(@InjectModel('Plan') private planModel: Model<PlanDocument>) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const existingPlan = await this.planModel.findOne({ slug: createPlanDto.slug });
    if (existingPlan) {
      throw new BadRequestException(`Plan with slug "${createPlanDto.slug}" already exists`);
    }

    const newPlan = new this.planModel(createPlanDto);
    return newPlan.save();
  }

  async findAll(): Promise<Plan[]> {
    return this.planModel.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
  }

  async findAllIncludingInactive(): Promise<Plan[]> {
    return this.planModel.find().sort({ displayOrder: 1 }).lean();
  }

  async findById(id: string): Promise<Plan> {
    const plan = await this.planModel.findById(id).lean();
    if (!plan) {
      throw new NotFoundException(`Plan with ID "${id}" not found`);
    }
    return plan;
  }

  async findBySlug(slug: string): Promise<Plan> {
    const plan = await this.planModel.findOne({ slug }).lean();
    if (!plan) {
      throw new NotFoundException(`Plan with slug "${slug}" not found`);
    }
    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    // Check if slug is unique (if being updated)
    if (updatePlanDto.slug) {
      const existingPlan = await this.planModel.findOne({
        slug: updatePlanDto.slug,
        _id: { $ne: id },
      });
      if (existingPlan) {
        throw new BadRequestException(`Plan with slug "${updatePlanDto.slug}" already exists`);
      }
    }

    const updatedPlan = await this.planModel.findByIdAndUpdate(id, updatePlanDto, {
      new: true,
    });

    if (!updatedPlan) {
      throw new NotFoundException(`Plan with ID "${id}" not found`);
    }

    return updatedPlan;
  }

  async deactivate(id: string): Promise<Plan> {
    const plan = await this.planModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!plan) {
      throw new NotFoundException(`Plan with ID "${id}" not found`);
    }
    return plan;
  }

  async delete(id: string): Promise<void> {
    const result = await this.planModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Plan with ID "${id}" not found`);
    }
  }
}
