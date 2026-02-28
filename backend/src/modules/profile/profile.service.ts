import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Tenant, TenantDocument } from '../../database/schemas/tenant.schema';
import {
  PublicUserProfile,
  PublicUserProfileDocument,
} from '../../database/schemas/public-user-profile.schema';
import {
  UpdateProfileDto,
  UpdateTenantProfileDto,
  UpdatePublicProfileDto,
} from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(PublicUserProfile.name)
    private readonly publicProfileModel: Model<PublicUserProfileDocument>,
  ) {}

  private normalizeHandle(value: string): string {
    const normalized = (value || '').trim().toLowerCase();
    if (normalized.length < 3 || normalized.length > 30) {
      throw new BadRequestException('Handle is invalid');
    }
    if (!/^[a-z0-9._-]+$/.test(normalized)) {
      throw new BadRequestException('Handle is invalid');
    }
    return normalized;
  }

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  /**
   * Get user personal profile
   */
  async getUserProfile(userId: string) {
    this.toObjectId(userId, 'userId');
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
    this.toObjectId(userId, 'userId');
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
    this.toObjectId(tenantId, 'tenantId');
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
    this.toObjectId(tenantId, 'tenantId');
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

  async getOrCreatePublicProfile(userId: string) {
    const objectId = this.toObjectId(userId, 'userId');
    let profile = await this.publicProfileModel
      .findOne({ userId: objectId })
      .lean();

    if (!profile) {
      const user = await this.userModel.findById(objectId).lean();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const baseHandle = (user.username || user.email.split('@')[0] || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '');

      let handle = baseHandle || `user${user._id}`;
      let suffix = 1;
      // Ensure unique handle

      while (await this.publicProfileModel.exists({ handle })) {
        handle = `${baseHandle || 'user'}${suffix++}`;
      }

      await this.publicProfileModel.create({
        userId: objectId,
        handle,
        visibility: 'PUBLIC',
        isComplete: false,
      });
      profile = await this.publicProfileModel
        .findOne({ userId: objectId })
        .lean();
      if (!profile) {
        throw new NotFoundException('Public profile not found after creation');
      }
    }

    return profile;
  }

  async isHandleAvailable(handle: string, currentUserId?: string) {
    const normalized = this.normalizeHandle(handle);
    const query: Record<string, unknown> = { handle: normalized };
    if (currentUserId) {
      query.userId = { $ne: this.toObjectId(currentUserId, 'currentUserId') };
    }
    const existing = await this.publicProfileModel.findOne(query).lean();
    return !existing;
  }

  async updatePublicProfile(userId: string, dto: UpdatePublicProfileDto) {
    const objectId = this.toObjectId(userId, 'userId');
    const profile = await this.getOrCreatePublicProfile(userId);

    const updates: Partial<PublicUserProfileDocument> = {};

    if (dto.handle && dto.handle !== profile.handle) {
      const normalizedHandle = this.normalizeHandle(dto.handle);
      const available = await this.isHandleAvailable(normalizedHandle, userId);
      if (!available) {
        throw new BadRequestException('Handle is already taken');
      }
      updates.handle = normalizedHandle;
    }

    if (dto.headline !== undefined) updates.headline = dto.headline;
    if (dto.bio !== undefined) updates.bio = dto.bio;
    if (dto.location !== undefined) updates.location = dto.location;
    if (dto.avatarUrl !== undefined) updates.avatarUrl = dto.avatarUrl;
    if (dto.bannerUrl !== undefined) updates.bannerUrl = dto.bannerUrl;
    if (dto.currentTitle !== undefined) updates.currentTitle = dto.currentTitle;
    if (dto.currentCompanyName !== undefined)
      updates.currentCompanyName = dto.currentCompanyName;
    if (dto.skills !== undefined) updates.skills = dto.skills;
    if (dto.experience !== undefined) {
      updates.experience = dto.experience.map((e) => ({
        title: e.title,
        company: e.company,
        startDate: e.startDate ? new Date(e.startDate) : undefined,
        endDate: e.endDate ? new Date(e.endDate) : undefined,
        isCurrent: e.isCurrent,
        location: e.location,
        description: e.description,
      }));
    }
    if (dto.links !== undefined) {
      updates.links = dto.links.map((l) => ({ label: l.label, url: l.url }));
    }
    if (dto.visibility !== undefined) updates.visibility = dto.visibility;

    const updated = await this.publicProfileModel
      .findOneAndUpdate({ userId: objectId }, updates, { new: true })
      .lean();

    if (!updated) {
      throw new NotFoundException('Public profile not found');
    }

    // Recalculate completeness: simple heuristic
    const isComplete = Boolean(
      updated.headline &&
      updated.bio &&
      updated.avatarUrl &&
      updated.experience &&
      updated.experience.length > 0 &&
      updated.skills &&
      updated.skills.length > 0,
    );

    if (updated.isComplete !== isComplete) {
      await this.publicProfileModel.updateOne(
        { userId: objectId },
        { $set: { isComplete } },
      );
      updated.isComplete = isComplete;
    }

    return updated;
  }

  async getPublicProfileByHandle(handle: string) {
    const normalized = handle.toLowerCase();
    const profile = await this.publicProfileModel
      .findOne({ handle: normalized })
      .lean();
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (profile.visibility === 'PRIVATE') {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }
}
