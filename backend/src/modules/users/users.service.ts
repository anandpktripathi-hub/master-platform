import * as bcrypt from 'bcryptjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Role } from './role.types';
import { CreateUserDto } from './dto/create-user.dto';

type SafeUser = Omit<User, 'password'> & { _id: string };

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const existing = await this.userModel
      .findOne({ email: createUserDto.email })
      .select('_id')
      .lean()
      .exec();
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const doc = await this.userModel.create({
      ...createUserDto,
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
      _id: String(doc._id),
    } as SafeUser;
  }

  async bulkCreate(users: CreateUserDto[]) {
    if (!Array.isArray(users) || users.length === 0) {
      return { insertedCount: 0, errors: ['No users provided'] };
    }

    const docs = await Promise.all(
      users.map(async (u) => {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        return {
          ...u,
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
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel
        .find()
        .select('-password')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(),
    ]);
    const safe = (users as (User & { _id: unknown })[]).map((u) => ({
      ...u,
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      _id: String(user._id),
    } as SafeUser;
    return safe;
  }

  async update(
    id: string,
    updateDto: Partial<UserDocument>,
  ): Promise<SafeUser> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .lean()
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const safe = {
      ...user,
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
