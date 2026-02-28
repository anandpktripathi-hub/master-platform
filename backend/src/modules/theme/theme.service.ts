import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Theme, ThemeDocument } from '../../database/schemas/theme.schema';

@Injectable()
export class ThemeService {
  constructor(
    @InjectModel(Theme.name) private themeModel: Model<ThemeDocument>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  async findAll(tenantId: string): Promise<Theme[]> {
    return this.themeModel
      .find({ tenantId: this.toObjectId(tenantId, 'tenantId') })
      .lean()
      .exec();
  }

  async findOne(id: string, tenantId: string): Promise<Theme | null> {
    return this.themeModel
      .findOne({
        _id: this.toObjectId(id, 'themeId'),
        tenantId: this.toObjectId(tenantId, 'tenantId'),
      })
      .lean()
      .exec();
  }

  async create(createThemeDto: Partial<Theme>, tenantId: string): Promise<Theme> {
    const createdTheme = new this.themeModel({
      ...createThemeDto,
      tenantId: this.toObjectId(tenantId, 'tenantId'),
    });
    return createdTheme.save();
  }

  async update(
    id: string,
    updateThemeDto: Partial<Theme>,
    tenantId: string,
  ): Promise<Theme | null> {
    const updated = await this.themeModel
      .findOneAndUpdate(
        {
          _id: this.toObjectId(id, 'themeId'),
          tenantId: this.toObjectId(tenantId, 'tenantId'),
        },
        { $set: updateThemeDto },
        { new: true },
      )
      .lean()
      .exec();
    if (!updated) throw new NotFoundException('Theme not found');
    return updated as unknown as Theme;
  }

  async remove(id: string, tenantId: string): Promise<Theme | null> {
    const deleted = await this.themeModel
      .findOneAndDelete({
        _id: this.toObjectId(id, 'themeId'),
        tenantId: this.toObjectId(tenantId, 'tenantId'),
      })
      .lean()
      .exec();
    if (!deleted) throw new NotFoundException('Theme not found');
    return deleted as unknown as Theme;
  }
}

