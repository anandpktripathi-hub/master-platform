import * as bcrypt from 'bcryptjs';
import { objectIdToString } from '../../utils/objectIdToString';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Role } from './role.types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type SafeUser = Omit<User, 'password'> & { _id: string };

@Injectable()
export class UsersService {
  private normalizeEmail(email: string): string {
    return String(email || '')
      .trim()
      .toLowerCase();
  }

  private normalizeTenantId(tenantId?: string): Types.ObjectId | null {
    if (!tenantId) return null;
    const trimmed = tenantId.trim();
    if (!trimmed) return null;
    if (!Types.ObjectId.isValid(trimmed)) {
      throw new BadRequestException('Invalid tenantId');
    }
    return new Types.ObjectId(trimmed);
  }

  async countAll(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async countByRole(role: string): Promise<number> {
    return this.userModel.countDocuments({ role });
  }
  async deleteByEmail(email: string): Promise<void> {
    await this.userModel.deleteOne({ email }).exec();
  }
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const email = this.normalizeEmail(createUserDto.email);
    const tenantObjectId = this.normalizeTenantId(createUserDto.tenantId);

    const existing = await this.userModel
      .findOne({ email, tenantId: tenantObjectId })
      .select('_id')
      .lean()
      .exec();
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const doc = await this.userModel.create({
      ...createUserDto,
      email,
      tenantId: tenantObjectId ?? undefined,
      password: hashedPassword,
      role: createUserDto.role || Role.USER,
      isActive: createUserDto.isActive !== false,
      company: createUserDto.company || '',
    });
    const lean = doc.toObject() as User & { password?: string };
    // remove password from lean copy

    delete (lean as { password?: string }).password;

    return {
      ...(lean as Omit<User, 'password'>),
      _id: objectIdToString(doc._id),
    } as SafeUser;
  }

  async bulkCreate(users: CreateUserDto[]) {
    if (!Array.isArray(users) || users.length === 0) {
      return { insertedCount: 0, errors: ['No users provided'] };
    }

    const docs = await Promise.all(
      users.map(async (u) => {
        const email = this.normalizeEmail(u.email);
        const tenantObjectId = this.normalizeTenantId(u.tenantId);
        const hashedPassword = await bcrypt.hash(u.password, 10);
        return {
          ...u,
          email,
          tenantId: tenantObjectId ?? undefined,
          password: hashedPassword,
          role: u.role || Role.USER,
          isActive: u.isActive !== false,
          company: u.company || '',
        };
      }),
    );

    const result = await this.userModel.insertMany(docs, { ordered: false });
    const insertedCount = result.length;

    return {
      insertedCount,
    };
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: SafeUser[]; total: number }> {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;
    const skip = (safePage - 1) * safeLimit;

    const [users, total] = await Promise.all([
      this.userModel
        .find()
        .select('-password')
        .skip(skip)
        .limit(safeLimit)
        .lean()
        .exec(),
      this.userModel.countDocuments(),
    ]);

    const safe = (users as (User & { _id: unknown })[]).map((u) => ({
      ...u,
      _id: String(u._id),
    })) as SafeUser[];

    return { data: safe, total };
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const safe = {
      ...user,

      _id: String(user._id),
    } as SafeUser;
    return safe;
  }

  async update(
    id: string,
    updateDto: UpdateUserDto,
  ): Promise<SafeUser> {
    const update: Record<string, unknown> = { ...updateDto };

    if (typeof updateDto.email === 'string') {
      update.email = this.normalizeEmail(updateDto.email);
    }

    if (typeof updateDto.tenantId === 'string') {
      const tenantObjectId = this.normalizeTenantId(updateDto.tenantId);
      update.tenantId = tenantObjectId ?? undefined;
    }

    if (typeof updateDto.password === 'string' && updateDto.password.trim()) {
      update.password = await bcrypt.hash(updateDto.password, 10);
    } else {
      delete update.password;
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, update, { new: true })
      .select('-password')
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const safe = {
      ...user,

      _id: String(user._id),
    } as SafeUser;
    return safe;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
