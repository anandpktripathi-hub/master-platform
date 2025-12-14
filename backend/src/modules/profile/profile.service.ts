import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Tenant, TenantDocument } from '../../database/schemas/tenant.schema';
import { UpdateProfileDto, UpdateTenantProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
  ) {}

  /**
   * Get user personal profile
   */
  async getUserProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Update user personal profile
   */
  async updateUserProfile(userId: string, dto: UpdateProfileDto) {
    const updates: Partial<UserDocument> = {};

    if (dto.firstName !== undefined) updates.firstName = dto.firstName;
    if (dto.secondName !== undefined) updates.secondName = dto.secondName;
    if (dto.lastName !== undefined) updates.lastName = dto.lastName;
    if (dto.dateOfBirth !== undefined)
      updates.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.phone !== undefined) updates.phone = dto.phone;
    if (dto.homeAddress !== undefined) updates.homeAddress = dto.homeAddress;
    if (dto.positionInCompany !== undefined)
      updates.positionInCompany = dto.positionInCompany;
    if (dto.companyEmailForUser !== undefined)
      updates.companyEmailForUser = dto.companyEmailForUser;
    if (dto.companyPhoneForUser !== undefined)
      updates.companyPhoneForUser = dto.companyPhoneForUser;
    if (dto.companyIdNumberForUser !== undefined)
      updates.companyIdNumberForUser = dto.companyIdNumberForUser;

    // Update full name if first/last name changed
    const user = await this.userModel.findById(userId);
    if (dto.firstName || dto.lastName) {
      const firstName = dto.firstName || user?.firstName || '';
      const lastName = dto.lastName || user?.lastName || '';
      updates.name = `${firstName} ${lastName}`.trim();
    }

    const updated = await this.userModel
      .findByIdAndUpdate(userId, updates, { new: true })
      .select('-password')
      .lean();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }

  /**
   * Get tenant/company profile
   */
  async getTenantProfile(tenantId: string) {
    const tenant = await this.tenantModel.findById(tenantId).lean();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  /**
   * Update tenant/company profile
   */
  async updateTenantProfile(tenantId: string, dto: UpdateTenantProfileDto) {
    const updates: Partial<TenantDocument> = {};

    if (dto.companyName !== undefined) {
      updates.companyName = dto.companyName;
      updates.name = dto.companyName; // Keep name in sync
    }
    if (dto.companyDateOfBirth !== undefined) {
      updates.companyDateOfBirth = new Date(dto.companyDateOfBirth);
    }
    if (dto.companyEmail !== undefined) updates.companyEmail = dto.companyEmail;
    if (dto.companyPhone !== undefined) updates.companyPhone = dto.companyPhone;
    if (dto.companyAddress !== undefined)
      updates.companyAddress = dto.companyAddress;

    const updated = await this.tenantModel
      .findByIdAndUpdate(tenantId, updates, { new: true })
      .lean();

    if (!updated) {
      throw new NotFoundException('Tenant not found');
    }

    return updated;
  }
}
