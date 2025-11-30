import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Theme, ThemeDocument } from '../../database/schemas/theme.schema';

@Injectable()
export class ThemeService {
  constructor(@InjectModel(Theme.name) private themeModel: Model<ThemeDocument>) {}

  async findAll(tenantId: string): Promise<Theme[]> {
    return this.themeModel.find({ tenantId }).exec();
  }

  async findOne(id: string): Promise<Theme> {
    return this.themeModel.findById(id).exec();
  }

  async create(createThemeDto: Theme, tenantId: string): Promise<Theme> {
    const createdTheme = new this.themeModel({ ...createThemeDto, tenantId });
    return createdTheme.save();
  }

  async update(id: string, updateThemeDto: Theme, tenantId: string): Promise<Theme> {
    return this.themeModel.findByIdAndUpdate(id, { ...updateThemeDto, tenantId }, { new: true }).exec();
  }

  async remove(id: string) {
    return this.themeModel.findByIdAndDelete(id).exec();
  }
}
